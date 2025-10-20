import React, { useState } from 'react';

/**
 * MODULE 01: React Fundamentals
 * 
 * ANGULAR DEVELOPER NOTES:
 * - No @Component decorator needed
 * - Functional components are pure functions
 * - Props replace @Input() decorators
 * - TypeScript interfaces define prop types
 * - useState replaces class properties
 * - JSX replaces template strings
 */

// ============================================
// EXERCISE 1: Basic Greeting Component
// ============================================

/**
 * OBJECTIVE: Create a Greeting component that displays a personalized message
 * 
 * ANGULAR EQUIVALENT:
 * @Component({
 *   selector: 'app-greeting',
 *   template: '<h1>Hello, {{name}}!</h1>'
 * })
 * export class GreetingComponent {
 *   @Input() name: string = 'Guest';
 * }
 * 
 * INSTRUCTIONS:
 * - Accept a 'name' prop (optional, defaults to 'Guest')
 * - Render: "Hello, [name]!"
 * - Use TypeScript for type safety
 */

interface GreetingProps {
  name?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ name = 'Guest' }) => {
  // TODO: Implement greeting component
  // Should render: "Hello, [name]!"
  return (<div>
    Hello, {name}!
  </div>);
};

// ============================================
// EXERCISE 2: User Card with Multiple Props
// ============================================

/**
 * OBJECTIVE: Create a UserCard component with multiple typed props
 * 
 * ANGULAR EQUIVALENT: Multiple @Input() decorators with types
 * 
 * INSTRUCTIONS:
 * - Accept name, email, and age props
 * - Display user information in a card format
 * - Use proper TypeScript interfaces
 */

interface UserCardProps {
  name: string;
  email: string;
  age: number;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, age }) => {
  // TODO: Implement user card component
  // Should display: name, email, and age
  return (
  <div>
    <span>{name}</span>
    <span>Age: {age}</span>
    <span>{email}</span>
  </div>);
};

// ============================================
// EXERCISE 3: Todo List (Arrays & Keys)
// ============================================

/**
 * OBJECTIVE: Render a list of items with proper key management
 * 
 * ANGULAR EQUIVALENT: *ngFor with trackBy
 * 
 * INSTRUCTIONS:
 * - Accept an array of todos
 * - Render each todo with a unique key
 * - Display todo text and completion status
 */

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
}

export const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  // TODO: Implement todo list
  // Remember: Each list item needs a unique key!
  // Use: the map method to render each todo
  return (
    <ul>
    {todos.map((todo) => (
        <li key={todo.id}>
          <span>{todo.text}</span>
          {todo.completed ? ' ✅' : ' ⏳'}
        </li>
    ))}
    </ul>
  );
  
};

// ============================================
// EXERCISE 4: Counter with State
// ============================================

/**
 * OBJECTIVE: Create a counter component using useState hook
 * 
 * ANGULAR EQUIVALENT: Class property with methods
 * 
 * INSTRUCTIONS:
 * - Use useState to manage count state
 * - Provide increment and decrement buttons
 * - Display current count value
 */

export const Counter: React.FC = () => {
  // TODO: Implement counter using useState
  // Should have increment and decrement buttons
  // Display: "Count: [number]"
  const [count, setCount] = useState(0);
  return <div>
    <button onClick={ () => setCount(count + 1)}>Incrementa</button>
    <button onClick={ () => setCount(count - 1)}>Decrementa</button>
    <p>Count: {count}</p>
  </div>;
};

// ============================================
// EXERCISE 5: Conditional Rendering
// ============================================

/**
 * OBJECTIVE: Implement conditional rendering based on props
 * 
 * ANGULAR EQUIVALENT: *ngIf directive
 * 
 * INSTRUCTIONS:
 * - Show loading state when isLoading is true
 * - Show error message when error exists
 * - Show data when available
 * - Prioritize: loading > error > data
 */

interface StatusMessageProps {
  isLoading: boolean;
  error?: string;
  data?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ isLoading, error, data }) => {
  // TODO: Implement conditional rendering
  // Show loading state, error, or data
  // Use: isLoading && <div>Loading...</div>
  // Use: error && <div>Error: {error}</div>
  // Use: data && <div>{data}</div>
  if (isLoading) {
    return <p>Loading..</p>
  }

  if (error) {
    return <p>{error}</p>
  }  
  
  if (data) {
    return <p>{data}</p>
  }
  return null;
};

// ============================================
// EXERCISE 6: Event Handler Button
// ============================================

/**
 * OBJECTIVE: Create a button that handles click events
 * 
 * ANGULAR EQUIVALENT: (click)="onClick()"
 * 
 * INSTRUCTIONS:
 * - Accept onClick callback prop
 * - Handle button click events
 * - Display button text
 */

interface ActionButtonProps {
  text: string;
  onClick: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ text, onClick }) => {
  // TODO: Implement button with click handler
  // Use: <button onClick={onClick}>{text}</button>
  return (
    <button onClick={onClick}>{text}</button>
  );
};

// ============================================
// EXERCISE 7: Controlled Input Form
// ============================================

/**
 * OBJECTIVE: Create a form with controlled input components
 * 
 * ANGULAR EQUIVALENT: [(ngModel)]="value"
 * 
 * INSTRUCTIONS:
 * - Use useState to manage form state
 * - Create controlled input fields
 * - Handle form submission
 * - Display form data
 */

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  // TODO: Implement controlled form
  // Use useState for name and email
  // Use: <input value={name} onChange={(e) => setName(e.target.value)} />
  // Handle form submission with preventDefault
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({name, email})
  }
  return <form onSubmit={handleSubmit} role="form">
    <label htmlFor="name">Name:</label>
    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}></input>
    <label htmlFor="email">Email:</label>
    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>

    <button type="submit">Submit</button>
  </form>
};

// ============================================
// EXERCISE 8: Filtered List with State
// ============================================

/**
 * OBJECTIVE: Create a list with filtering capabilities
 * 
 * ANGULAR EQUIVALENT: *ngFor with filter pipe
 * 
 * INSTRUCTIONS:
 * - Use useState to manage filter state
 * - Filter items based on search term
 * - Display filtered results
 * - Provide search input
 */

interface Item {
  id: number;
  name: string;
  category: string;
}

interface FilteredListProps {
  items: Item[];
}

export const FilteredList: React.FC<FilteredListProps> = ({ items }) => {
  // TODO: Implement filtered list
  // Use useState for search term
  // Filter items: items.filter(item => item.name.includes(searchTerm))
  // Display search input and filtered results
  const [searchTerm, setSearchTerm]=useState('');

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div>
    <input type="search" placeholder='Search' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}></input>

    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  </div>;
};
