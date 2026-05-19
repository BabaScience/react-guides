import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  MemoizedChild,
  getMemoizedRenders,
  resetMemoizedRenders,
  useExpensiveCalc,
  useStableCallback,
  useRenderCount,
  useDebouncedValue,
  VirtualList,
} from './index';

describe('Module 09: Performance', () => {

  // ============================================
  // EXERCISE 1: MemoizedChild (React.memo)
  // ============================================
  describe('Exercise 1: MemoizedChild (React.memo)', () => {
    beforeEach(() => {
      resetMemoizedRenders();
    });

    it('renders the value prop into a span', () => {
      render(<MemoizedChild value="hello" />);
      expect(screen.getByText('hello')).toBeInTheDocument();
    });

    it('bumps MEMOIZED_RENDERS on initial render', () => {
      render(<MemoizedChild value="x" />);
      expect(getMemoizedRenders()).toBe(1);
    });

    it('does NOT re-render when parent re-renders with the same value', () => {
      function Parent() {
        const [tick, setTick] = useState(0);
        return (
          <div>
            <button onClick={() => setTick((t) => t + 1)}>bump</button>
            <span data-testid="tick">{tick}</span>
            <MemoizedChild value="same" />
          </div>
        );
      }

      render(<Parent />);
      expect(getMemoizedRenders()).toBe(1);

      fireEvent.click(screen.getByText('bump'));
      fireEvent.click(screen.getByText('bump'));
      fireEvent.click(screen.getByText('bump'));

      // Parent re-rendered 3 times, but value="same" didn't change ->
      // React.memo should have short-circuited every one.
      expect(screen.getByTestId('tick')).toHaveTextContent('3');
      expect(getMemoizedRenders()).toBe(1);
    });

    it('DOES re-render when the value prop changes', () => {
      function Parent() {
        const [v, setV] = useState('a');
        return (
          <div>
            <button onClick={() => setV('b')}>change</button>
            <MemoizedChild value={v} />
          </div>
        );
      }

      render(<Parent />);
      expect(getMemoizedRenders()).toBe(1);
      fireEvent.click(screen.getByText('change'));
      expect(getMemoizedRenders()).toBe(2);
    });
  });

  // ============================================
  // EXERCISE 2: useExpensiveCalc (useMemo)
  // ============================================
  describe('Exercise 2: useExpensiveCalc (useMemo)', () => {
    function Harness({ n, calc }: { n: number; calc: (x: number) => number }) {
      const result = useExpensiveCalc(n, calc);
      return <span data-testid="out">{result}</span>;
    }

    it('returns calc(n)', () => {
      const calc = jest.fn((x: number) => x * 2);
      render(<Harness n={5} calc={calc} />);
      expect(screen.getByTestId('out')).toHaveTextContent('10');
    });

    it('does not re-run calc when n is unchanged across renders', () => {
      const calc = jest.fn((x: number) => x * 2);
      function Parent() {
        const [tick, setTick] = useState(0);
        return (
          <div>
            <button onClick={() => setTick((t) => t + 1)}>bump</button>
            <span data-testid="tick">{tick}</span>
            <Harness n={5} calc={calc} />
          </div>
        );
      }
      render(<Parent />);
      expect(calc).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('bump'));
      fireEvent.click(screen.getByText('bump'));

      expect(calc).toHaveBeenCalledTimes(1);
    });

    it('re-runs calc when n changes', () => {
      const calc = jest.fn((x: number) => x * 2);
      function Parent() {
        const [n, setN] = useState(5);
        return (
          <div>
            <button onClick={() => setN((v) => v + 1)}>inc</button>
            <Harness n={n} calc={calc} />
          </div>
        );
      }
      render(<Parent />);
      expect(calc).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByText('inc'));
      expect(calc).toHaveBeenCalledTimes(2);
      fireEvent.click(screen.getByText('inc'));
      expect(calc).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================
  // EXERCISE 3: useStableCallback
  // ============================================
  describe('Exercise 3: useStableCallback', () => {
    it('returns the same reference across renders', () => {
      const captured: Array<() => void> = [];
      function Harness({ label }: { label: string }) {
        const cb = useStableCallback(() => label);
        captured.push(cb);
        return <span data-testid="label">{label}</span>;
      }
      function Parent() {
        const [n, setN] = useState(0);
        return (
          <div>
            <button onClick={() => setN((v) => v + 1)}>bump</button>
            <Harness label={`v${n}`} />
          </div>
        );
      }

      render(<Parent />);
      fireEvent.click(screen.getByText('bump'));
      fireEvent.click(screen.getByText('bump'));

      expect(captured.length).toBeGreaterThanOrEqual(3);
      expect(captured[0]).toBe(captured[1]);
      expect(captured[1]).toBe(captured[2]);
    });

    it('always invokes the LATEST closure', () => {
      let cbRef: (() => string) | null = null;
      function Harness({ label }: { label: string }) {
        cbRef = useStableCallback(() => label);
        return <span>{label}</span>;
      }
      function Parent() {
        const [n, setN] = useState(0);
        return (
          <div>
            <button onClick={() => setN((v) => v + 1)}>bump</button>
            <Harness label={`v${n}`} />
          </div>
        );
      }

      render(<Parent />);
      expect(cbRef!()).toBe('v0');
      fireEvent.click(screen.getByText('bump'));
      expect(cbRef!()).toBe('v1');
      fireEvent.click(screen.getByText('bump'));
      expect(cbRef!()).toBe('v2');
    });
  });

  // ============================================
  // EXERCISE 4: useRenderCount
  // ============================================
  describe('Exercise 4: useRenderCount', () => {
    function Harness() {
      const [, setN] = useState(0);
      const count = useRenderCount();
      return (
        <div>
          <button onClick={() => setN((v) => v + 1)}>bump</button>
          <span data-testid="count">{count}</span>
        </div>
      );
    }

    it('starts at 1 after first render', () => {
      render(<Harness />);
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    it('grows on each re-render', () => {
      render(<Harness />);
      fireEvent.click(screen.getByText('bump'));
      expect(screen.getByTestId('count')).toHaveTextContent('2');
      fireEvent.click(screen.getByText('bump'));
      expect(screen.getByTestId('count')).toHaveTextContent('3');
      fireEvent.click(screen.getByText('bump'));
      expect(screen.getByTestId('count')).toHaveTextContent('4');
    });
  });

  // ============================================
  // EXERCISE 5: useDebouncedValue
  // ============================================
  describe('Exercise 5: useDebouncedValue', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    function Harness({ value, ms }: { value: string; ms: number }) {
      const debounced = useDebouncedValue(value, ms);
      return <span data-testid="debounced">{debounced}</span>;
    }

    it('returns the initial value synchronously', () => {
      render(<Harness value="hello" ms={500} />);
      expect(screen.getByTestId('debounced')).toHaveTextContent('hello');
    });

    it('does not update the debounced value before the timeout elapses', () => {
      const { rerender } = render(<Harness value="a" ms={500} />);
      rerender(<Harness value="b" ms={500} />);
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(screen.getByTestId('debounced')).toHaveTextContent('a');
    });

    it('updates the debounced value once the timeout elapses', () => {
      const { rerender } = render(<Harness value="a" ms={500} />);
      rerender(<Harness value="b" ms={500} />);
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(screen.getByTestId('debounced')).toHaveTextContent('b');
    });

    it('resets the timer when the value changes again before completion', () => {
      const { rerender } = render(<Harness value="a" ms={500} />);
      rerender(<Harness value="b" ms={500} />);
      act(() => { jest.advanceTimersByTime(300); });
      rerender(<Harness value="c" ms={500} />);
      act(() => { jest.advanceTimersByTime(300); });
      // Still "a" — the second change reset the timer back to 500ms.
      expect(screen.getByTestId('debounced')).toHaveTextContent('a');
      act(() => { jest.advanceTimersByTime(200); });
      expect(screen.getByTestId('debounced')).toHaveTextContent('c');
    });
  });

  // ============================================
  // EXERCISE 6: VirtualList
  // ============================================
  describe('Exercise 6: VirtualList (windowing)', () => {
    const items = Array.from({ length: 1000 }, (_, i) => `item-${i}`);

    it('renders only the visible window at scrollTop = 0', () => {
      // itemHeight=20, windowHeight=100 -> 5 visible rows + 1 buffer = 6 items
      render(
        <VirtualList
          items={items}
          itemHeight={20}
          windowHeight={100}
          scrollTop={0}
        />,
      );
      const lis = screen.getAllByRole('listitem');
      expect(lis).toHaveLength(6);
      expect(lis[0]).toHaveTextContent('item-0');
      expect(lis[5]).toHaveTextContent('item-5');
      expect(screen.queryByText('item-100')).not.toBeInTheDocument();
    });

    it('shifts the window when scrolled', () => {
      // scrollTop=200 -> startIndex = floor(200/20) = 10
      render(
        <VirtualList
          items={items}
          itemHeight={20}
          windowHeight={100}
          scrollTop={200}
        />,
      );
      const lis = screen.getAllByRole('listitem');
      expect(lis).toHaveLength(6);
      expect(lis[0]).toHaveTextContent('item-10');
      expect(lis[5]).toHaveTextContent('item-15');
      expect(screen.queryByText('item-0')).not.toBeInTheDocument();
      expect(screen.queryByText('item-9')).not.toBeInTheDocument();
    });

    it('does not crash near the end of the list', () => {
      // 1000 items, itemHeight=20 -> total height 20000; scroll near the end.
      render(
        <VirtualList
          items={items}
          itemHeight={20}
          windowHeight={100}
          scrollTop={19900}
        />,
      );
      // startIndex = floor(19900/20) = 995 -> slice(995, 1001) -> 5 items left.
      const lis = screen.getAllByRole('listitem');
      expect(lis.length).toBeLessThanOrEqual(6);
      expect(lis[0]).toHaveTextContent('item-995');
      expect(lis[lis.length - 1]).toHaveTextContent('item-999');
    });

    it('wraps rendered items in a single <ul>', () => {
      const { container } = render(
        <VirtualList
          items={items}
          itemHeight={20}
          windowHeight={100}
          scrollTop={0}
        />,
      );
      expect(container.querySelectorAll('ul')).toHaveLength(1);
    });
  });
});
