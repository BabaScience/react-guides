import React, { useState } from 'react';

/**
 * MODULE 01: React Fundamentals — reference solutions
 *
 * One way to solve each exercise, not the only way. The layout mirrors
 * index.tsx exactly — same `// EXERCISE N:` banners — so the platform can
 * split this file with the same extractor it uses for the stub.
 *
 * The comments explain *why*, not what: the what is readable from the code.
 */

// ============================================
// EXERCISE 1: Basic Greeting Component
// ============================================

interface GreetingProps {
  name?: string;
}

// The default lives in the destructuring, so it applies when `name` is absent
// or undefined — but not when it is an empty string, which is why
// `<Greeting name="" />` correctly renders "Hello, !" rather than "Hello, Guest!".
export const Greeting: React.FC<GreetingProps> = ({ name = 'Guest' }) => {
  return <h1>Hello, {name}!</h1>;
};

// ============================================
// EXERCISE 2: User Card with Multiple Props
// ============================================

interface UserCardProps {
  name: string;
  email: string;
  age: number;
}

// Each value gets its own element. Putting them in one node would make the
// element's text "John Doe john@example.com Age: 30", and an exact-text query
// for "John Doe" would no longer match it.
export const UserCard: React.FC<UserCardProps> = ({ name, email, age }) => {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>{email}</p>
      <p>Age: {age}</p>
    </div>
  );
};

// ============================================
// EXERCISE 3: Todo List (Arrays & Keys)
// ============================================

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
}

// `key={todo.id}` — the id belongs to the data, so React keeps each <li> tied
// to its todo when the array is reordered or an item is inserted. An index
// would tie state to the position instead.
//
// The text sits in its own <span> so the completion mark is a sibling: with
// both in the <li>, its text would read "Deploy app ✓" and an exact query for
// "Deploy app" would miss it.
export const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          {todo.completed && <span aria-label="completed"> ✓</span>}
        </li>
      ))}
    </ul>
  );
};

// ============================================
// EXERCISE 4: Counter with State
// ============================================

// Both handlers use the functional form. Here `setCount(count + 1)` would work
// too, but the functional form is correct even when several updates are queued
// in one event — a habit worth forming now rather than debugging later.
export const Counter: React.FC = () => {
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
// EXERCISE 5: Conditional Rendering
// ============================================

interface StatusMessageProps {
  isLoading: boolean;
  error?: string;
  data?: string;
}

// Early returns, in priority order: loading wins over error, error wins over
// data. Returning `null` last is what makes "nothing to say" render nothing —
// a fragment containing an empty string would still put a text node on screen.
export const StatusMessage: React.FC<StatusMessageProps> = ({ isLoading, error, data }) => {
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (data) return <p>{data}</p>;
  return null;
};

// ============================================
// EXERCISE 6: Event Handler Button
// ============================================

interface ActionButtonProps {
  text: string;
  onClick: () => void;
}

// `onClick={onClick}` passes the handler through directly. Writing
// `onClick={() => onClick()}` would also work but creates a new function on
// every render — pointless here, and the thing that defeats React.memo later.
export const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick }) => {
  return (
    <button type="button" onClick={onClick}>
      {text}
    </button>
  );
};

// ============================================
// EXERCISE 7: Controlled Input Form
// ============================================

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
}

// Controlled inputs: `value` comes from state and `onChange` writes back, so
// state is the single source of truth for what the form holds.
//
// `e.preventDefault()` stops the browser's own form submission, which would
// reload the page and throw away the whole app. The <label htmlFor> / <input id>
// pairing is what makes each field findable by its visible name.
export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form aria-label="contact" onSubmit={handleSubmit}>
      <label htmlFor="contact-name">Name</label>
      <input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="contact-email">Email</label>
      <input id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button type="submit">Submit</button>
    </form>
  );
};

// ============================================
// EXERCISE 8: Filtered List with State
// ============================================

interface Item {
  id: number;
  name: string;
  category: string;
}

interface FilteredListProps {
  items: Item[];
}

// The filtered array is derived during render from `items` and `search`. It is
// not state and does not belong in one: storing it would mean keeping two
// values in step, and they would eventually disagree.
//
// Both sides are lowercased so the comparison is case-insensitive.
export const FilteredList: React.FC<FilteredListProps> = ({ items }) => {
  const [search, setSearch] = useState('');

  const visible = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="search"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {visible.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};
