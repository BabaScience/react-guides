import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Greeting,
  UserCard,
  TodoList,
  Counter,
  StatusMessage,
  ActionButton,
  ContactForm,
  FilteredList
} from './index';

describe('Module 01: React Fundamentals', () => {
  
  // ============================================
  // EXERCISE 1: Basic Greeting
  // ============================================
  
  describe('Exercise 1: Greeting Component', () => {
    it('should render greeting with provided name', () => {
      render(<Greeting name="Alice" />);
      expect(screen.getByText('Hello, Alice!')).toBeInTheDocument();
    });

    it('should render default greeting when no name provided', () => {
      render(<Greeting />);
      expect(screen.getByText('Hello, Guest!')).toBeInTheDocument();
    });

    it('should handle empty string name', () => {
      render(<Greeting name="" />);
      expect(screen.getByText('Hello, !')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 2: User Card
  // ============================================
  
  describe('Exercise 2: UserCard Component', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };

    it('should render all user information', () => {
      render(<UserCard {...mockUser} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Age: 30/i)).toBeInTheDocument();
    });

    it('should handle different age values', () => {
      render(<UserCard {...mockUser} age={25} />);
      expect(screen.getByText(/Age: 25/i)).toBeInTheDocument();
    });

    it('should handle different email formats', () => {
      render(<UserCard {...mockUser} email="test.user+tag@domain.co.uk" />);
      expect(screen.getByText('test.user+tag@domain.co.uk')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 3: Todo List
  // ============================================
  
  describe('Exercise 3: TodoList Component', () => {
    const mockTodos = [
      { id: 1, text: 'Learn React', completed: false },
      { id: 2, text: 'Build project', completed: false },
      { id: 3, text: 'Deploy app', completed: true }
    ];

    it('should render all todos', () => {
      render(<TodoList todos={mockTodos} />);
      
      expect(screen.getByText('Learn React')).toBeInTheDocument();
      expect(screen.getByText('Build project')).toBeInTheDocument();
      expect(screen.getByText('Deploy app')).toBeInTheDocument();
    });

    it('should render empty list when no todos provided', () => {
      render(<TodoList todos={[]} />);
      const list = screen.getByRole('list');
      expect(list.children.length).toBe(0);
    });

    it('should handle single todo', () => {
      const singleTodo = [{ id: 1, text: 'Single task', completed: false }];
      render(<TodoList todos={singleTodo} />);
      expect(screen.getByText('Single task')).toBeInTheDocument();
    });

    it('should display completion status', () => {
      render(<TodoList todos={mockTodos} />);
      
      // Check for completion indicators
      const completedTodo = screen.getByText('Deploy app');
      expect(completedTodo).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 4: Counter with State
  // ============================================
  
  describe('Exercise 4: Counter Component', () => {
    it('should start at 0', () => {
      render(<Counter />);
      expect(screen.getByText(/Count: 0/i)).toBeInTheDocument();
    });

    it('should increment when increment button clicked', () => {
      render(<Counter />);
      const incrementButton = screen.getByText(/increment/i);
      
      fireEvent.click(incrementButton);
      expect(screen.getByText(/Count: 1/i)).toBeInTheDocument();
      
      fireEvent.click(incrementButton);
      expect(screen.getByText(/Count: 2/i)).toBeInTheDocument();
    });

    it('should decrement when decrement button clicked', () => {
      render(<Counter />);
      const decrementButton = screen.getByText(/decrement/i);
      
      fireEvent.click(decrementButton);
      expect(screen.getByText(/Count: -1/i)).toBeInTheDocument();
    });

    it('should increment and decrement correctly', () => {
      render(<Counter />);
      const incrementButton = screen.getByText(/increment/i);
      const decrementButton = screen.getByText(/decrement/i);
      
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(decrementButton);
      
      expect(screen.getByText(/Count: 1/i)).toBeInTheDocument();
    });

    it('should handle multiple rapid clicks', () => {
      render(<Counter />);
      const incrementButton = screen.getByText(/increment/i);
      
      // Click multiple times rapidly
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      fireEvent.click(incrementButton);
      
      expect(screen.getByText(/Count: 3/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 5: Conditional Rendering
  // ============================================
  
  describe('Exercise 5: StatusMessage Component', () => {
    it('should show loading state', () => {
      render(<StatusMessage isLoading={true} />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error message', () => {
      render(<StatusMessage isLoading={false} error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show data when available', () => {
      render(<StatusMessage isLoading={false} data="Success!" />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('should prioritize loading over error', () => {
      render(<StatusMessage isLoading={true} error="Error" />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });

    it('should prioritize error over data', () => {
      render(<StatusMessage isLoading={false} error="Error" data="Data" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Data')).not.toBeInTheDocument();
    });

    it('should show nothing when no state provided', () => {
      render(<StatusMessage isLoading={false} />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/data/i)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 6: Event Handler Button
  // ============================================
  
  describe('Exercise 6: ActionButton Component', () => {
    it('should render button with text', () => {
      const mockClick = jest.fn();
      render(<ActionButton text="Click me" onClick={mockClick} />);
      
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call onClick when clicked', () => {
      const mockClick = jest.fn();
      render(<ActionButton text="Test Button" onClick={mockClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times', () => {
      const mockClick = jest.fn();
      render(<ActionButton text="Multi Click" onClick={mockClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockClick).toHaveBeenCalledTimes(3);
    });

    it('should handle different button texts', () => {
      const mockClick = jest.fn();
      render(<ActionButton text="Save Changes" onClick={mockClick} />);
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 7: Controlled Input Form
  // ============================================
  
  describe('Exercise 7: ContactForm Component', () => {
    it('should render form inputs', () => {
      const mockSubmit = jest.fn();
      render(<ContactForm onSubmit={mockSubmit} />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should handle input changes', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      render(<ContactForm onSubmit={mockSubmit} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
    });

    it('should submit form with correct data', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      render(<ContactForm onSubmit={mockSubmit} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await user.type(nameInput, 'Jane Smith');
      await user.type(emailInput, 'jane@test.com');
      await user.click(submitButton);
      
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane@test.com'
      });
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      const mockSubmit = jest.fn();
      render(<ContactForm onSubmit={mockSubmit} />);
      
      const form = screen.getByRole('form');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await user.click(submitButton);
      
      // Form should not cause page reload (preventDefault called)
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  // ============================================
  // EXERCISE 8: Filtered List with State
  // ============================================
  
  describe('Exercise 8: FilteredList Component', () => {
    const mockItems = [
      { id: 1, name: 'Apple', category: 'Fruit' },
      { id: 2, name: 'Banana', category: 'Fruit' },
      { id: 3, name: 'Carrot', category: 'Vegetable' },
      { id: 4, name: 'Broccoli', category: 'Vegetable' }
    ];

    it('should render all items initially', () => {
      render(<FilteredList items={mockItems} />);
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
      expect(screen.getByText('Broccoli')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<FilteredList items={mockItems} />);
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('should filter items based on search term', async () => {
      const user = userEvent.setup();
      render(<FilteredList items={mockItems} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'a');
      
      // Should show items containing 'a'
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
      expect(screen.queryByText('Broccoli')).not.toBeInTheDocument();
    });

    it('should filter items case-insensitively', async () => {
      const user = userEvent.setup();
      render(<FilteredList items={mockItems} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'APPLE');
      
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });

    it('should show no results when no matches', async () => {
      const user = userEvent.setup();
      render(<FilteredList items={mockItems} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'xyz');
      
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      expect(screen.queryByText('Carrot')).not.toBeInTheDocument();
      expect(screen.queryByText('Broccoli')).not.toBeInTheDocument();
    });

    it('should clear filter when search is cleared', async () => {
      const user = userEvent.setup();
      render(<FilteredList items={mockItems} />);
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'a');
      await user.clear(searchInput);
      
      // All items should be visible again
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
      expect(screen.getByText('Broccoli')).toBeInTheDocument();
    });
  });
});
