import type { TestRunResult } from '@/types/exercise';

/**
 * Parent half of the isolated runner: owns the frame, the handshake and the RPC.
 *
 * The frame is `<iframe sandbox="allow-scripts">` with no `allow-same-origin`,
 * which puts it on an opaque origin. Learner code inside it gets SecurityError
 * for `localStorage` and for `parent.document`, so it can neither read the
 * learner's saved progress nor reach into the app's UI.
 *
 * PLAN.md P2.2 deferred this on the grounds that a cross-origin frame "can't
 * load our modules without serving the sandbox from its own origin", i.e. a
 * deployment change. It doesn't need one: the bundle is fetched by the *parent*
 * (an ordinary same-origin request) and handed to the frame as inline text, so
 * nothing is ever fetched from the opaque origin and no CORS is involved.
 *
 * Each run gets a fresh frame. Reuse would be faster, but a frame is also the
 * kill switch — see `runInIsolatedFrame`.
 */

/** Where the sandbox build lands. Served from `public/` in dev and in prod. */
const SANDBOX_BUNDLE_URL = '/sandbox-host.js';

/** How long the frame has to boot before we give up on it. */
const HANDSHAKE_TIMEOUT_MS = 15_000;

let bundleSource: Promise<string> | null = null;

/** Fetch the runtime once per session; it is a static asset and never varies. */
function loadBundleSource(): Promise<string> {
  if (!bundleSource) {
    bundleSource = fetch(SANDBOX_BUNDLE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const type = res.headers.get('content-type') ?? '';
        // A dev server that SPA-falls-back to index.html answers 200 with HTML.
        // Treating that as the runtime would fail deep inside the frame with an
        // unreadable syntax error — the §4.2(b) failure shape, so check here.
        if (type.includes('text/html')) {
          throw new Error('server returned HTML — run `npm run sandbox:build`');
        }
        return res.text();
      })
      .then((text) => {
        if (text.trimStart().startsWith('<')) {
          throw new Error('bundle looks like HTML — run `npm run sandbox:build`');
        }
        return text;
      })
      .catch((e) => {
        // Don't cache a failure; a rebuild should be picked up on the next run.
        bundleSource = null;
        throw new Error(
          `Could not load the exercise runtime (${e instanceof Error ? e.message : String(e)}).`
        );
      });
  }
  return bundleSource;
}

export interface IsolatedRunRequest {
  /** CommonJS, already transpiled and loop-guarded by the caller. */
  userCode: string;
  spec: string;
  exerciseNumber: number;
  timeoutMs: number;
}

/**
 * Run one exercise inside a throwaway isolated frame.
 *
 * Resolves with the frame's `TestRunResult`, or rejects if the runtime could
 * not be loaded or the frame died. Timeouts are the caller's to impose — but
 * `dispose()` genuinely stops the work, which in-page `eval` could never do:
 * removing the frame tears down its event loop, its timers and its pending
 * promises. A runaway `setInterval` used to survive its own "timeout".
 */
export async function runInIsolatedFrame(
  request: IsolatedRunRequest
): Promise<{ result: Promise<TestRunResult>; dispose: () => void }> {
  const source = await loadBundleSource();

  const frame = document.createElement('iframe');
  // No `allow-same-origin`: that single omission is what makes the origin
  // opaque. Adding it back would silently restore full access to the app.
  //
  // `allow-forms` is needed because the browser otherwise blocks form
  // submission outright, so a `<button type="submit">` fires no submit event
  // and every controlled-form spec fails with "onSubmit was never called".
  // It permits submitting a form; it grants no access to the parent or its
  // origin, and without `allow-top-navigation` the frame still cannot navigate
  // anything but itself.
  frame.setAttribute('sandbox', 'allow-scripts allow-forms');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('title', 'Exercise runner');
  // Off-screen, but genuinely laid out and visible. `display:none`,
  // `visibility:hidden` or a 0×0 box would all be simpler and all break the
  // tests: user-event v14 refuses to type into or click an element it computes
  // as invisible, so specs would fail with an input whose value never changed.
  // A real viewport also gives the render something plausible to measure.
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0';

  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener('message', onMessage);
    frame.remove();
  };

  let settle: (outcome: { ok: true; value: TestRunResult } | { ok: false; error: Error }) => void;
  const outcome = new Promise<
    { ok: true; value: TestRunResult } | { ok: false; error: Error }
  >((resolve) => {
    settle = resolve;
  });

  const requestId = 1;

  function onMessage(event: MessageEvent) {
    // The frame is the only opaque-origin sender we talk to, but the window
    // receives messages from anywhere — match on the source frame, not origin
    // (an opaque origin is reported as the string "null" and proves nothing).
    if (event.source !== frame.contentWindow) return;
    const data = event.data as
      | { type: 'ready' }
      | { type: 'result'; id: number; result: TestRunResult }
      | { type: 'error'; id: number; message: string }
      | undefined;
    if (!data) return;

    if (data.type === 'ready') {
      // Booting is the only thing this deadline covers. Leaving it armed would
      // abort a perfectly healthy long run — a spec driving `user.type` across
      // several fields takes well over the boot budget — and report it as a
      // runtime that never started. The caller's `timeoutMs` owns the run.
      window.clearTimeout(handshake);
      frame.contentWindow?.postMessage({ type: 'run', id: requestId, ...request }, '*');
      return;
    }
    if (data.type === 'result' && data.id === requestId) {
      settle({ ok: true, value: data.result });
      return;
    }
    if (data.type === 'error' && data.id === requestId) {
      settle({ ok: false, error: new Error(data.message) });
    }
  }

  // Declared before the listener is registered so `onMessage` can clear it.
  // No message can arrive before this line runs — the frame is appended below,
  // and delivery is asynchronous either way.
  const handshake = window.setTimeout(() => {
    settle({ ok: false, error: new Error('The exercise runtime did not start.') });
  }, HANDSHAKE_TIMEOUT_MS);

  window.addEventListener('message', onMessage);

  // `srcdoc` is set as a property, so the DOM handles attribute escaping. What
  // it does not handle is a literal `</script` inside the bundle: the HTML
  // parser would end the element early and dump the rest as text. The sequence
  // is only legal in JS inside a string, where the escape is equivalent.
  const inlineSafe = source.replace(/<\/script/gi, '<\\/script');

  // The act flag is set in its own earlier script, not inside the bundle:
  // ES imports are hoisted, so anything the bundle's entry module assigns runs
  // *after* React and @testing-library have already initialised and read it.
  frame.srcdoc =
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<script>window.IS_REACT_ACT_ENVIRONMENT = true;</' + 'script>' +
    '</head><body>' +
    `<script>${inlineSafe}</` + 'script>' +
    '</body></html>';
  document.body.appendChild(frame);

  const result = outcome.then((settled) => {
    window.clearTimeout(handshake);
    if (settled.ok) return settled.value;
    throw settled.error;
  });

  return { result, dispose };
}
