import React, { useState, useReducer, createContext, useContext } from 'react';

/**
 * MODULE 06: State Management — reference solutions
 *
 * The sandbox exposes only `react` and `react-dom`, so each exercise
 * hand-rolls the minimal version of an idea that Redux, Zustand or Jotai
 * would otherwise provide. That is the point: these are small enough to read.
 */

// ============================================
// EXERCISE 1: createStore (Observable Store)
// ============================================

export interface Store<T> {
  getState: () => T;
  setState: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
}

// This is the whole of an external store, in twenty lines: a value, a set of
// listeners, and a notify. It lives outside React entirely — which is exactly
// why a store scales where one large context does not. React components
// subscribe and compare what they selected; unrelated changes cost them nothing.
//
// A `Set` rather than an array so unsubscribing is O(1) and a listener
// registered twice is held once. Iterating over a copy means a listener that
// unsubscribes during a notify cannot corrupt the iteration.
export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,

    setState: (next) => {
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      for (const listener of [...listeners]) listener();
    },

    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

// ============================================
// EXERCISE 2: useCounterReducer (useReducer Hook)
// ============================================

export interface CounterState {
  count: number;
}

export type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

// The reducer sits outside the hook so it is created once rather than on every
// render, and so it can be unit-tested without rendering anything — a plain
// function from (state, action) to state.
//
// The `default` branch returning the same object matters: returning a fresh
// `{ ...state }` would make every unknown action look like a change.
const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
};

export function useCounterReducer(): [CounterState, React.Dispatch<CounterAction>] {
  return useReducer(counterReducer, { count: 0 });
}

// ============================================
// EXERCISE 3: combineReducers (Reducer Composition)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Reducer<S = any, A = any> = (state: S, action: A) => S;

// Redux's actual trick, and it is this small. Each slice reducer sees only its
// own slice and every action, so a single dispatch can update several slices
// without any of them knowing about the others.
//
// A fresh object is built rather than mutating `state`, which is what keeps the
// root reducer pure and lets consumers detect change by identity.
export function combineReducers<S extends Record<string, unknown>>(
  reducers: { [K in keyof S]: Reducer<S[K], unknown> }
): Reducer<S, unknown> {
  return (state: S, action: unknown): S => {
    const next = {} as S;
    for (const key in reducers) {
      next[key] = reducers[key](state[key], action);
    }
    return next;
  };
}

// ============================================
// EXERCISE 4: useToggle (Boolean Hook)
// ============================================

// The smallest useful custom hook, and a complete example of what a hook is:
// state plus the operations that belong with it, named once and reused.
//
// `(v) => !v` rather than `!on` so two toggles queued in the same event each
// see the previous result instead of both flipping from the same value.
export function useToggle(initial: boolean): [boolean, () => void] {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v) => !v);
  return [on, toggle];
}

// ============================================
// EXERCISE 5: CountContext + CountProvider + useCount
// ============================================

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
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);

  return (
    <CountContext.Provider value={{ count, increment }}>{children}</CountContext.Provider>
  );
};

// `null` as the default and a throwing hook are a pair. Together they turn
// "used outside a provider" from a confusing undefined read somewhere later
// into a named error at the exact call site. Consumers never check for null —
// the hook already did.
export function useCount(): CountContextValue {
  const ctx = useContext(CountContext);
  if (!ctx) throw new Error('useCount must be used within a CountProvider');
  return ctx;
}

// ============================================
// EXERCISE 6: useLocalStorage (Persistent State Hook)
// ============================================

// Two defensive details, both earned:
//
//   - the initialiser is a *function*, so the read happens once on mount
//     rather than on every render;
//   - it is wrapped in try/catch, because stored JSON can be corrupt, and
//     `localStorage` itself throws in private mode and when a browser is set
//     to block site data. A crash on mount is a bad trade for a cached value.
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  const set = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage full or blocked — keep the in-memory value working.
    }
  };

  return [value, set];
}
