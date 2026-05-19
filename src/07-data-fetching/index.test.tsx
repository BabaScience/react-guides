import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import {
  useFetch,
  useDebounce,
  useInterval,
  useAbortable,
  useOptimistic,
  createCache,
} from './index';

// Tiny helper: surface a hook's state into the DOM via data-testid spans
// so RTL can observe it. Each test defines a small wrapper around the hook
// it is exercising.

describe('Module 07: Data Fetching', () => {
  // The sandbox provides global.fetch as undefined; every test that needs it
  // installs its own mock. Reset between tests.
  const originalFetch = (global as unknown as { fetch?: typeof fetch }).fetch;
  afterEach(() => {
    (global as unknown as { fetch?: typeof fetch }).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  // ============================================
  // EXERCISE 1: useFetch
  // ============================================
  describe('Exercise 1: useFetch', () => {
    function Probe({ url }: { url: string }) {
      const { data, loading, error } = useFetch<{ foo: string }>(url);
      return (
        <div>
          <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
          <span data-testid="error">{error ?? ''}</span>
          <span data-testid="data">{data ? data.foo : ''}</span>
        </div>
      );
    }

    it('starts in the loading state with no data and no error', () => {
      (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockReturnValue(
        new Promise(() => undefined), // never resolves — keeps it pending
      );
      render(<Probe url="/api/x" />);
      expect(screen.getByTestId('loading')).toHaveTextContent('yes');
      expect(screen.getByTestId('data')).toHaveTextContent('');
      expect(screen.getByTestId('error')).toHaveTextContent('');
    });

    it('resolves to data on success and stops loading', async () => {
      (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ foo: 'bar' }),
      });
      render(<Probe url="/api/x" />);
      await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('bar'));
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
      expect(screen.getByTestId('error')).toHaveTextContent('');
    });

    it('reports the error message and stops loading on rejection', async () => {
      (global as unknown as { fetch: jest.Mock }).fetch = jest
        .fn()
        .mockRejectedValue(new Error('boom'));
      render(<Probe url="/api/x" />);
      await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('boom'));
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
      expect(screen.getByTestId('data')).toHaveTextContent('');
    });

    it('refetches when the url changes', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ foo: 'one' }) })
        .mockResolvedValueOnce({ json: () => Promise.resolve({ foo: 'two' }) });
      (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;

      const { rerender } = render(<Probe url="/api/one" />);
      await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('one'));
      rerender(<Probe url="/api/two" />);
      await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('two'));
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================
  // EXERCISE 2: useDebounce
  // ============================================
  describe('Exercise 2: useDebounce', () => {
    function Probe({ ms }: { ms: number }) {
      const [value, setValue] = useState('a');
      const debounced = useDebounce(value, ms);
      return (
        <div>
          <span data-testid="raw">{value}</span>
          <span data-testid="debounced">{debounced}</span>
          <button onClick={() => setValue('b')}>set-b</button>
          <button onClick={() => setValue('c')}>set-c</button>
        </div>
      );
    }

    it('returns the initial value immediately', () => {
      render(<Probe ms={50} />);
      expect(screen.getByTestId('debounced')).toHaveTextContent('a');
    });

    it('updates only after the delay has elapsed', async () => {
      render(<Probe ms={50} />);
      fireEvent.click(screen.getByText('set-b'));
      // raw flips right away; debounced still 'a' until timeout fires
      expect(screen.getByTestId('raw')).toHaveTextContent('b');
      expect(screen.getByTestId('debounced')).toHaveTextContent('a');
      await waitFor(
        () => expect(screen.getByTestId('debounced')).toHaveTextContent('b'),
        { timeout: 500 },
      );
    });

    it('cancels a pending update when the value changes again', async () => {
      render(<Probe ms={80} />);
      fireEvent.click(screen.getByText('set-b'));
      // rapid second change before the first timeout fires
      fireEvent.click(screen.getByText('set-c'));
      // eventually settles on the LATEST value, never on 'b'
      await waitFor(
        () => expect(screen.getByTestId('debounced')).toHaveTextContent('c'),
        { timeout: 500 },
      );
      expect(screen.getByTestId('debounced')).not.toHaveTextContent('b');
    });
  });

  // ============================================
  // EXERCISE 3: useInterval
  // ============================================
  describe('Exercise 3: useInterval', () => {
    function Probe({ ms, cb }: { ms: number | null; cb: () => void }) {
      useInterval(cb, ms);
      return <span data-testid="probe">ok</span>;
    }

    it('invokes the callback repeatedly while ms is a number', async () => {
      const cb = jest.fn();
      render(<Probe ms={30} cb={cb} />);
      await waitFor(() => expect(cb.mock.calls.length).toBeGreaterThanOrEqual(2), {
        timeout: 500,
      });
    });

    it('does not invoke the callback when ms is null', async () => {
      const cb = jest.fn();
      render(<Probe ms={null} cb={cb} />);
      await new Promise((r) => setTimeout(r, 120));
      expect(cb).not.toHaveBeenCalled();
    });

    it('uses the latest callback (no stale closure)', async () => {
      const first = jest.fn();
      const second = jest.fn();
      const { rerender } = render(<Probe ms={30} cb={first} />);
      // wait for the FIRST callback to fire at least once so we know the interval is up
      await waitFor(() => expect(first).toHaveBeenCalled(), { timeout: 500 });
      rerender(<Probe ms={30} cb={second} />);
      await waitFor(() => expect(second).toHaveBeenCalled(), { timeout: 500 });
    });

    it('clears the interval on unmount', async () => {
      const cb = jest.fn();
      const { unmount } = render(<Probe ms={30} cb={cb} />);
      await waitFor(() => expect(cb).toHaveBeenCalled(), { timeout: 500 });
      unmount();
      const before = cb.mock.calls.length;
      await new Promise((r) => setTimeout(r, 120));
      expect(cb.mock.calls.length).toBe(before);
    });
  });

  // ============================================
  // EXERCISE 4: useAbortable
  // ============================================
  describe('Exercise 4: useAbortable', () => {
    function Probe({ url }: { url: string }) {
      const { data, loading, error } = useAbortable(url);
      return (
        <div>
          <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
          <span data-testid="error">{error ?? ''}</span>
          <span data-testid="data">
            {data ? JSON.stringify(data) : ''}
          </span>
        </div>
      );
    }

    it('passes an AbortSignal to fetch', () => {
      const fetchMock = jest.fn().mockReturnValue(new Promise(() => undefined));
      (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
      render(<Probe url="/api/x" />);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0];
      expect(init).toBeDefined();
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it('resolves to data on success', async () => {
      (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ ok: 1 }),
      });
      render(<Probe url="/api/x" />);
      await waitFor(() =>
        expect(screen.getByTestId('data')).toHaveTextContent('{"ok":1}'),
      );
    });

    it('aborts the previous request when url changes', async () => {
      const aborted: boolean[] = [];
      const fetchMock = jest.fn((_url: string, init?: { signal?: AbortSignal }) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            aborted.push(true);
            const err = new Error('aborted');
            (err as Error & { name: string }).name = 'AbortError';
            reject(err);
          });
        });
      });
      (global as unknown as { fetch: jest.Mock }).fetch = fetchMock as unknown as jest.Mock;

      const { rerender } = render(<Probe url="/api/one" />);
      rerender(<Probe url="/api/two" />);
      await waitFor(() => expect(aborted.length).toBeGreaterThanOrEqual(1));
    });

    it('aborts on unmount', async () => {
      let abortFired = false;
      const fetchMock = jest.fn((_url: string, init?: { signal?: AbortSignal }) => {
        return new Promise(() => {
          init?.signal?.addEventListener('abort', () => {
            abortFired = true;
          });
        });
      });
      (global as unknown as { fetch: jest.Mock }).fetch = fetchMock as unknown as jest.Mock;

      const { unmount } = render(<Probe url="/api/x" />);
      unmount();
      await waitFor(() => expect(abortFired).toBe(true));
    });
  });

  // ============================================
  // EXERCISE 5: useOptimistic
  // ============================================
  describe('Exercise 5: useOptimistic', () => {
    function Probe({
      onReady,
    }: {
      onReady: (api: {
        apply: (optimistic: string, commit: () => Promise<string>) => Promise<void>;
      }) => void;
    }) {
      const [state, apply] = useOptimistic<string>('initial');
      // Expose apply to the test exactly once
      React.useEffect(() => {
        onReady({ apply });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <span data-testid="state">{state}</span>;
    }

    it('starts with the initial value', () => {
      render(<Probe onReady={() => undefined} />);
      expect(screen.getByTestId('state')).toHaveTextContent('initial');
    });

    it('replaces state with the committed value on success', async () => {
      let api!: { apply: (o: string, c: () => Promise<string>) => Promise<void> };
      render(<Probe onReady={(a) => { api = a; }} />);
      await waitFor(() => expect(api).toBeDefined());
      await act(async () => {
        await api.apply('optimistic', () => Promise.resolve('server'));
      });
      expect(screen.getByTestId('state')).toHaveTextContent('server');
    });

    it('shows the optimistic value before the commit resolves', async () => {
      let api!: { apply: (o: string, c: () => Promise<string>) => Promise<void> };
      render(<Probe onReady={(a) => { api = a; }} />);
      await waitFor(() => expect(api).toBeDefined());

      let resolveCommit!: (v: string) => void;
      const pending = new Promise<string>((resolve) => { resolveCommit = resolve; });
      let applyPromise!: Promise<void>;
      act(() => {
        applyPromise = api.apply('optimistic', () => pending);
      });
      // before commit resolves, UI shows optimistic
      expect(screen.getByTestId('state')).toHaveTextContent('optimistic');
      await act(async () => {
        resolveCommit('server');
        await applyPromise;
      });
      expect(screen.getByTestId('state')).toHaveTextContent('server');
    });

    it('reverts to the previous value when commit rejects', async () => {
      let api!: { apply: (o: string, c: () => Promise<string>) => Promise<void> };
      render(<Probe onReady={(a) => { api = a; }} />);
      await waitFor(() => expect(api).toBeDefined());
      let caught: unknown = null;
      await act(async () => {
        try {
          await api.apply('optimistic', () => Promise.reject(new Error('nope')));
        } catch (err) {
          caught = err;
        }
      });
      expect(screen.getByTestId('state')).toHaveTextContent('initial');
      expect((caught as Error)?.message).toBe('nope');
    });
  });

  // ============================================
  // EXERCISE 6: createCache
  // ============================================
  describe('Exercise 6: createCache', () => {
    it('get returns undefined for missing keys', () => {
      const cache = createCache<number>();
      expect(cache.get('nope')).toBeUndefined();
    });

    it('set + get round-trips values', () => {
      const cache = createCache<number>();
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
    });

    it('has reflects whether a key has been set', () => {
      const cache = createCache<string>();
      expect(cache.has('a')).toBe(false);
      cache.set('a', 'x');
      expect(cache.has('a')).toBe(true);
    });

    it('set overwrites an existing value', () => {
      const cache = createCache<number>();
      cache.set('a', 1);
      cache.set('a', 2);
      expect(cache.get('a')).toBe(2);
    });

    it('clear removes every entry', () => {
      const cache = createCache<number>();
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.get('a')).toBeUndefined();
    });

    it('each cache instance is independent', () => {
      const a = createCache<number>();
      const b = createCache<number>();
      a.set('k', 1);
      expect(b.has('k')).toBe(false);
      expect(b.get('k')).toBeUndefined();
    });
  });
});
