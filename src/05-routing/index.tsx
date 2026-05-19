import React, { useState } from 'react';

/**
 * MODULE 05: Routing
 *
 * The in-browser sandbox only resolves `react` and `react-dom` — there is
 * no `react-router-dom`. We learn routing by building a mini-router from
 * scratch. The current `path` is always passed in as a prop, never read
 * from `window.location`, so every exercise stays pure and testable.
 */

// ============================================
// EXERCISE 1: match (Pattern Matching)
// ============================================

/**
 * OBJECTIVE: A pure function that matches a URL pattern against a path
 * and extracts dynamic parameters.
 *
 * CONTRACT:
 * - Signature: `match(pattern: string, path: string): Record<string, string> | null`
 * - Pattern segments starting with `:` are parameters (e.g. `:id`).
 * - Static segments must match the path segment literally.
 * - On match, return an object mapping each `:name` to the matched value.
 * - On mismatch (different segment count or static segment differs), return null.
 *
 * EXAMPLES:
 *   match('/users/:id', '/users/42')        // { id: '42' }
 *   match('/x', '/y')                        // null
 *   match('/a/:x/b/:y', '/a/1/b/2')          // { x: '1', y: '2' }
 *   match('/users', '/users')                // {}
 *   match('/users/:id', '/users/42/extra')   // null
 */
export function match(pattern: string, path: string): Record<string, string> | null {
  // TODO: split both strings by '/', compare segment-by-segment.
  // If pattern segment starts with ':', capture it. Otherwise it must equal the path segment.
  void pattern; void path;
  return null as never;
}

// ============================================
// EXERCISE 2: parseQuery (Query String Parser)
// ============================================

/**
 * OBJECTIVE: A pure function that parses a query string into an object.
 *
 * CONTRACT:
 * - Signature: `parseQuery(qs: string): Record<string, string>`
 * - Accepts strings with or without a leading `?`.
 * - Empty string returns `{}`.
 * - Values are kept as strings (never coerced to numbers).
 *
 * EXAMPLES:
 *   parseQuery('?a=1&b=2')   // { a: '1', b: '2' }
 *   parseQuery('a=1')        // { a: '1' }
 *   parseQuery('')           // {}
 */
export function parseQuery(qs: string): Record<string, string> {
  // TODO: strip a leading '?', split on '&', split each piece on '=',
  // and return the accumulated key/value pairs.
  void qs;
  return null as never;
}

// ============================================
// EXERCISE 3: Link (Client-side Navigation Anchor)
// ============================================

/**
 * OBJECTIVE: An anchor that intercepts clicks and triggers client-side navigation.
 *
 * CONTRACT:
 * - Props: `to: string`, `navigate: (to: string) => void`, `children: React.ReactNode`.
 * - Render: `<a href={to} onClick={...}>{children}</a>`.
 * - onClick MUST call `e.preventDefault()` and then `navigate(to)` — in that order.
 */

interface LinkProps {
  to: string;
  navigate: (to: string) => void;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, navigate, children }) => {
  // TODO: render an <a href={to}> whose onClick prevents the default
  // browser navigation and then calls navigate(to).
  void to; void navigate; void children;
  return null;
};

// ============================================
// EXERCISE 4: Route (Conditional Path Match)
// ============================================

/**
 * OBJECTIVE: A component that renders its children only when its `path`
 * matches the current path.
 *
 * CONTRACT:
 * - Props: `path: string`, `currentPath: string`, `children: React.ReactNode`.
 * - Returns `{children}` when `path === currentPath`.
 * - Returns `null` otherwise.
 *
 * (Exact-string comparison only — no pattern matching in this exercise.)
 */

interface RouteProps {
  path: string;
  currentPath: string;
  children: React.ReactNode;
}

export const Route: React.FC<RouteProps> = ({ path, currentPath, children }) => {
  // TODO: return children when path === currentPath, otherwise null.
  void path; void currentPath; void children;
  return null;
};

// ============================================
// EXERCISE 5: useNavigate (Navigation Hook)
// ============================================

/**
 * OBJECTIVE: A custom hook that owns the current path and exposes a navigate fn.
 *
 * CONTRACT:
 * - Signature: `useNavigate(initial: string): [path: string, navigate: (to: string) => void]`
 * - Internally uses `useState(initial)` to hold the path.
 * - `navigate(to)` sets the path to `to`.
 * - Returns a tuple — index 0 is the current path, index 1 is the navigate fn.
 */
export function useNavigate(initial: string): [string, (to: string) => void] {
  // TODO: useState(initial) for the current path; return [path, setPath].
  void initial;
  return null as never;
}

// ============================================
// EXERCISE 6: ProtectedRoute (Auth Gate)
// ============================================

/**
 * OBJECTIVE: A wrapper that renders its children only for authenticated users,
 * otherwise renders a fallback.
 *
 * CONTRACT:
 * - Props: `isAuthenticated: boolean`, `children: React.ReactNode`, `fallback: React.ReactNode`.
 * - When `isAuthenticated` is true, render `{children}`.
 * - When `isAuthenticated` is false, render `{fallback}`.
 */

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
  fallback,
}) => {
  // TODO: return children when authenticated, fallback otherwise.
  void isAuthenticated; void children; void fallback;
  return null;
};

// Silence "useState imported but unused" until learners wire up useNavigate.
void useState;
