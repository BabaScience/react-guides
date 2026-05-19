import { render, screen, fireEvent } from '@testing-library/react';
import {
  createStore,
  useCounterReducer,
  combineReducers,
  useToggle,
  CountProvider,
  useCount,
  useLocalStorage,
} from './index';

describe('Module 06: State Management', () => {

  // ============================================
  // EXERCISE 1: createStore
  // ============================================
  describe('Exercise 1: createStore (observable store)', () => {
    it('getState returns the initial value', () => {
      const store = createStore({ count: 0 });
      expect(store.getState()).toEqual({ count: 0 });
    });

    it('setState with a direct value updates the state', () => {
      const store = createStore<{ count: number }>({ count: 0 });
      store.setState({ count: 5 });
      expect(store.getState()).toEqual({ count: 5 });
    });

    it('setState with an updater function receives the previous state', () => {
      const store = createStore({ count: 1 });
      store.setState((prev) => ({ count: prev.count + 10 }));
      expect(store.getState()).toEqual({ count: 11 });
    });

    it('subscribe is called every time setState runs', () => {
      const store = createStore({ count: 0 });
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState({ count: 1 });
      store.setState({ count: 2 });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('subscribe notifies multiple listeners', () => {
      const store = createStore({ count: 0 });
      const a = jest.fn();
      const b = jest.fn();
      store.subscribe(a);
      store.subscribe(b);
      store.setState({ count: 1 });
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe stops further notifications', () => {
      const store = createStore({ count: 0 });
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      store.setState({ count: 1 });
      unsubscribe();
      store.setState({ count: 2 });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // EXERCISE 2: useCounterReducer
  // ============================================
  describe('Exercise 2: useCounterReducer (useReducer hook)', () => {
    function Setup() {
      const [state, dispatch] = useCounterReducer();
      return (
        <div>
          <span data-testid="count">{state.count}</span>
          <button onClick={() => dispatch({ type: 'increment' })}>inc</button>
          <button onClick={() => dispatch({ type: 'decrement' })}>dec</button>
          <button onClick={() => dispatch({ type: 'reset' })}>reset</button>
        </div>
      );
    }

    it('starts with count 0', () => {
      render(<Setup />);
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    it('increment raises count by 1', () => {
      render(<Setup />);
      fireEvent.click(screen.getByText('inc'));
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    it('decrement lowers count by 1', () => {
      render(<Setup />);
      fireEvent.click(screen.getByText('dec'));
      expect(screen.getByTestId('count')).toHaveTextContent('-1');
    });

    it('reset returns count to 0', () => {
      render(<Setup />);
      fireEvent.click(screen.getByText('inc'));
      fireEvent.click(screen.getByText('inc'));
      fireEvent.click(screen.getByText('reset'));
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });
  });

  // ============================================
  // EXERCISE 3: combineReducers
  // ============================================
  describe('Exercise 3: combineReducers (reducer composition)', () => {
    const counter = (state: number = 0, action: { type: string }) => {
      if (action.type === 'inc') return state + 1;
      if (action.type === 'dec') return state - 1;
      return state;
    };
    const flag = (state: boolean = false, action: { type: string }) => {
      if (action.type === 'toggle') return !state;
      return state;
    };

    it('runs each sub-reducer on its own slice', () => {
      const root = combineReducers({ counter, flag });
      const next = root({ counter: 0, flag: false }, { type: 'inc' });
      expect(next).toEqual({ counter: 1, flag: false });
    });

    it('returns a new object — does not mutate input state', () => {
      const root = combineReducers({ counter, flag });
      const initial = { counter: 0, flag: false };
      const next = root(initial, { type: 'toggle' });
      expect(next).not.toBe(initial);
      expect(initial).toEqual({ counter: 0, flag: false });
    });

    it('leaves slices unchanged for unknown actions', () => {
      const root = combineReducers({ counter, flag });
      const next = root({ counter: 7, flag: true }, { type: 'nope' });
      expect(next).toEqual({ counter: 7, flag: true });
    });

    it('routes different actions to different slices independently', () => {
      const root = combineReducers({ counter, flag });
      let s = { counter: 0, flag: false };
      s = root(s, { type: 'inc' });
      s = root(s, { type: 'toggle' });
      expect(s).toEqual({ counter: 1, flag: true });
    });
  });

  // ============================================
  // EXERCISE 4: useToggle
  // ============================================
  describe('Exercise 4: useToggle (boolean hook)', () => {
    function Setup({ initial = false }: { initial?: boolean }) {
      const [on, toggle] = useToggle(initial);
      return (
        <div>
          <span data-testid="state">{on ? 'on' : 'off'}</span>
          <button onClick={toggle}>flip</button>
        </div>
      );
    }

    it('respects the initial value (false)', () => {
      render(<Setup initial={false} />);
      expect(screen.getByTestId('state')).toHaveTextContent('off');
    });

    it('respects the initial value (true)', () => {
      render(<Setup initial={true} />);
      expect(screen.getByTestId('state')).toHaveTextContent('on');
    });

    it('flips state on toggle', () => {
      render(<Setup initial={false} />);
      fireEvent.click(screen.getByText('flip'));
      expect(screen.getByTestId('state')).toHaveTextContent('on');
    });

    it('toggles back and forth', () => {
      render(<Setup initial={false} />);
      const btn = screen.getByText('flip');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(screen.getByTestId('state')).toHaveTextContent('off');
    });
  });

  // ============================================
  // EXERCISE 5: CountProvider + useCount
  // ============================================
  describe('Exercise 5: CountProvider + useCount (context)', () => {
    function Consumer() {
      const { count, increment } = useCount();
      return (
        <div>
          <span data-testid="count">{count}</span>
          <button onClick={increment}>inc</button>
        </div>
      );
    }

    it('provides initial count of 0', () => {
      render(
        <CountProvider>
          <Consumer />
        </CountProvider>
      );
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    it('increment updates the count for consumers', () => {
      render(
        <CountProvider>
          <Consumer />
        </CountProvider>
      );
      fireEvent.click(screen.getByText('inc'));
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    it('useCount throws when used outside CountProvider', () => {
      // Silence the React error log for the expected throw.
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Consumer />)).toThrow();
      spy.mockRestore();
    });
  });

  // ============================================
  // EXERCISE 6: useLocalStorage
  // ============================================
  describe('Exercise 6: useLocalStorage (persistent state)', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    function Setup({ k = 'key', initial = 'a' }: { k?: string; initial?: string }) {
      const [value, setValue] = useLocalStorage<string>(k, initial);
      return (
        <div>
          <span data-testid="value">{value}</span>
          <button onClick={() => setValue('next')}>set</button>
        </div>
      );
    }

    it('returns the initial value when the key is missing', () => {
      render(<Setup k="missing" initial="default" />);
      expect(screen.getByTestId('value')).toHaveTextContent('default');
    });

    it('reads an existing value from localStorage on mount', () => {
      localStorage.setItem('key', JSON.stringify('stored'));
      render(<Setup k="key" initial="default" />);
      expect(screen.getByTestId('value')).toHaveTextContent('stored');
    });

    it('writes to localStorage when the setter is called', () => {
      render(<Setup k="key" initial="a" />);
      fireEvent.click(screen.getByText('set'));
      expect(JSON.parse(localStorage.getItem('key') as string)).toBe('next');
    });

    it('updates the React state when the setter is called', () => {
      render(<Setup k="key" initial="a" />);
      fireEvent.click(screen.getByText('set'));
      expect(screen.getByTestId('value')).toHaveTextContent('next');
    });

    it('falls back to initial when stored JSON is corrupt', () => {
      localStorage.setItem('key', '{not valid json');
      render(<Setup k="key" initial="fallback" />);
      expect(screen.getByTestId('value')).toHaveTextContent('fallback');
    });
  });
});
