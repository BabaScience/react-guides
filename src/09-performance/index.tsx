import React, { useState, useRef, useEffect } from 'react';

/**
 * MODULE 09: Performance Optimization
 *
 * Each exercise illustrates a primitive used to keep React apps fast:
 * memoization, stable references, render-count introspection, debouncing,
 * and windowed (virtualized) list rendering.
 *
 * Sandbox constraint: ONLY `react` and `react-dom` are available — no
 * third-party libraries, no `react-window`, no `lodash.debounce`.
 */

// ============================================
// EXERCISE 1: MemoizedChild (React.memo)
// ============================================

/**
 * OBJECTIVE: A child component wrapped in `React.memo` that does not re-render
 * when its `value` prop is unchanged (by referential equality).
 *
 * INSTRUCTIONS:
 * - Wrap the component definition in `React.memo(...)`.
 * - On every render, increment the module-level `MEMOIZED_RENDERS` counter.
 * - Render a <span>{value}</span> for assertion purposes.
 *
 * NOTE: tests reset the counter via the exported `resetMemoizedRenders()`
 * in `beforeEach`. The parent in the test will hold an unrelated piece of
 * state and pass the same `value` to MemoizedChild — re-renders of the
 * parent must NOT bump MEMOIZED_RENDERS.
 */

export let MEMOIZED_RENDERS = 0;
export const getMemoizedRenders = (): number => MEMOIZED_RENDERS;
export const resetMemoizedRenders = (): void => { MEMOIZED_RENDERS = 0; };

interface MemoizedChildProps {
  value: string;
}

// TODO: wrap this implementation in React.memo so identical `value` props
// short-circuit the re-render.
export const MemoizedChild: React.FC<MemoizedChildProps> = (_props) => {
  void _props;
  // Stub does NOT increment the counter so default state is "0 renders".
  return null;
};

// ============================================
// EXERCISE 2: useExpensiveCalc (useMemo)
// ============================================

/**
 * OBJECTIVE: A hook that runs an expensive calculation only when `n` changes.
 *
 * INSTRUCTIONS:
 * - Signature: `useExpensiveCalc(n: number, calc: (n: number) => number): number`.
 * - Internally call `calc(n)` inside a `useMemo` whose dependency array is `[n]`.
 *   The `calc` reference must NOT be in the deps — tests pass a brand-new
 *   `jest.fn()` per render and assert it's only invoked when `n` changes.
 * - Return the memoized result.
 */

export function useExpensiveCalc(
  n: number,
  calc: (n: number) => number,
): number {
  // TODO: return useMemo(() => calc(n), [n]);
  void n; void calc;
  return 0;
}

// ============================================
// EXERCISE 3: useStableCallback
// ============================================

/**
 * OBJECTIVE: Return a stable function reference that always invokes the
 * LATEST `fn` closure — without forcing memoized consumers to re-render.
 *
 * INSTRUCTIONS:
 * - Signature: `useStableCallback<T extends (...args: any[]) => any>(fn: T): T`.
 * - Use a `useRef` to hold the latest `fn`; update `ref.current = fn` on each
 *   render (synchronously, NOT inside useEffect, so the very first call
 *   already sees the latest closure).
 * - Use a `useCallback` with an empty deps array that calls `ref.current(...args)`.
 * - Return that stable callback cast as `T`.
 *
 * Tests capture the returned reference across renders, assert
 * `firstRef === secondRef`, then call it and assert that the LATEST closure
 * (which reads the latest state) was the one invoked.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
  // TODO:
  //   const ref = useRef(fn); ref.current = fn;
  //   return useCallback(((...args: any[]) => ref.current(...args)) as T, []);
  void fn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((..._args: any[]) => undefined) as T;
}

// ============================================
// EXERCISE 4: useRenderCount
// ============================================

/**
 * OBJECTIVE: A hook that reports how many times the component using it has
 * rendered, including the current render.
 *
 * INSTRUCTIONS:
 * - Use a `useRef` initialized to 0.
 * - On every render, increment `ref.current` BEFORE returning it.
 * - Return `ref.current` as a `number`.
 *
 * Tests trigger re-renders by clicking a button that bumps local state, and
 * assert that the displayed render count grows.
 */

export function useRenderCount(): number {
  // TODO:
  //   const ref = useRef(0);
  //   ref.current += 1;
  //   return ref.current;
  return 0;
}

// ============================================
// EXERCISE 5: useDebouncedValue
// ============================================

/**
 * OBJECTIVE: Return a debounced version of `value` that only updates after
 * `ms` milliseconds have passed without `value` changing.
 *
 * INSTRUCTIONS:
 * - Signature: `useDebouncedValue<T>(value: T, ms: number): T`.
 * - Hold the debounced value in `useState(value)`.
 * - In a `useEffect` keyed on `[value, ms]`, schedule `setDebounced(value)`
 *   via `setTimeout(..., ms)` and return a cleanup that clears the timer.
 * - Return the debounced state.
 *
 * Tests use `jest.useFakeTimers()` + `jest.advanceTimersByTime(...)` and
 * verify that intermediate updates DO NOT cause the debounced consumer to
 * receive new values until the timeout elapses.
 */

export function useDebouncedValue<T>(value: T, ms: number): T {
  // TODO: useState + useEffect with setTimeout / clearTimeout.
  void value; void ms;
  // Reference unused imports to satisfy linting during stub phase.
  void useEffect; void useState;
  return value;
}

// ============================================
// EXERCISE 6: VirtualList (windowed rendering)
// ============================================

/**
 * OBJECTIVE: Render only the visible slice of a large list — the classic
 * "windowing" technique used by react-window / react-virtualized.
 *
 * INSTRUCTIONS:
 * - Props:
 *     items: string[]
 *     itemHeight: number       // fixed pixel height of every row
 *     windowHeight: number     // pixel height of the visible viewport
 *     scrollTop: number        // current scroll offset (controlled by parent)
 * - Compute:
 *     startIndex = Math.floor(scrollTop / itemHeight)
 *     endIndex   = startIndex + Math.ceil(windowHeight / itemHeight) + 1
 *   (The `+ 1` over-renders one row so the bottom never tears during scroll.)
 * - Render a single `<ul>` containing only the items in `[startIndex, endIndex)`
 *   — each as an `<li>` whose text is the item string.
 * - `endIndex` should be clamped to `items.length` when slicing (Array.slice
 *   already handles this, so no extra math required).
 *
 * Tests scroll to different `scrollTop` values and assert that:
 *   - off-screen items are NOT in the DOM
 *   - on-screen items ARE in the DOM
 *   - the rendered <li> count matches the visible window
 *
 * Performance note: the wrapper <ul> here is intentionally simple. A real
 * virtual list also offsets visible rows (via translateY or padding) so the
 * scrollbar geometry stays correct — that's out of scope for this exercise.
 */

interface VirtualListProps {
  items: string[];
  itemHeight: number;
  windowHeight: number;
  scrollTop: number;
}

export const VirtualList: React.FC<VirtualListProps> = ({
  items,
  itemHeight,
  windowHeight,
  scrollTop,
}) => {
  // TODO:
  //   const start = Math.floor(scrollTop / itemHeight);
  //   const end   = start + Math.ceil(windowHeight / itemHeight) + 1;
  //   return (
  //     <ul>
  //       {items.slice(start, end).map((item, i) => (
  //         <li key={start + i}>{item}</li>
  //       ))}
  //     </ul>
  //   );
  void items; void itemHeight; void windowHeight; void scrollTop;
  return null;
};
