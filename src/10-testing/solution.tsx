import React from 'react';

/**
 * MODULE 10: Testing — reference solutions
 *
 * A meta-module: the runner grading these IS the harness they teach. Each
 * exercise is small on purpose — the lesson is in the spec that exercises it,
 * not in the implementation.
 */

// ============================================
// EXERCISE 1: sum (basic equality)
// ============================================

// The smallest possible unit under test, and the point of it: a pure function
// needs no setup, no mocks and no DOM. Tests that are this cheap to write are
// the ones that actually get written.
export function sum(a: number, b: number): number {
  return a + b;
}

// ============================================
// EXERCISE 2: capitalize (edge cases)
// ============================================

// The empty-string guard is the whole exercise. `''.charAt(0)` is `''` and
// `''.slice(1)` is `''`, so this happens to work without the guard — but
// relying on that is how a function acquires behaviour nobody chose. The
// spec names the edge case, so the code should answer it explicitly.
export function capitalize(s: string): string {
  if (s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================
// EXERCISE 3: Greeting (rendering + jest-dom)
// ============================================

interface GreetingProps {
  name: string;
}

// One element containing the whole sentence, so `getByText('Hello, Ada!')`
// matches. Splitting the name into its own `<span>` would break an exact-text
// query — the element's text would be "Hello, " and the assertion would fail
// on markup, not behaviour.
export const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return <p>Hello, {name}!</p>;
};

// ============================================
// EXERCISE 4: useCounter (hook testing)
// ============================================

// A hook cannot be called outside a component, so it is tested through one —
// a small wrapper that puts the state in the DOM and the actions on buttons.
// That is not a workaround; it is testing the hook the way it is actually used.
//
// Functional updates so two calls in one event each see the previous result.
export function useCounter(initial: number): {
  count: number;
  increment: () => void;
  decrement: () => void;
} {
  const [count, setCount] = React.useState(initial);

  return {
    count,
    increment: () => setCount((c) => c + 1),
    decrement: () => setCount((c) => c - 1),
  };
}

// ============================================
// EXERCISE 5: EventEmitter (jest.fn + unsubscribe)
// ============================================

type Listener = (...args: unknown[]) => void;

// `emit` on an unknown event is a no-op rather than a throw — subscribing and
// emitting are usually written by different people at different times, and a
// pub/sub that explodes on an unheard event is hostile.
//
// `emit` iterates a *copy*: a listener that calls `off` during the emit would
// otherwise mutate the array being walked and silently skip the next one.
export class EventEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, fn: Listener): void {
    const existing = this.listeners.get(event);
    if (existing) existing.push(fn);
    else this.listeners.set(event, [fn]);
  }

  off(event: string, fn: Listener): void {
    const existing = this.listeners.get(event);
    if (!existing) return;
    this.listeners.set(
      event,
      existing.filter((listener) => listener !== fn)
    );
  }

  emit(event: string, ...args: unknown[]): void {
    const existing = this.listeners.get(event);
    if (!existing) return;
    for (const listener of [...existing]) listener(...args);
  }
}

// ============================================
// EXERCISE 6: fetchUserName (async + global.fetch mock)
// ============================================

// Deliberately thin, because the lesson is in the test: replacing `fetch` with
// a `jest.fn()` is what makes this deterministic, offline and instant. Mock at
// the boundary — the network — and leave everything inside it real.
export async function fetchUserName(id: number): Promise<string> {
  const res = await fetch('/api/users/' + id);
  const user = await res.json();
  return user.name;
}
