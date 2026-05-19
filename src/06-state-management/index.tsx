import React, { useState, useReducer, createContext, useContext } from 'react';

/**
 * MODULE 06: State Management
 *
 * Sandbox runtime exposes ONLY `react` and `react-dom` — no Redux, Zustand,
 * or Jotai. Each exercise teaches a core state-management concept by
 * hand-rolling a minimal version that fits inside that constraint.
 */

// ============================================
// EXERCISE 1: createStore (Observable Store)
// ============================================

/**
 * OBJECTIVE: A tiny pub/sub store — the heart of every external state library.
 *
 * INSTRUCTIONS:
 * - `createStore<T>(initial: T)` returns an object with three methods:
 *     getState(): T
 *     setState(next: T | ((prev: T) => T)): void
 *     subscribe(fn: () => void): () => void
 * - `setState` accepts a value OR an updater fn (like React's setState).
 * - After updating, call every subscriber.
 * - `subscribe` returns an unsubscribe function that removes the listener.
 */

export interface Store<T> {
  getState: () => T;
  setState: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
}

export function createStore<T>(initial: T): Store<T> {
  // TODO: hold `state` and a Set/array of listeners.
  //   - getState returns state
  //   - setState: if next is a function, call it with current state; else use next.
  //     Then notify every listener.
  //   - subscribe adds listener and returns a fn that removes it.
  void initial;
  return {
    getState: () => null as never,
    setState: () => {},
    subscribe: () => () => {},
  };
}

// ============================================
// EXERCISE 2: useCounterReducer (useReducer Hook)
// ============================================

/**
 * OBJECTIVE: A counter hook backed by useReducer.
 *
 * INSTRUCTIONS:
 * - State shape: `{ count: number }`. Initial state: `{ count: 0 }`.
 * - Actions:
 *     { type: 'increment' } -> count + 1
 *     { type: 'decrement' } -> count - 1
 *     { type: 'reset' }     -> count = 0
 * - Return `[state, dispatch]` exactly like useReducer.
 * - Unknown action types should return the current state unchanged.
 */

export interface CounterState {
  count: number;
}

export type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

export function useCounterReducer(): [CounterState, React.Dispatch<CounterAction>] {
  // TODO: define a pure reducer and return useReducer(reducer, { count: 0 }).
  void useReducer;
  return [null as never, () => {}];
}

// ============================================
// EXERCISE 3: combineReducers (Reducer Composition)
// ============================================

/**
 * OBJECTIVE: Reproduce Redux's `combineReducers` — compose slice reducers
 * into a single root reducer.
 *
 * INSTRUCTIONS:
 * - Take a map `{ [key: string]: (sliceState, action) => sliceState }`.
 * - Return a single reducer `(rootState, action) => rootState` that:
 *     - For each key, runs the matching sub-reducer on `rootState[key]`.
 *     - Returns a new object containing every slice result keyed by `key`.
 * - The function must be pure (no mutation of the input state).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Reducer<S = any, A = any> = (state: S, action: A) => S;

export function combineReducers<S extends Record<string, unknown>>(
  reducers: { [K in keyof S]: Reducer<S[K], unknown> }
): Reducer<S, unknown> {
  // TODO: return (state, action) => {
  //   const next = {} as S;
  //   for (const key in reducers) next[key] = reducers[key](state[key], action);
  //   return next;
  // };
  void reducers;
  return (state: S) => state;
}

// ============================================
// EXERCISE 4: useToggle (Boolean Hook)
// ============================================

/**
 * OBJECTIVE: A reusable boolean toggle hook.
 *
 * INSTRUCTIONS:
 * - Signature: `useToggle(initial: boolean): [on: boolean, toggle: () => void]`.
 * - Hold the boolean with useState.
 * - `toggle` flips the value — use the functional updater `(v) => !v`
 *   so it's safe inside event handlers / batched updates.
 */

export function useToggle(initial: boolean): [boolean, () => void] {
  // TODO: const [on, setOn] = useState(initial); toggle = () => setOn(v => !v).
  void useState; void initial;
  return [false, () => {}];
}

// ============================================
// EXERCISE 5: CountContext + CountProvider + useCount
// ============================================

/**
 * OBJECTIVE: A typed Context API setup with a guarded consumer hook.
 *
 * INSTRUCTIONS:
 * - Build `CountContext` with a value of `{ count: number; increment: () => void }`,
 *   defaulting to `null` so we can detect "used outside provider".
 * - `CountProvider` owns `count` via useState (initial 0) and exposes
 *   `{ count, increment }` through the context.
 * - `useCount` reads the context and THROWS if the value is null
 *   (i.e. the hook is called outside a `<CountProvider>`).
 */

export interface CountContextValue {
  count: number;
  increment: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CountContext = createContext<CountContextValue | null>(null);

interface CountProviderProps {
  children: React.ReactNode;
}

export const CountProvider: React.FC<CountProviderProps> = ({ children }) => {
  // TODO: useState for count, define increment, wrap children in
  // <CountContext.Provider value={{ count, increment }}>.
  void children;
  return null;
};

export function useCount(): CountContextValue {
  // TODO: const ctx = useContext(CountContext);
  //       if (!ctx) throw new Error('useCount must be used within a CountProvider');
  //       return ctx;
  void useContext;
  return null as never;
}

// ============================================
// EXERCISE 6: useLocalStorage (Persistent State Hook)
// ============================================

/**
 * OBJECTIVE: A useState-like hook that persists its value in localStorage.
 *
 * INSTRUCTIONS:
 * - Signature: `useLocalStorage<T>(key: string, initial: T): [T, (next: T) => void]`.
 * - On init (lazy useState), read `localStorage.getItem(key)`:
 *     - If null OR JSON.parse throws, fall back to `initial`.
 *     - Otherwise return the parsed value.
 * - The setter must:
 *     - Update React state.
 *     - Write `JSON.stringify(next)` to `localStorage` under `key`.
 *
 * Tip: wrap the read in `try/catch` so a corrupt value cannot crash mount.
 */

export function useLocalStorage<T>(key: string, initial: T): [T, (next: T) => void] {
  // TODO:
  //   const [value, setValue] = useState<T>(() => {
  //     try {
  //       const raw = localStorage.getItem(key);
  //       return raw == null ? initial : (JSON.parse(raw) as T);
  //     } catch {
  //       return initial;
  //     }
  //   });
  //   const set = (next: T) => {
  //     setValue(next);
  //     localStorage.setItem(key, JSON.stringify(next));
  //   };
  //   return [value, set];
  void key; void initial;
  return [initial, () => {}];
}
