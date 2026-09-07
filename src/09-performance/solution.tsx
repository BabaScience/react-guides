import React, { useState, useRef, useEffect } from 'react';

/**
 * MODULE 09: Performance — reference solutions
 *
 * Every one of these is a tool for doing *less work*, and every one has a
 * cost. The order that matters in practice: measure first, then ship less,
 * then render less, and only then memoise.
 */

// ============================================
// EXERCISE 1: MemoizedChild (React.memo)
// ============================================

export let MEMOIZED_RENDERS = 0;
export const getMemoizedRenders = (): number => MEMOIZED_RENDERS;
export const resetMemoizedRenders = (): void => { MEMOIZED_RENDERS = 0; };

interface MemoizedChildProps {
  value: string;
}

// `React.memo` compares props *shallowly* and skips the render when nothing
// changed. A string prop compares by value, so an unchanged `value` short-
// circuits — which is exactly why this works here and would not if the parent
// passed `style={{}}` or an inline arrow: those are a new object every render,
// and the comparison would always fail.
//
// Memo is not free. It costs a comparison on every parent render, so it earns
// its place on components that are expensive or render often, not by default.
export const MemoizedChild: React.FC<MemoizedChildProps> = React.memo(({ value }) => {
  MEMOIZED_RENDERS += 1;
  return <span>{value}</span>;
});

// ============================================
// EXERCISE 2: useExpensiveCalc (useMemo)
// ============================================

// `useMemo` caches the *result* while the dependencies are unchanged. The
// dependency array is the whole contract: list too little and you serve a
// stale value, list too much and you recompute for nothing.
//
// Note this is a cache, not a guarantee — React may discard memoised values.
// Never put something a component depends on for correctness in here.
export function useExpensiveCalc(n: number, calc: (n: number) => number): number {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // `React.useMemo`, not a named import: the reassembled file uses the stub's
  // import line, which brings in only useState/useRef/useEffect. A solution
  // has to live within the imports the exercise actually gives the learner.
  return React.useMemo(() => calc(n), [n]);
}

// ============================================
// EXERCISE 3: useStableCallback
// ============================================

// One identity forever, always calling the newest function. The ref holds the
// latest `fn`; the `useCallback` with empty deps never changes identity, so a
// memoised child sees a prop that never moves.
//
// This is the escape hatch for the case `useCallback` handles badly: a handler
// that genuinely depends on fresh values but must not change identity. The
// trade is that it is never safe as a dependency of anything — it deliberately
// lies about when it changed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.useCallback(((...args: any[]) => ref.current(...args)) as T, []);
}

// ============================================
// EXERCISE 4: useRenderCount
// ============================================

// A ref, not state — incrementing state here would trigger a render, which
// would increment again, forever. A ref changes without telling React, which
// is precisely what a render counter needs.
//
// Incrementing during render is a side effect in render, which React does not
// promise to run exactly once. That is acceptable for a debugging aid and
// would not be for anything the UI depends on.
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// ============================================
// EXERCISE 5: useDebouncedValue
// ============================================

// The cleanup is the debounce: each new value tears down the pending timeout
// before scheduling its own, so only a value that survives `ms` untouched ever
// lands. Without the cleanup this is a delay, and every intermediate keystroke
// would still arrive — just late.
export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);

  return debounced;
}

// ============================================
// EXERCISE 6: VirtualList (windowed rendering)
// ============================================

interface VirtualListProps {
  items: string[];
  itemHeight: number;
  windowHeight: number;
  scrollTop: number;
}

// The insight is that the problem was never how fast a row renders — it is how
// many rows exist. Ten thousand nodes is a large DOM to build, lay out and
// keep; twenty is not. So compute which slice the viewport covers and mount
// only that.
//
// The `+ 1` over-renders one row so the bottom edge never tears mid-scroll.
// The key is `start + i`, the item's index in the full list rather than in the
// slice — a slice-relative key would make React reuse row 0's DOM for a
// different item on every scroll.
//
// Worth knowing the cost: rows that are not mounted cannot be found by
// `Ctrl+F` or by a screen reader. Virtualisation is a real trade, not a
// free win.
export const VirtualList: React.FC<VirtualListProps> = ({
  items,
  itemHeight,
  windowHeight,
  scrollTop,
}) => {
  const start = Math.floor(scrollTop / itemHeight);
  const end = start + Math.ceil(windowHeight / itemHeight) + 1;

  return (
    <ul>
      {items.slice(start, end).map((item, i) => (
        <li key={start + i}>{item}</li>
      ))}
    </ul>
  );
};
