import React from 'react';

/**
 * MODULE 10: Testing
 *
 * This is a meta-module: the test runner IS the in-browser harness, so each
 * exercise teaches a feature of the harness by exercising it. The harness wires
 * up `expect`, `jest.fn`, `waitFor`, and `@testing-library/react` for you — the
 * code you write below just needs to ship plain components / hooks / utilities.
 *
 * Sandbox runtime constraint: only `react` and `react-dom` are available.
 */

// ============================================
// EXERCISE 1: sum (basic equality)
// ============================================

/**
 * OBJECTIVE: A pure function adding two numbers.
 *
 * CONTRACT:
 * - sum(2, 3)   === 5
 * - sum(-1, 1)  === 0
 * - sum(0, 0)   === 0
 *
 * Teaches `expect(actual).toBe(expected)` — exact equality with `===`.
 */
export function sum(a: number, b: number): number {
  // TODO: return a + b
  void a; void b;
  return 0;
}

// ============================================
// EXERCISE 2: capitalize (edge cases)
// ============================================

/**
 * OBJECTIVE: Upper-case the first character of a string, leave the rest alone.
 *
 * CONTRACT:
 * - capitalize('hello') === 'Hello'
 * - capitalize('h')     === 'H'
 * - capitalize('')      === ''        (empty input -> empty output)
 * - capitalize('ABC')   === 'ABC'     (already upper, no change)
 *
 * Teaches handling edge cases with multiple `toBe` assertions.
 */
export function capitalize(s: string): string {
  // TODO: guard against empty string, then s[0].toUpperCase() + s.slice(1)
  void s;
  return '';
}

// ============================================
// EXERCISE 3: Greeting (rendering + jest-dom)
// ============================================

/**
 * OBJECTIVE: Render `<p>Hello, {name}!</p>`.
 *
 * CONTRACT:
 * - <Greeting name="Ada" />     renders a <p> containing the text "Hello, Ada!"
 * - <Greeting name="World" />   renders a <p> containing the text "Hello, World!"
 *
 * Teaches `render()` + `screen.getByText(...)` + `toBeInTheDocument()`.
 */
interface GreetingProps {
  name: string;
}

export const Greeting: React.FC<GreetingProps> = ({ name }) => {
  // TODO: return <p>Hello, {name}!</p>
  void name;
  return null;
};

// ============================================
// EXERCISE 4: useCounter (hook testing)
// ============================================

/**
 * OBJECTIVE: A counter hook exposing `count`, `increment`, `decrement`.
 *
 * CONTRACT:
 * - useCounter(0)  returns { count: 0,  increment, decrement }
 * - calling increment() updates count to count + 1 on the next render
 * - calling decrement() updates count to count - 1 on the next render
 *
 * Teaches hook testing by rendering a wrapper component that exposes the
 * hook's state through the DOM and triggers it through buttons.
 */
export function useCounter(initial: number): {
  count: number;
  increment: () => void;
  decrement: () => void;
} {
  // TODO: useState for count; return { count, increment, decrement }
  //   - increment should call setCount((c) => c + 1)
  //   - decrement should call setCount((c) => c - 1)
  void initial;
  return { count: 0, increment: () => {}, decrement: () => {} };
}

// ============================================
// EXERCISE 5: EventEmitter (jest.fn + unsubscribe)
// ============================================

/**
 * OBJECTIVE: A tiny pub/sub class.
 *
 * CONTRACT:
 * - new EventEmitter()              creates an empty emitter
 * - on(event, fn)                   registers a subscriber for the given event
 * - off(event, fn)                  removes that exact subscriber (no-op if absent)
 * - emit(event, ...args)            calls every registered subscriber for the event
 *                                   with the forwarded args, in registration order
 * - emitting an unknown event       is a no-op (does NOT throw)
 *
 * Teaches `jest.fn()` for subscriber spies and `toHaveBeenCalledTimes` /
 * `toHaveBeenCalledWith` to verify multiple subscribers and that `off` works.
 */
type Listener = (...args: unknown[]) => void;

export class EventEmitter {
  // TODO: store listeners keyed by event name (e.g. a Map<string, Listener[]>)
  private listeners: Map<string, Listener[]> = new Map();

  on(_event: string, _fn: Listener): void {
    // TODO: push fn into the listeners array for event (create the array if needed)
    void _event; void _fn;
  }

  off(_event: string, _fn: Listener): void {
    // TODO: remove fn from the listeners array for event (filter or splice)
    void _event; void _fn;
  }

  emit(_event: string, ..._args: unknown[]): void {
    // TODO: invoke every listener for event with ...args.
    // If no listeners exist for this event, do nothing.
    void _event; void _args;
  }
}

// ============================================
// EXERCISE 6: fetchUserName (async + global.fetch mock)
// ============================================

/**
 * OBJECTIVE: Fetch a user by id and return their name.
 *
 * CONTRACT:
 * - fetchUserName(id) calls `fetch('/api/users/' + id)`
 * - parses the response with `.json()`
 * - resolves with the `name` field of the parsed object
 *
 * Example:
 *   fetch resolves to { json: () => Promise.resolve({ name: 'Alice', id: 1 }) }
 *   ->  await fetchUserName(1)  ===  'Alice'
 *
 * Teaches mocking `global.fetch = jest.fn().mockResolvedValue(...)` and
 * verifying the URL the function called.
 */
export async function fetchUserName(id: number): Promise<string> {
  // TODO: const res = await fetch('/api/users/' + id);
  //       const user = await res.json();
  //       return user.name;
  void id;
  return '';
}
