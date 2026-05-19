import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  sum,
  capitalize,
  Greeting,
  useCounter,
  EventEmitter,
  fetchUserName,
} from './index';

describe('Module 10: Testing', () => {

  // ============================================
  // EXERCISE 1: sum
  // ============================================
  describe('Exercise 1: sum (basic equality)', () => {
    it('adds two positive numbers', () => {
      expect(sum(2, 3)).toBe(5);
    });

    it('adds a positive and a negative number', () => {
      expect(sum(-1, 1)).toBe(0);
    });

    it('returns 0 for two zeros', () => {
      expect(sum(0, 0)).toBe(0);
    });
  });

  // ============================================
  // EXERCISE 2: capitalize
  // ============================================
  describe('Exercise 2: capitalize (edge cases)', () => {
    it('upper-cases the first character of a lowercase word', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('upper-cases a single character', () => {
      expect(capitalize('h')).toBe('H');
    });

    it('returns an empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('leaves an already-capitalized string unchanged', () => {
      expect(capitalize('ABC')).toBe('ABC');
    });
  });

  // ============================================
  // EXERCISE 3: Greeting
  // ============================================
  describe('Exercise 3: Greeting (rendering + jest-dom)', () => {
    it('renders the greeting for "Ada"', () => {
      render(<Greeting name="Ada" />);
      expect(screen.getByText('Hello, Ada!')).toBeInTheDocument();
    });

    it('renders the greeting for "World"', () => {
      render(<Greeting name="World" />);
      expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    });

    it('renders the text inside a <p> element', () => {
      const { container } = render(<Greeting name="Lin" />);
      const p = container.querySelector('p');
      expect(p).not.toBeNull();
      expect(p!.textContent).toBe('Hello, Lin!');
    });
  });

  // ============================================
  // EXERCISE 4: useCounter
  // ============================================
  describe('Exercise 4: useCounter (hook testing)', () => {
    // Wrapper component that exposes the hook through the DOM.
    function CounterHarness({ initial }: { initial: number }) {
      const { count, increment, decrement } = useCounter(initial);
      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={increment}>inc</button>
          <button onClick={decrement}>dec</button>
        </div>
      );
    }

    it('starts at the initial value', () => {
      render(<CounterHarness initial={5} />);
      expect(screen.getByTestId('count').textContent).toBe('5');
    });

    it('increments on increment()', () => {
      render(<CounterHarness initial={0} />);
      fireEvent.click(screen.getByText('inc'));
      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('decrements on decrement()', () => {
      render(<CounterHarness initial={0} />);
      fireEvent.click(screen.getByText('dec'));
      expect(screen.getByTestId('count').textContent).toBe('-1');
    });

    it('handles multiple successive increments', () => {
      render(<CounterHarness initial={10} />);
      const inc = screen.getByText('inc');
      fireEvent.click(inc);
      fireEvent.click(inc);
      fireEvent.click(inc);
      expect(screen.getByTestId('count').textContent).toBe('13');
    });

    // useState is imported just so the harness can re-render predictably.
    void useState;
  });

  // ============================================
  // EXERCISE 5: EventEmitter
  // ============================================
  describe('Exercise 5: EventEmitter (jest.fn + unsubscribe)', () => {
    it('calls a subscriber when its event is emitted', () => {
      const emitter = new EventEmitter();
      const spy = jest.fn();
      emitter.on('ping', spy);
      emitter.emit('ping');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('forwards emit args to subscribers', () => {
      const emitter = new EventEmitter();
      const spy = jest.fn();
      emitter.on('data', spy);
      emitter.emit('data', 1, 'two', { three: 3 });
      expect(spy).toHaveBeenCalledWith(1, 'two', { three: 3 });
    });

    it('notifies multiple subscribers on the same event', () => {
      const emitter = new EventEmitter();
      const a = jest.fn();
      const b = jest.fn();
      emitter.on('hi', a);
      emitter.on('hi', b);
      emitter.emit('hi');
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('does not call subscribers of other events', () => {
      const emitter = new EventEmitter();
      const spy = jest.fn();
      emitter.on('ping', spy);
      emitter.emit('pong');
      expect(spy).toHaveBeenCalledTimes(0);
    });

    it('stops calling a subscriber after off()', () => {
      const emitter = new EventEmitter();
      const spy = jest.fn();
      emitter.on('tick', spy);
      emitter.emit('tick');
      emitter.off('tick', spy);
      emitter.emit('tick');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emitting an unknown event is a no-op', () => {
      const emitter = new EventEmitter();
      // Should not throw.
      emitter.emit('nope', 'whatever');
      expect(true).toBe(true);
    });
  });

  // ============================================
  // EXERCISE 6: fetchUserName
  // ============================================
  describe('Exercise 6: fetchUserName (async + mocked fetch)', () => {
    it('returns the name from the parsed JSON response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ name: 'Alice', id: 1 }),
      });
      (globalThis as unknown as { fetch: unknown }).fetch = mockFetch;

      const name = await fetchUserName(1);
      expect(name).toBe('Alice');
    });

    it('calls fetch with the correct URL', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ name: 'Bob', id: 42 }),
      });
      (globalThis as unknown as { fetch: unknown }).fetch = mockFetch;

      await fetchUserName(42);
      expect(mockFetch).toHaveBeenCalledWith('/api/users/42');
    });

    it('returns different names for different ids', async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ name: 'Alice' }) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ name: 'Bob' }) });
      (globalThis as unknown as { fetch: unknown }).fetch = mockFetch;

      expect(await fetchUserName(1)).toBe('Alice');
      expect(await fetchUserName(2)).toBe('Bob');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
