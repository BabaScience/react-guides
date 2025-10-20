import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  CounterWithFunctionalUpdates,
  DataFetchingComponent,
  ThemeProvider,
  useTheme,
  ThemeToggle,
  FocusInput,
  FilteredList,
  MemoizedChild,
  ParentWithCallback,
  TodoApp,
  todoReducer
} from './index';

// Mock fetch globally
global.fetch = jest.fn();

describe('Module 02: React Hooks Deep Dive', () => {
  
  // ============================================
  // EXERCISE 1: useState Counter with Functional Updates
  // ============================================
  
  describe('Exercise 1: Counter with Functional Updates', () => {
    it('should render initial count of 0', () => {
      render(<CounterWithFunctionalUpdates />);
      expect(screen.getByText(/Count: 0/i)).toBeInTheDocument();
    });

    it('should increment count when increment button clicked', () => {
      render(<CounterWithFunctionalUpdates />);
      const incrementButton = screen.getByText(/increment/i);
      
      fireEvent.click(incrementButton);
      expect(screen.getByText(/Count: 1/i)).toBeInTheDocument();
      
      fireEvent.click(incrementButton);
      expect(screen.getByText(/Count: 2/i)).toBeInTheDocument();
    });

    it('should decrement count when decrement button clicked', () => {
      render(<CounterWithFunctionalUpdates />);
      const decrementButton = screen.getByText(/decrement/i);
      
      fireEvent.click(decrementButton);
      expect(screen.getByText(/Count: -1/i)).toBeInTheDocument();
    });

    it('should handle rapid clicks correctly with functional updates', () => {
      render(<CounterWithFunctionalUpdates />);
      const incrementButton = screen.getByText(/increment/i);
      
      // Rapid clicks should all be processed
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      
      expect(screen.getByText(/Count: 3/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 2: useEffect Data Fetching
  // ============================================
  
  describe('Exercise 2: Data Fetching with useEffect', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockClear();
    });

    it('should show loading state initially', () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );
      
      render(<DataFetchingComponent />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display user data after successful fetch', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });
      
      render(<DataFetchingComponent />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      render(<DataFetchingComponent />);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should prevent setState after component unmount', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ id: 1, name: 'Test' })
        }), 100))
      );
      
      const { unmount } = render(<DataFetchingComponent />);
      unmount();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should not have any console errors about setState after unmount
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('setState')
      );
      
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // EXERCISE 3: useContext Theme Provider
  // ============================================
  
  describe('Exercise 3: Theme Context Provider', () => {
    it('should provide default theme context', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      expect(screen.getByText(/light/i)).toBeInTheDocument();
    });

    it('should toggle theme when toggle button clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      const toggleButton = screen.getByText(/toggle/i);
      await user.click(toggleButton);
      
      expect(screen.getByText(/dark/i)).toBeInTheDocument();
      
      await user.click(toggleButton);
      
      expect(screen.getByText(/light/i)).toBeInTheDocument();
    });

    it('should throw error when useTheme used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const TestComponent = () => {
        useTheme();
        return <div>Test</div>;
      };
      
      expect(() => render(<TestComponent />)).toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // EXERCISE 4: useRef Focus Management
  // ============================================
  
  describe('Exercise 4: Focus Management with useRef', () => {
    it('should focus input when focus button clicked', async () => {
      const user = userEvent.setup();
      
      render(<FocusInput />);
      
      const input = screen.getByRole('textbox');
      const focusButton = screen.getByText(/focus/i);
      
      await user.click(focusButton);
      
      expect(document.activeElement).toBe(input);
    });

    it('should render input and focus button', () => {
      render(<FocusInput />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText(/focus/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 5: useMemo Derived Data
  // ============================================
  
  describe('Exercise 5: useMemo Derived Data', () => {
    const mockItems = [
      { id: 1, name: 'Apple', category: 'fruit', value: 5 },
      { id: 2, name: 'Carrot', category: 'vegetable', value: 3 },
      { id: 3, name: 'Banana', category: 'fruit', value: 4 },
      { id: 4, name: 'Broccoli', category: 'vegetable', value: 6 }
    ];

    it('should filter items by category', () => {
      render(<FilteredList items={mockItems} filter="fruit" sortBy="name" />);
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
      expect(screen.queryByText('Broccoli')).not.toBeInTheDocument();
    });

    it('should sort items by name', () => {
      render(<FilteredList items={mockItems} filter="fruit" sortBy="name" />);
      
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Apple');
      expect(items[1]).toHaveTextContent('Banana');
    });

    it('should sort items by value', () => {
      render(<FilteredList items={mockItems} filter="vegetable" sortBy="value" />);
      
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveTextContent('Carrot'); // value: 3
      expect(items[1]).toHaveTextContent('Broccoli'); // value: 6
    });

    it('should memoize filtered results', () => {
      const computeSpy = jest.fn();
      
      const TestComponent = ({ items, filter, sortBy }: any) => {
        const filteredItems = React.useMemo(() => {
          computeSpy();
          return items
            .filter((item: any) => item.category === filter)
            .sort((a: any, b: any) => a[sortBy].localeCompare(b[sortBy]));
        }, [items, filter, sortBy]);
        
        return (
          <ul>
            {filteredItems.map((item: any) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        );
      };
      
      const { rerender } = render(
        <TestComponent items={mockItems} filter="fruit" sortBy="name" />
      );
      
      expect(computeSpy).toHaveBeenCalledTimes(1);
      
      // Rerender with same props - should not recompute
      rerender(<TestComponent items={mockItems} filter="fruit" sortBy="name" />);
      expect(computeSpy).toHaveBeenCalledTimes(1);
      
      // Rerender with different filter - should recompute
      rerender(<TestComponent items={mockItems} filter="vegetable" sortBy="name" />);
      expect(computeSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================
  // EXERCISE 6: useCallback Stable References
  // ============================================
  
  describe('Exercise 6: useCallback Stable References', () => {
    it('should not re-render child when unrelated state changes', () => {
      const renderSpy = jest.fn();
      
      const TestMemoizedChild = React.memo(({ onClick, label }: any) => {
        renderSpy();
        return <button onClick={onClick}>{label}</button>;
      });
      
      const TestParent = () => {
        const [count, setCount] = React.useState(0);
        const [otherState, setOtherState] = React.useState(false);
        
        const handleClick = React.useCallback(() => {
          console.log('Clicked');
        }, []);
        
        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <button onClick={() => setOtherState(s => !s)}>Toggle Other</button>
            <TestMemoizedChild onClick={handleClick} label="Click Me" />
          </div>
        );
      };
      
      render(<TestParent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Change unrelated state
      fireEvent.click(screen.getByText('Toggle Other'));
      
      // Child should not re-render
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Change count
      fireEvent.click(screen.getByText('Increment'));
      
      // Child should still not re-render (stable callback)
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should call callback when child button clicked', () => {
      const mockCallback = jest.fn();
      
      const TestMemoizedChild = React.memo(({ onClick, label }: any) => {
        return <button onClick={onClick}>{label}</button>;
      });
      
      const TestParent = () => {
        const handleClick = React.useCallback(() => {
          mockCallback();
        }, []);
        
        return <TestMemoizedChild onClick={handleClick} label="Click Me" />;
      };
      
      render(<TestParent />);
      
      fireEvent.click(screen.getByText('Click Me'));
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // EXERCISE 7: useReducer Todo Management
  // ============================================
  
  describe('Exercise 7: useReducer Todo Management', () => {
    it('should add todo when form submitted', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText(/add todo/i);
      const addButton = screen.getByText(/add/i);
      
      await user.type(input, 'Learn React');
      await user.click(addButton);
      
      expect(screen.getByText('Learn React')).toBeInTheDocument();
    });

    it('should toggle todo completion', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText(/add todo/i);
      const addButton = screen.getByText(/add/i);
      
      await user.type(input, 'Learn React');
      await user.click(addButton);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it('should delete todo when delete button clicked', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText(/add todo/i);
      const addButton = screen.getByText(/add/i);
      
      await user.type(input, 'Learn React');
      await user.click(addButton);
      
      expect(screen.getByText('Learn React')).toBeInTheDocument();
      
      const deleteButton = screen.getByText(/delete/i);
      await user.click(deleteButton);
      
      expect(screen.queryByText('Learn React')).not.toBeInTheDocument();
    });

    it('should clear completed todos', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText(/add todo/i);
      const addButton = screen.getByText(/add/i);
      
      // Add two todos
      await user.type(input, 'Learn React');
      await user.click(addButton);
      
      await user.type(input, 'Build App');
      await user.click(addButton);
      
      // Complete first todo
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      
      // Clear completed
      const clearButton = screen.getByText(/clear completed/i);
      await user.click(clearButton);
      
      expect(screen.queryByText('Learn React')).not.toBeInTheDocument();
      expect(screen.getByText('Build App')).toBeInTheDocument();
    });

    it('should handle empty todo input', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const addButton = screen.getByText(/add/i);
      await user.click(addButton);
      
      // Should not add empty todo
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // REDUCER TESTS
  // ============================================
  
  describe('Todo Reducer', () => {
    const initialState = {
      todos: [],
      nextId: 1
    };

    it('should add todo', () => {
      const action = { type: 'ADD_TODO' as const, payload: 'Learn React' };
      const newState = todoReducer(initialState, action);
      
      expect(newState.todos).toHaveLength(1);
      expect(newState.todos[0]).toEqual({
        id: 1,
        text: 'Learn React',
        completed: false
      });
      expect(newState.nextId).toBe(2);
    });

    it('should toggle todo completion', () => {
      const stateWithTodo = {
        todos: [{ id: 1, text: 'Learn React', completed: false }],
        nextId: 2
      };
      
      const action = { type: 'TOGGLE_TODO' as const, payload: 1 };
      const newState = todoReducer(stateWithTodo, action);
      
      expect(newState.todos[0].completed).toBe(true);
    });

    it('should delete todo', () => {
      const stateWithTodos = {
        todos: [
          { id: 1, text: 'Learn React', completed: false },
          { id: 2, text: 'Build App', completed: false }
        ],
        nextId: 3
      };
      
      const action = { type: 'DELETE_TODO' as const, payload: 1 };
      const newState = todoReducer(stateWithTodos, action);
      
      expect(newState.todos).toHaveLength(1);
      expect(newState.todos[0].text).toBe('Build App');
    });

    it('should clear completed todos', () => {
      const stateWithTodos = {
        todos: [
          { id: 1, text: 'Learn React', completed: true },
          { id: 2, text: 'Build App', completed: false }
        ],
        nextId: 3
      };
      
      const action = { type: 'CLEAR_COMPLETED' as const };
      const newState = todoReducer(stateWithTodos, action);
      
      expect(newState.todos).toHaveLength(1);
      expect(newState.todos[0].text).toBe('Build App');
    });
  });
});
