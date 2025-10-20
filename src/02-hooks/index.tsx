import React, { useState, useEffect, useContext, useRef, useMemo, useCallback, useReducer, createContext } from 'react';

/**
 * MODULE 02: React Hooks Deep Dive
 * 
 * ANGULAR DEVELOPER NOTES:
 * - Hooks replace Angular lifecycle methods (ngOnInit, ngOnDestroy, etc.)
 * - useState replaces component properties and state management
 * - useEffect handles side effects like data fetching and subscriptions
 * - useContext replaces Angular services for dependency injection
 * - useRef replaces @ViewChild for DOM access
 * - useMemo/useCallback optimize performance (similar to Angular OnPush)
 * - useReducer replaces complex state logic (similar to NgRx reducers)
 */

// ============================================
// EXERCISE 1: useState Counter with Functional Updates
// ============================================

/**
 * OBJECTIVE: Create a counter component using useState with functional updates
 * 
 * ANGULAR EQUIVALENT: Component properties with methods
 * 
 * INSTRUCTIONS:
 * - Use useState to manage count state
 * - Provide increment and decrement buttons
 * - Use functional updates to prevent stale state issues
 * - Display current count value
 */

export const CounterWithFunctionalUpdates: React.FC = () => {
  // TODO: Implement counter using useState with functional updates
  // Should have increment and decrement buttons
  // Use: setCount(prevCount => prevCount + 1)
  // Display: "Count: [number]"
  return null;
};

// ============================================
// EXERCISE 2: useEffect Data Fetching
// ============================================

/**
 * OBJECTIVE: Implement data fetching with useEffect and proper cleanup
 * 
 * ANGULAR EQUIVALENT: ngOnInit + ngOnDestroy lifecycle hooks
 * 
 * INSTRUCTIONS:
 * - Use useEffect to fetch data on component mount
 * - Handle loading, success, and error states
 * - Implement cleanup to prevent memory leaks
 * - Use abort controller or cancellation flag
 */

interface User {
  id: number;
  name: string;
  email: string;
}

export const DataFetchingComponent: React.FC = () => {
  // TODO: Implement data fetching with useEffect
  // States: loading, data, error
  // Fetch: https://jsonplaceholder.typicode.com/users/1
  // Cleanup: prevent setState after unmount
  return null;
};

// ============================================
// EXERCISE 3: useContext Theme Provider
// ============================================

/**
 * OBJECTIVE: Create a theme context provider and consumer
 * 
 * ANGULAR EQUIVALENT: Injectable service with dependency injection
 * 
 * INSTRUCTIONS:
 * - Create ThemeContext with createContext
 * - Create ThemeProvider component with useState
 * - Create useTheme custom hook
 * - Create ThemeToggle component that consumes context
 */

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Implement theme provider
  // Use useState for theme state
  // Provide toggleTheme function
  return null;
};

export const useTheme = () => {
  // TODO: Implement useTheme hook
  // Use useContext to get theme context
  // Throw error if used outside provider
  return null;
};

export const ThemeToggle: React.FC = () => {
  // TODO: Implement theme toggle component
  // Use useTheme hook to get theme and toggle function
  // Display current theme and toggle button
  return null;
};

// ============================================
// EXERCISE 4: useRef Focus Management
// ============================================

/**
 * OBJECTIVE: Use useRef to manage focus on input elements
 * 
 * ANGULAR EQUIVALENT: @ViewChild for DOM element access
 * 
 * INSTRUCTIONS:
 * - Use useRef to create input reference
 * - Create button that focuses the input when clicked
 * - Handle focus management properly
 */

export const FocusInput: React.FC = () => {
  // TODO: Implement focus management with useRef
  // Use useRef to create input reference
  // Button should focus input when clicked
  return null;
};

// ============================================
// EXERCISE 5: useMemo Derived Data
// ============================================

/**
 * OBJECTIVE: Use useMemo to optimize expensive calculations
 * 
 * ANGULAR EQUIVALENT: Computed properties or OnPush change detection
 * 
 * INSTRUCTIONS:
 * - Create component that filters and sorts data
 * - Use useMemo to memoize filtered/sorted results
 * - Accept filter and sort parameters as props
 * - Verify memoization works correctly
 */

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

export const FilteredList: React.FC<FilteredListProps> = ({ items, filter, sortBy }) => {
  // TODO: Implement filtered list with useMemo
  // Filter items by category
  // Sort by name or value
  // Use useMemo to prevent unnecessary recalculations
  return null;
};

// ============================================
// EXERCISE 6: useCallback Stable References
// ============================================

/**
 * OBJECTIVE: Use useCallback to create stable function references
 * 
 * ANGULAR EQUIVALENT: Arrow functions in templates (performance optimization)
 * 
 * INSTRUCTIONS:
 * - Create parent component with multiple state variables
 * - Create memoized child component
 * - Use useCallback for event handlers passed to child
 * - Verify child doesn't re-render unnecessarily
 */

interface MemoizedChildProps {
  onClick: () => void;
  label: string;
}

export const MemoizedChild: React.FC<MemoizedChildProps> = React.memo(({ onClick, label }) => {
  // TODO: Implement memoized child component
  // Log when component renders
  // Display label and button
  return null;
});

export const ParentWithCallback: React.FC = () => {
  // TODO: Implement parent with useCallback
  // Multiple state variables
  // useCallback for onClick handler
  // Pass handler to MemoizedChild
  return null;
};

// ============================================
// EXERCISE 7: useReducer Todo Management
// ============================================

/**
 * OBJECTIVE: Implement todo management using useReducer
 * 
 * ANGULAR EQUIVALENT: NgRx store with reducers and actions
 * 
 * INSTRUCTIONS:
 * - Create todo reducer with add, toggle, delete actions
 * - Use useReducer to manage todo state
 * - Create components for adding and displaying todos
 * - Handle complex state updates properly
 */

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

export const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  // TODO: Implement todo reducer
  // Handle ADD_TODO, TOGGLE_TODO, DELETE_TODO, CLEAR_COMPLETED
  return state;
};

export const TodoApp: React.FC = () => {
  // TODO: Implement todo app with useReducer
  // Use useReducer with todoReducer
  // Create form to add todos
  // Display list of todos with toggle/delete buttons
  return null;
};
