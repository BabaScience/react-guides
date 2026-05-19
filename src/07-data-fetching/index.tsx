import { useState, useEffect, useRef } from 'react';

/**
 * MODULE 07: Data Fetching
 *
 * Sandbox runtime exposes only `react` and `react-dom`. We therefore teach the
 * core *patterns* (loading state, debouncing, intervals, cancellation,
 * optimistic UI, caching) on top of `fetch`, which can be mocked in tests via
 * `global.fetch = jest.fn()`. No React Query / SWR / Axios needed.
 */

// ============================================
// EXERCISE 1: useFetch (basic data-fetching hook)
// ============================================

/**
 * OBJECTIVE: A generic hook that fetches JSON from a URL.
 *
 * CONTRACT:
 * - Signature: `useFetch<T>(url: string): { data: T | null; loading: boolean; error: string | null }`
 * - On mount AND whenever `url` changes:
 *     1. set `loading = true`, `error = null`, `data = null`
 *     2. call `fetch(url)`, then `.json()`
 *     3. on success: set `data` to the parsed body, `loading = false`
 *     4. on failure (rejected promise OR throw): set `error` to the message string,
 *        `data = null`, `loading = false`
 * - Initial render must already return `{ data: null, loading: true, error: null }`.
 *
 * HINT: use `useEffect` with `[url]` as the dependency array.
 */

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string): FetchState<T> {
  // TODO:
  //   1. useState for { data, loading, error } (initial: data=null, loading=true, error=null)
  //   2. useEffect on [url] that calls fetch(url).then(r => r.json()).then(setData) / .catch(setError)
  //   3. Always end up with loading=false after the request settles
  void url;
  return { data: null, loading: true, error: null };
}

// ============================================
// EXERCISE 2: useDebounce
// ============================================

/**
 * OBJECTIVE: Return a debounced copy of `value` that only updates after `ms`
 * milliseconds have passed with no further changes. Classic search-input helper.
 *
 * CONTRACT:
 * - Signature: `useDebounce<T>(value: T, ms: number): T`
 * - On the very first render, return the initial `value` immediately.
 * - Whenever `value` changes, start a timeout of `ms` ms. When it fires, update
 *   the returned value. If `value` changes again before the timeout fires, the
 *   previous timeout must be cancelled (cleanup) so the old value is never set.
 *
 * HINT: useState for the debounced value, useEffect on [value, ms] with
 *       setTimeout + a cleanup returning clearTimeout(id).
 */

export function useDebounce<T>(value: T, ms: number): T {
  // TODO:
  //   1. const [debounced, setDebounced] = useState(value)
  //   2. useEffect(() => { const id = setTimeout(() => setDebounced(value), ms); return () => clearTimeout(id); }, [value, ms])
  //   3. return debounced
  void ms;
  return value;
}

// ============================================
// EXERCISE 3: useInterval
// ============================================

/**
 * OBJECTIVE: Run `callback` every `ms` milliseconds. When `ms` is `null`, the
 * interval is paused. Latest callback is always used (no stale closures).
 *
 * CONTRACT:
 * - Signature: `useInterval(callback: () => void, ms: number | null): void`
 * - When `ms === null`, no interval should be running.
 * - When `ms` is a number, `callback` is invoked roughly every `ms` ms.
 * - Changing the callback prop between renders must NOT restart the interval;
 *   the new callback should be invoked on the next tick. Store the callback in
 *   a ref and read `ref.current()` from inside the interval.
 * - On unmount or when `ms` changes, the previous interval must be cleared.
 */

export function useInterval(callback: () => void, ms: number | null): void {
  // TODO:
  //   1. const ref = useRef(callback)
  //   2. useEffect(() => { ref.current = callback }, [callback])   // keep ref fresh
  //   3. useEffect(() => {
  //        if (ms === null) return;
  //        const id = setInterval(() => ref.current(), ms);
  //        return () => clearInterval(id);
  //      }, [ms])
  void callback; void ms;
  // suppress unused-ref lint until implemented
  useRef(callback);
}

// ============================================
// EXERCISE 4: useAbortable
// ============================================

/**
 * OBJECTIVE: Same shape as `useFetch`, but cancels the in-flight request when
 * the component unmounts OR `url` changes (avoids state-on-unmounted warnings
 * and prevents stale responses overwriting newer ones).
 *
 * CONTRACT:
 * - Signature: `useAbortable(url: string): { data: unknown; loading: boolean; error: string | null }`
 * - Create a `new AbortController()` inside the effect; pass `controller.signal`
 *   to `fetch(url, { signal })`.
 * - Cleanup must call `controller.abort()`.
 * - When the promise rejects because of an abort (error.name === 'AbortError'),
 *   do NOT update state — the component either unmounted or a newer fetch is
 *   already in flight.
 */

export function useAbortable(url: string): FetchState<unknown> {
  // TODO:
  //   1. useState for { data, loading, error }
  //   2. useEffect on [url]:
  //        const controller = new AbortController();
  //        fetch(url, { signal: controller.signal })
  //          .then(r => r.json())
  //          .then(setData)
  //          .catch(err => { if (err.name !== 'AbortError') setError(err.message); });
  //        return () => controller.abort();
  void url;
  return { data: null, loading: true, error: null };
}

// ============================================
// EXERCISE 5: useOptimistic
// ============================================

/**
 * OBJECTIVE: Immediate-feedback UI: render an "optimistic" value right away,
 * then reconcile with the actual server response. Roll back on failure.
 *
 * CONTRACT:
 * - Signature:
 *     `useOptimistic<T>(initial: T): [T, (optimisticUpdate: T, commit: () => Promise<T>) => Promise<void>]`
 * - The returned `state` starts equal to `initial`.
 * - Calling `apply(optimisticValue, commit)`:
 *     1. Remember the current value as `previous`.
 *     2. Synchronously set state to `optimisticValue`.
 *     3. `await commit()`.
 *     4. On success: replace state with the resolved value from `commit`.
 *     5. On rejection: restore state to `previous` and re-throw the error.
 *
 * NOTE: tests call `apply(...)` and `await` it directly. Make sure the
 * returned promise resolves only after the commit (or rejects with the same
 * error your commit threw).
 */

export type ApplyOptimistic<T> = (
  optimisticUpdate: T,
  commit: () => Promise<T>,
) => Promise<void>;

export function useOptimistic<T>(initial: T): [T, ApplyOptimistic<T>] {
  // TODO:
  //   1. const [state, setState] = useState<T>(initial)
  //   2. const apply: ApplyOptimistic<T> = async (optimisticUpdate, commit) => {
  //        const previous = state;                  // capture BEFORE overwriting
  //        setState(optimisticUpdate);
  //        try {
  //          const result = await commit();
  //          setState(result);
  //        } catch (err) {
  //          setState(previous);
  //          throw err;
  //        }
  //      };
  //   3. return [state, apply]
  void initial;
  const noop: ApplyOptimistic<T> = async () => undefined;
  return [initial, noop];
}

// ============================================
// EXERCISE 6: createCache (pure factory)
// ============================================

/**
 * OBJECTIVE: A tiny, framework-free in-memory cache used as a stepping stone
 * toward proper request caching. Pure JS — no React APIs.
 *
 * CONTRACT:
 * - `createCache<T>()` returns an object with:
 *     - `get(key: string): T | undefined`     — `undefined` when the key is absent
 *     - `set(key: string, value: T): void`    — overwrites any existing value
 *     - `has(key: string): boolean`           — true iff `key` was set
 *     - `clear(): void`                       — removes every entry
 * - Each call to `createCache` returns an INDEPENDENT cache (no shared state
 *   between caches).
 *
 * HINT: a closed-over `Map<string, T>` is the simplest implementation.
 */

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  has(key: string): boolean;
  clear(): void;
}

export function createCache<T>(): Cache<T> {
  // TODO: return an object backed by a Map<string, T>
  return {
    get: (_key: string) => undefined,
    set: (_key: string, _value: T) => undefined,
    has: (_key: string) => false,
    clear: () => undefined,
  };
}

// Effect dependency satisfier (keeps lint quiet when you don't need useEffect)
void useState; void useEffect;
