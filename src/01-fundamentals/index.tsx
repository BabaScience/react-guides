import React, { useState } from 'react';

/**
 * MODULE 01: React Fundamentals
 */

// ============================================
// EXERCISE 1: Basic Greeting Component
// ============================================

/**
 * OBJECTIVE: Create a Greeting component that displays a personalized message.
 *
 * INSTRUCTIONS:
 * - Accept a 'name' prop (optional, defaults to 'Guest').
 * - Render: "Hello, [name]!"
 * - Use TypeScript for type safety.
 */

interface GreetingProps {
  name?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ name = 'Guest' }) => {
  // TODO: Implement greeting component
  // Should render: "Hello, [name]!"
  // Use `name` from the props (default already wired above).
  return null;
};

// ============================================
// EXERCISE 2: User Card with Multiple Props
// ============================================

/**
 * OBJECTIVE: Create a UserCard component with multiple typed props.
 *
 * INSTRUCTIONS:
 * - Accept name, email, and age props.
 * - Display user information in a card format.
 * - Use proper TypeScript interfaces.
 */

interface UserCardProps {
  name: string;
  email: string;
  age: number;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, age }) => {
  // TODO: Implement user card component
  // Should display: name, email, and age
  // Hint: render them inside a single parent element (e.g. a <div>).
  return null;
};

// ============================================
// EXERCISE 3: Todo List (Arrays & Keys)
// ============================================

/**
 * OBJECTIVE: Render a list of items with proper key management.
 *
 * INSTRUCTIONS:
 * - Accept an array of todos.
 * - Render each todo with a unique key.
 * - Display todo text and completion status.
 */

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
}

export const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  // TODO: Implement todo list
  // Remember: each list item needs a unique `key` prop!
  // Use the .map() method to render each todo inside a <ul>.
  return null;
};

// ============================================
// EXERCISE 4: Counter with State
// ============================================

/**
 * OBJECTIVE: Create a counter component using the useState hook.
 *
 * INSTRUCTIONS:
 * - Use useState to manage the count.
 * - Provide an increment and a decrement button.
 * - Display the current count value.
 */

export const Counter: React.FC = () => {
  // TODO: Implement counter using useState
  // Should have an increment button and a decrement button.
  // Display the current value as: "Count: <number>"
  return null;
};

// ============================================
// EXERCISE 5: Conditional Rendering
// ============================================

/**
 * OBJECTIVE: Implement conditional rendering based on props.
 *
 * INSTRUCTIONS:
 * - Show loading state when isLoading is true.
 * - Show error message when error exists.
 * - Show data when available.
 * - Priority: loading > error > data.
 */

interface StatusMessageProps {
  isLoading: boolean;
  error?: string;
  data?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ isLoading, error, data }) => {
  // TODO: Implement conditional rendering
  // Priority: loading > error > data
  // Tests expect:
  //   - loading: any element whose text contains "loading" (e.g. "Loading...")
  //   - error: the error string rendered exactly as received (no prefix!)
  //   - data:  the data string rendered exactly as received
  // Suggested forms:
  //   if (isLoading) return <div>Loading...</div>;
  //   if (error)     return <div>{error}</div>;
  //   if (data)      return <div>{data}</div>;
  //   return null;
  return null;
};

// ============================================
// EXERCISE 6: Event Handler Button
// ============================================

/**
 * OBJECTIVE: Create a button that handles click events.
 *
 * INSTRUCTIONS:
 * - Accept onClick callback prop.
 * - Handle button click events.
 * - Display button text.
 */

interface ActionButtonProps {
  text: string;
  onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick }) => {
  // TODO: Implement button with click handler
  // Render a <button> that wires onClick and shows the `text` prop as its label.
  return null;
};

// ============================================
// EXERCISE 7: Controlled Input Form
// ============================================

/**
 * OBJECTIVE: Create a form with controlled input components.
 *
 * INSTRUCTIONS:
 * - Use useState to manage form state.
 * - Create controlled input fields.
 * - Handle form submission.
 * - Display form data.
 */

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  // TODO: Implement controlled form
  // 1. Use useState for `name` and `email`.
  // 2. Render two controlled <input>s (value + onChange).
  // 3. Render a <form> with a submit <button>. On submit:
  //    - call e.preventDefault()
  //    - call onSubmit({ name, email })
  return null;
};

// ============================================
// EXERCISE 8: Filtered List with State
// ============================================

/**
 * OBJECTIVE: Create a list with filtering capabilities.
 *
 * INSTRUCTIONS:
 * - Use useState to manage filter state.
 * - Filter items based on a search term.
 * - Display filtered results.
 * - Provide a search input.
 */

interface Item {
  id: number;
  name: string;
  category: string;
}

interface FilteredListProps {
  items: Item[];
}

export const FilteredList: React.FC<FilteredListProps> = ({ items }) => {
  // TODO: Implement filtered list
  // 1. Use useState to hold the search term.
  // 2. Render an <input> bound to it (controlled).
  // 3. Render a <ul> with the items whose name matches the search term
  //    (case-insensitive — use .toLowerCase() on both sides).
  return null;
};
