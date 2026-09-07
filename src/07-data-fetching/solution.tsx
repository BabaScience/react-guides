import { useState, useEffect, useRef } from 'react';

/**
 * MODULE 07: Data Fetching — reference solutions
 *
 * The sandbox exposes only `react` and `react-dom`, so these teach the
 * patterns a data-fetching library implements for you — loading state,
 * debouncing, intervals, cancellation, optimistic UI, caching — on top of
 * plain `fetch`. Writing them once is the best argument for not writing them
 * again in every component.
 */

// ============================================
// EXERCISE 1: useFetch (basic data-fetching hook)
// ============================================

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// One state object rather than three `useState` calls, so a transition can
// never be observed half-applied — `loading: false` with the old `data` still
// in place is not a state this hook can be in.
//
// Resetting to loading at the top of the effect matters when `url` changes:
// otherwise the previous URL's data stays on screen while the new request is
// in flight, and the component claims to have loaded something it has not.
export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then((res) => res.json())
      .then((data: T) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) =>
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        })
      );
  }, [url]);

  return state;
}

// ============================================
// EXERCISE 2: useDebounce
// ============================================

// The cleanup is the debounce. Every time `value` changes React tears down the
// previous effect before running the next one, which clears the pending
// timeout — so only a value that survives `ms` without being replaced ever
// reaches state. Without the cleanup this would be a delay, not a debounce.
export function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);

  return debounced;
}

// ============================================
// EXERCISE 3: useInterval
// ============================================

// The ref is what separates *what to run* from *when to run it*. If `callback`
// were a dependency of the interval effect, every parent render would tear the
// timer down and start a new one — a callback defined inline would reset the
// interval forever and it would never fire.
//
// Reading `ref.current()` inside the tick means the newest callback runs, so
// this also avoids the stale-closure bug where the timer keeps calling the
// version of the function from the first render.
export function useInterval(callback: () => void, ms: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => savedCallback.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

// ============================================
// EXERCISE 4: useAbortable
// ============================================

// This is `useFetch` plus the thing that makes it correct under fast input.
// Requests do not return in the order they were sent, so without cancellation
// whichever finishes last wins — which may be the one you no longer want, and
// the user ends up looking at the wrong record.
//
// `AbortError` is deliberately swallowed: an aborted request is not a failure
// the learner should see, it is a request we chose to discard. Showing it as an
// error would put a red message on screen every time someone types quickly.
export function useAbortable(url: string): FetchState<unknown> {
  const [state, setState] = useState<FetchState<unknown>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: unknown) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}

// ============================================
// EXERCISE 5: useOptimistic
// ============================================

export type ApplyOptimistic<T> = (
  optimisticUpdate: T,
  commit: () => Promise<T>,
) => Promise<void>;

// Showing a guess before you know it is true needs two things: a way back, and
// a way to confirm. `previous` is the way back; replacing state with what
// `commit` resolved to is the confirmation — the server's value, not the guess,
// is what the user ends up looking at.
//
// The error is re-thrown after the rollback so the caller still learns the
// write failed. Swallowing it here would leave the UI correct and the caller
// believing it succeeded.
export function useOptimistic<T>(initial: T): [T, ApplyOptimistic<T>] {
  const [state, setState] = useState<T>(initial);

  const apply: ApplyOptimistic<T> = async (optimisticUpdate, commit) => {
    const previous = state;
    setState(optimisticUpdate);

    try {
      const result = await commit();
      setState(result);
    } catch (err) {
      setState(previous);
      throw err;
    }
  };

  return [state, apply];
}

// ============================================
// EXERCISE 6: createCache (pure factory)
// ============================================

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  has(key: string): boolean;
  clear(): void;
}

// A factory, not a module-level Map — which is what makes each cache
// independent. A shared cache hidden inside a module is the kind of state that
// makes tests pass in isolation and fail when run together.
//
// `has` exists separately from `get` because `undefined` is a legitimate cached
// value: "not present" and "present and undefined" are different answers, and
// only `has` can tell them apart.
export function createCache<T>(): Cache<T> {
  const store = new Map<string, T>();

  return {
    get: (key) => store.get(key),
    set: (key, value) => {
      store.set(key, value);
    },
    has: (key) => store.has(key),
    clear: () => store.clear(),
  };
}
