import React, { useState } from 'react';

/**
 * MODULE 05: Routing — reference solutions
 *
 * A mini-router built from scratch: the sandbox resolves only `react` and
 * `react-dom`, so there is no react-router here. The current path is always a
 * prop, never read from `window.location`, which is what keeps every piece
 * pure and testable.
 */

// ============================================
// EXERCISE 1: match (Pattern Matching)
// ============================================

// Segment-by-segment, because that is what path matching actually is. A regex
// would work but hides the two rules that matter: a `:name` segment captures
// anything, and any other segment must be equal.
//
// The length check comes first and is not optional — `/users/:id` must not
// match `/users` or `/users/42/extra`. Captured values stay strings: `'42'`
// never becomes `42`, which is why route params always need parsing.
export function match(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const expected = patternParts[i];
    const actual = pathParts[i];

    if (expected.startsWith(':')) {
      params[expected.slice(1)] = actual;
    } else if (expected !== actual) {
      return null;
    }
  }

  return params;
}

// ============================================
// EXERCISE 2: parseQuery (Query String Parser)
// ============================================

// The query string is not part of route matching at all — it is a separate
// bag of strings hanging off the end of the URL, which is why it gets its own
// parser and its own hook in a real router.
//
// The empty-string guard matters: `''.split('&')` yields `['']`, which would
// otherwise produce a `{ '': '' }` entry.
export function parseQuery(qs: string): Record<string, string> {
  const trimmed = qs.startsWith('?') ? qs.slice(1) : qs;
  if (!trimmed) return {};

  const result: Record<string, string> = {};
  for (const pair of trimmed.split('&')) {
    if (!pair) continue;
    const [key, value = ''] = pair.split('=');
    result[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return result;
}

// ============================================
// EXERCISE 3: Link (Client-side Navigation Anchor)
// ============================================

interface LinkProps {
  to: string;
  navigate: (to: string) => void;
  children: React.ReactNode;
}

// This is the entire difference between `<Link>` and `<a>`, in two lines.
// The real `href` stays, so the link can be opened in a new tab, copied, and
// read by a screen reader as a link. `preventDefault()` then stops the browser
// from throwing the document away and rebuilding it — which is what would take
// every piece of in-memory state with it.
export const Link: React.FC<LinkProps> = ({ to, navigate, children }) => {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};

// ============================================
// EXERCISE 4: Route (Conditional Path Match)
// ============================================

interface RouteProps {
  path: string;
  currentPath: string;
  children: React.ReactNode;
}

// Returning null unmounts the non-matching route rather than hiding it. A
// hidden route would keep its state, keep running its effects, and still be
// found by queries — "not rendered" and "not visible" are different things.
export const Route: React.FC<RouteProps> = ({ path, currentPath, children }) => {
  return path === currentPath ? <>{children}</> : null;
};

// ============================================
// EXERCISE 5: useNavigate (Navigation Hook)
// ============================================

// Returning a tuple rather than an object is the `useState` convention, and it
// is what lets each caller name the pair whatever suits it — `[path, go]` here,
// `[route, setRoute]` there — without renaming keys.
//
// A real router would also push to the History API here so the back button
// works; the state is the part worth learning first.
export function useNavigate(initial: string): [string, (to: string) => void] {
  const [path, setPath] = useState(initial);
  return [path, setPath];
}

// ============================================
// EXERCISE 6: ProtectedRoute (Auth Gate)
// ============================================

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

// Worth being clear about what this is and is not. It is a way to avoid
// showing someone a broken empty page, and it runs on a machine they control —
// anyone can edit the bundle or call the API directly. The server still has to
// authorise every request. A guard is user experience, never security.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
  fallback,
}) => {
  return <>{isAuthenticated ? children : fallback}</>;
};
