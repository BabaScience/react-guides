/**
 * Makes `while (true) {}` recoverable.
 *
 * Learner code runs on the main thread, so a synchronous infinite loop freezes
 * the tab: no timer fires, no promise settles, and the "Run tests" click can
 * never be undone. Losing unsaved work to a missing `i++` is a bad first
 * experience, and a `Promise.race` timeout cannot help — the race never gets a
 * turn.
 *
 * The fix is to make the loop itself yield a verdict: every loop body gets a
 * guard call that throws once a deadline passes. The guard is placed using
 * offsets from a real parse, never a regex, so `"while (true)"` inside a string
 * or a comment is left alone.
 *
 * A worker or a cross-origin frame could be killed from outside and would not
 * need this, but neither can run React DOM tests against the app's own document.
 */

const GUARD = '__loopGuard';

interface AnyNode {
  type: string;
  start?: number;
  end?: number;
  body?: AnyNode | AnyNode[];
  [key: string]: unknown;
}

const LOOP_TYPES = new Set([
  'WhileStatement',
  'DoWhileStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
]);

let parserPromise: Promise<{ parse: (code: string, opts: object) => AnyNode }> | null = null;

function getParser() {
  if (!parserPromise) {
    parserPromise = import('@babel/parser').then(
      (mod) => mod as unknown as { parse: (code: string, opts: object) => AnyNode }
    );
  }
  return parserPromise;
}

function walk(node: AnyNode | AnyNode[] | null | undefined, visit: (n: AnyNode) => void): void {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (typeof node.type !== 'string') return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (value && typeof value === 'object') walk(value as AnyNode, visit);
  }
}

/**
 * The guard's definition, prepended to the module.
 *
 * The deadline is refreshed by an interval rather than fixed at module load.
 * That distinction is the whole trick: timers only fire when the main thread
 * yields, so during normal execution the deadline keeps moving out of reach and
 * a legitimately long run — many tests, each typing character by character —
 * never trips it. The moment the thread stops yielding, the refresh stops with
 * it and the deadline goes stale, so a runaway is caught within one budget
 * regardless of how long the run had already been going.
 *
 * A fixed deadline gets both halves wrong: too short and it fails honest slow
 * tests, too long and a stuck learner waits it out.
 *
 * `& 255` keeps the clock read off the hot path — a tight loop checks about
 * once every few hundred iterations.
 */
function prelude(budgetMs: number, label: string): string {
  return (
    `let ${GUARD}__n = 0; let ${GUARD}__deadline = Date.now() + ${budgetMs}; ` +
    `const ${GUARD}__tick = setInterval(() => { ${GUARD}__deadline = Date.now() + ${budgetMs}; }, 200); ` +
    // Don't leave a timer running per test run for the life of the page.
    `setTimeout(() => clearInterval(${GUARD}__tick), 120000); ` +
    `function ${GUARD}() { if ((++${GUARD}__n & 255) === 0 && Date.now() > ${GUARD}__deadline) ` +
    `{ clearInterval(${GUARD}__tick); throw new Error(${JSON.stringify(label)}); } }\n`
  );
}

/**
 * Insert a guard call at the top of every loop body.
 *
 * Returns the source unchanged if it cannot be parsed — a syntax error is the
 * transpiler's to report, with a better message than anything produced here.
 */
export async function withLoopGuard(
  source: string,
  budgetMs: number,
  label: string
): Promise<string> {
  let ast: AnyNode;
  try {
    const parser = await getParser();
    ast = parser.parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    });
  } catch {
    return source;
  }

  /** Edits as {at, insert} plus optional brace wrapping, applied back-to-front. */
  const edits: { at: number; text: string }[] = [];

  walk(ast, (node) => {
    if (!LOOP_TYPES.has(node.type)) return;
    const body = node.body as AnyNode | undefined;
    if (!body || typeof body.start !== 'number' || typeof body.end !== 'number') return;

    if (body.type === 'BlockStatement') {
      // Insert just inside the opening brace.
      edits.push({ at: body.start + 1, text: `${GUARD}();` });
    } else {
      // `while (x) doThing();` — wrap the single statement so the guard has
      // somewhere to live without changing what the loop does.
      edits.push({ at: body.start, text: `{${GUARD}();` });
      edits.push({ at: body.end, text: '}' });
    }
  });

  if (edits.length === 0) return source;

  edits.sort((a, b) => b.at - a.at);
  let out = source;
  for (const { at, text } of edits) out = out.slice(0, at) + text + out.slice(at);

  return prelude(budgetMs, label) + out;
}
