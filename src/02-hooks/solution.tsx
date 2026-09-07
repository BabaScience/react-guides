import React, { useState, useEffect, useContext, useRef, useMemo, useCallback, useReducer, createContext } from 'react';

/**
 * MODULE 02: React Hooks Deep Dive — reference solutions
 *
 * One way to solve each exercise, not the only way. Same `// EXERCISE N:`
 * layout as index.tsx, so the platform splits this file with the same
 * extractor it uses for the stub. Comments explain *why*.
 */

// ============================================
// EXERCISE 1: useState Counter with Functional Updates
// ============================================

// `setCount(c => c + 1)` rather than `setCount(count + 1)`. Both work for a
// single click, but the functional form is correct even when several updates
// are queued from the same render — each one receives the value the previous
// one produced, instead of all three closing over the same stale `count`.
export const CounterWithFunctionalUpdates: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
    </div>
  );
};

// ============================================
// EXERCISE 2: useEffect Data Fetching
// ============================================

interface User {
  id: number;
  name: string;
  email: string;
}

// The `cancelled` flag is the whole point of the cleanup. Without it, a
// component that unmounts before the request settles still calls setState on
// a component React has thrown away. It also protects against the response of
// a superseded request overwriting a newer one.
//
// Note `res.ok`: fetch only rejects on a network-level failure, so a 404 or a
// 500 arrives here as a perfectly successful promise.
export const DataFetchingComponent: React.FC = () => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((json: User) => {
        if (!cancelled) setData(json);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">Error: {error}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  );
};

// ============================================
// EXERCISE 3: useContext Theme Provider
// ============================================

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// `undefined` as the default is deliberate: it is what lets `useTheme` tell
// "no provider above me" apart from "a provider gave me a value". A default
// object here would make the mistake silent, and the component would quietly
// read a theme nobody is managing.
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  // Memoised so consumers are not re-rendered by a new object identity on
  // every render of the provider. Context has no selectors: any change to this
  // value notifies every consumer beneath it.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

// ============================================
// EXERCISE 4: useRef Focus Management
// ============================================

// A ref is the right tool here precisely because focusing an input changes
// nothing React renders. Putting the element in state would re-render the
// component for no visual benefit — and there is no way to express
// "call .focus() on this node" declaratively.
export const FocusInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={() => inputRef.current?.focus()}>Focus the input</button>
    </div>
  );
};

// ============================================
// EXERCISE 5: useMemo Derived Data
// ============================================

interface Item {
  id: number;
  name: string;
  category: string;
  value: number;
}

interface FilteredListProps {
  items: Item[];
  filter: string;
  sortBy: 'name' | 'value';
}

// Two details that matter more than the memoisation itself:
//
//   - `[...items]` before sorting. `Array.prototype.sort` mutates, and sorting
//     the prop array in place would edit the caller's data during a render.
//   - names compare with `localeCompare`, values compare numerically. Sorting
//     numbers with the default comparator gives lexicographic order, where 10
//     sorts before 3.
export const FilteredList: React.FC<FilteredListProps> = ({ items, filter, sortBy }) => {
  const visible = useMemo(() => {
    return [...items]
      .filter((item) => item.category === filter)
      .sort((a, b) =>
        sortBy === 'name' ? a.name.localeCompare(b.name) : a.value - b.value
      );
  }, [items, filter, sortBy]);

  return (
    <ul>
      {visible.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};

// ============================================
// EXERCISE 6: useCallback Stable References
// ============================================

interface MemoizedChildProps {
  onClick: () => void;
  label: string;
}

export const MemoizedChild: React.FC<MemoizedChildProps> = React.memo(({ onClick, label }) => {
  return <button onClick={onClick}>{label}</button>;
});

// `useCallback` with an empty dependency list keeps one function identity for
// the lifetime of the component, so `MemoizedChild`'s shallow prop comparison
// sees no change and skips its render when `count` or `otherState` moves.
//
// Without it the child re-renders on every parent render, and `React.memo`
// becomes a comparison that always fails — pure cost.
export const ParentWithCallback: React.FC = () => {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(false);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setOtherState((s) => !s)}>Toggle Other</button>
      <MemoizedChild onClick={handleClick} label="Click Me" />
    </div>
  );
};

// ============================================
// EXERCISE 7: useReducer Todo Management
// ============================================

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  nextId: number;
}

type TodoAction =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'CLEAR_COMPLETED' };

// Every branch returns a *new* state object and never edits the old one —
// that is what makes the reducer pure, and what lets React tell that something
// changed. `nextId` lives in state rather than being derived from
// `todos.length`, which would reuse an id after a deletion.
export const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        todos: [...state.todos, { id: state.nextId, text: action.payload, completed: false }],
        nextId: state.nextId + 1,
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        ),
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };

    default:
      return state;
  }
};

export const TodoApp: React.FC = () => {
  const [state, dispatch] = useReducer(todoReducer, { todos: [], nextId: 1 });
  const [draft, setDraft] = useState('');

  // Guarding on the trimmed value keeps whitespace-only entries out. The
  // component decides what is worth dispatching; the reducer decides what a
  // dispatch does to the state.
  const addTodo = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'ADD_TODO', payload: draft.trim() });
    setDraft('');
  };

  return (
    <div>
      <input
        placeholder="Add todo"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {state.todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'DELETE_TODO', payload: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}>Clear completed</button>
    </div>
  );
};
