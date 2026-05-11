/**
 * Extract example props for the live preview from a test file.
 *
 * Strategy: parse the test file with Babel's AST, find the first JSX element
 * whose name matches `componentName`, and evaluate each of its attributes.
 *
 * Identifiers referenced in attributes (e.g. `<TodoList todos={mockTodos} />`)
 * are resolved by looking up top-level `const mockTodos = …` declarations in
 * the same test file. Functions get stubbed to `() => {}` so callback props
 * like `onClick` and `onSubmit` are always valid.
 *
 * Anything we can't resolve is silently dropped — the preview will still
 * render, just without that prop. This is a best-effort, not a full evaluator.
 */

// Babel AST nodes have wildly different shapes per node kind, so a permissive
// type with any-typed property access keeps this file readable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = { type: string; [key: string]: any };

interface ParserLike {
  parse: (code: string, options: Record<string, unknown>) => AnyNode;
}

let parserPromise: Promise<ParserLike> | null = null;

async function getParser(): Promise<ParserLike> {
  if (!parserPromise) {
    parserPromise = import('@babel/standalone').then((mod) => {
      // Babel/standalone exposes the underlying parser via `packages.parser`.
      // It's not in the top-level types, so we cast through unknown.
      const pkgs = (mod as unknown as { packages: { parser: ParserLike } }).packages;
      return pkgs.parser;
    });
  }
  return parserPromise;
}

export async function extractExampleProps(
  testSource: string,
  componentName: string
): Promise<Record<string, unknown>> {
  if (!testSource || !componentName) return {};

  let ast: AnyNode;
  try {
    const parser = await getParser();
    // @babel/parser returns a File node wrapping the Program. Walk handles both.
    ast = parser.parse(testSource, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
  } catch {
    return {};
  }

  // 1. Build a scope of top-level `const NAME = <expr>` declarations.
  const scope = new Map<string, unknown>();
  walk(ast, (node) => {
    if (node.type === 'VariableDeclaration' && node.kind === 'const') {
      for (const d of node.declarations || []) {
        if (d.id?.type === 'Identifier' && d.init) {
          try {
            scope.set(d.id.name, evalNode(d.init, scope));
          } catch {
            // skip — un-evaluatable initializer
          }
        }
      }
    }
  });

  // 2. Find ALL JSXElements whose opening tag matches componentName, in
  //    document order. We merge their props (first-occurrence wins for each
  //    key) so a single test that uses `<Comp a={...} />` and another test
  //    that uses `<Comp b={...} />` together expose BOTH `a` and `b` in the
  //    Props panel.
  const targets: AnyNode[] = [];
  walk(ast, (node) => {
    if (node.type === 'JSXElement') {
      const name = node.openingElement?.name;
      if (name?.type === 'JSXIdentifier' && name.name === componentName) {
        targets.push(node);
      }
    }
  });

  if (targets.length === 0) return {};

  // 3. Walk each instance's attributes (and spreads), merging into `out`.
  //    `out[key]` is set only once — subsequent occurrences are ignored.
  const out: Record<string, unknown> = {};
  for (const target of targets) {
    const attrs: AnyNode[] = target.openingElement?.attributes || [];
    for (const attr of attrs) {
      if (attr.type === 'JSXSpreadAttribute') {
        try {
          const spread = evalNode(attr.argument, scope);
          if (spread && typeof spread === 'object') {
            for (const [k, v] of Object.entries(spread as Record<string, unknown>)) {
              if (!(k in out)) out[k] = v;
            }
          }
        } catch {
          // skip
        }
        continue;
      }
      if (attr.type !== 'JSXAttribute') continue;
      const aname = attr.name?.name;
      if (!aname || aname in out) continue;

      const value = attr.value;
      if (value == null) {
        // <Comp flag /> → flag === true
        out[aname] = true;
        continue;
      }
      if (value.type === 'StringLiteral') {
        out[aname] = value.value;
        continue;
      }
      if (value.type === 'JSXExpressionContainer') {
        try {
          out[aname] = evalNode(value.expression, scope);
        } catch {
          // For typed callback props, leave a no-op so the component doesn't crash.
          if (/^on[A-Z]/.test(aname)) out[aname] = () => {};
        }
      }
    }
  }

  return out;
}

// --- tiny AST evaluator -----------------------------------------------------

function walk(node: AnyNode | null | undefined, visit: (n: AnyNode) => void): void {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'range') continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => walk(c as AnyNode, visit));
    else if (v && typeof v === 'object' && (v as AnyNode).type) walk(v as AnyNode, visit);
  }
}

function evalNode(node: AnyNode, scope: Map<string, unknown>): unknown {
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'TemplateLiteral': {
      const quasis: AnyNode[] = node.quasis;
      const expressions: AnyNode[] = node.expressions;
      let out = '';
      for (let i = 0; i < quasis.length; i++) {
        out += quasis[i].value?.cooked || '';
        if (i < expressions.length) out += String(evalNode(expressions[i], scope));
      }
      return out;
    }
    case 'Identifier': {
      const name = node.name;
      if (scope.has(name)) return scope.get(name);
      if (name === 'undefined') return undefined;
      throw new Error('unresolved identifier: ' + name);
    }
    case 'ArrayExpression':
      return (node.elements as (AnyNode | null)[]).map((el) =>
        el ? evalNode(el, scope) : undefined
      );
    case 'ObjectExpression': {
      const obj: Record<string, unknown> = {};
      for (const p of node.properties as AnyNode[]) {
        if (p.type === 'ObjectProperty') {
          let keyStr: string;
          if (!p.computed && p.key.type === 'Identifier') keyStr = p.key.name;
          else if (p.key.type === 'StringLiteral') keyStr = p.key.value;
          else if (p.key.type === 'NumericLiteral') keyStr = String(p.key.value);
          else continue;
          obj[keyStr] = evalNode(p.value, scope);
        } else if (p.type === 'SpreadElement') {
          const spread = evalNode(p.argument, scope);
          if (spread && typeof spread === 'object') Object.assign(obj, spread);
        }
      }
      return obj;
    }
    case 'UnaryExpression': {
      const arg = evalNode(node.argument, scope);
      if (node.operator === '-') return -(arg as number);
      if (node.operator === '+') return +(arg as number);
      if (node.operator === '!') return !arg;
      throw new Error('unsupported unary: ' + node.operator);
    }
    case 'MemberExpression': {
      const object = evalNode(node.object, scope) as Record<string, unknown>;
      const key = node.computed
        ? (evalNode(node.property, scope) as string | number)
        : node.property.name;
      return object != null ? object[key as string] : undefined;
    }
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      // Stub out: we don't execute test function bodies.
      return () => {};
    case 'CallExpression': {
      // Support `jest.fn()` and `vi.fn()` → noop.
      const callee = node.callee;
      if (
        callee.type === 'MemberExpression' &&
        callee.property?.type === 'Identifier' &&
        callee.property.name === 'fn'
      ) {
        return () => {};
      }
      throw new Error('unsupported call expression');
    }
    case 'TSAsExpression':
    case 'TSTypeAssertion':
    case 'TSNonNullExpression':
      return evalNode(node.expression, scope);
    default:
      throw new Error('unsupported node: ' + node.type);
  }
}
