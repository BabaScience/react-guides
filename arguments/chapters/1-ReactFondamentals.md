# React Fundamentals for Angular Developers

> A comprehensive guide for Angular developers transitioning to React

---

## 1. Understanding React: What It Is and Why It's Used

### What is React?

React is a **JavaScript library** (not a framework like Angular) for building user interfaces, created by Facebook in 2013. It focuses on the **view layer** of your application.

**Key Difference from Angular:**
- **Angular**: Complete framework (routing, HTTP, forms, etc. built-in)
- **React**: Library focused on UI components (you choose additional libraries)

### Why React?

```
┌─────────────────────────────────────────────────┐
│           React Core Principles                 │
├─────────────────────────────────────────────────┤
│  • Component-Based Architecture                 │
│  • Declarative Programming                      │
│  • Virtual DOM for Performance                  │
│  • Unidirectional Data Flow                     │
│  • Learn Once, Write Anywhere                   │
└─────────────────────────────────────────────────┘
```

**Angular vs React Philosophy:**

| Aspect | Angular | React |
|--------|---------|-------|
| Type | Opinionated Framework | Flexible Library |
| Language | TypeScript (mandatory) | JavaScript/TypeScript |
| Data Flow | Two-way binding | One-way binding |
| Learning Curve | Steeper | Gentler |
| DOM Updates | Real DOM | Virtual DOM |

---

## 2. Setting Up a React Development Environment

### Option 1: Create React App (CRA) - Traditional Approach

```bash
# Install globally (once)
npm install -g create-react-app

# Create a new project
npx create-react-app my-react-app
cd my-react-app
npm start
```

### Option 2: Vite - Modern & Faster ⚡ (Recommended)

```bash
# Create a new project with Vite
npm create vite@latest my-react-app -- --template react

# Or with TypeScript (familiar for Angular devs!)
npm create vite@latest my-react-app -- --template react-ts

cd my-react-app
npm install
npm run dev
```

**Why Vite?**
- 🚀 Faster startup (like Angular's new esbuild)
- ⚡ Hot Module Replacement (HMR) is instant
- 📦 Smaller bundle sizes
- 🎯 Modern tooling

### Project Structure Comparison

```
Angular Project              React Project (Vite)
───────────────             ────────────────────
src/                        src/
├── app/                    ├── components/
│   ├── components/         │   └── MyComponent.jsx
│   ├── services/           ├── App.jsx
│   └── app.component.ts    ├── App.css
├── assets/                 ├── main.jsx
├── environments/           └── index.css
└── main.ts                 index.html
angular.json                vite.config.js
package.json                package.json
```

---

## 3. JSX Syntax: The React Template Language

### What is JSX?

JSX (JavaScript XML) is a syntax extension that allows you to write HTML-like code in JavaScript.

**Angular Template:**
```typescript
// user.component.html
<div class="user-card">
  <h2>{{ user.name }}</h2>
  <p>Age: {{ user.age }}</p>
</div>
```

**React JSX:**
```jsx
// UserCard.jsx
const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>Age: {user.age}</p>
    </div>
  );
};
```

### JSX Syntax Rules

```jsx
// 1. Use className instead of class (JavaScript keyword)
<div className="container">  // ✅ Correct
<div class="container">      // ❌ Wrong

// 2. All tags must be closed
<img src="photo.jpg" />      // ✅ Correct
<img src="photo.jpg">        // ❌ Wrong

// 3. Use camelCase for attributes
<button onClick={handleClick}>  // ✅ Correct
<button onclick={handleClick}>  // ❌ Wrong

// 4. Wrap multiple elements in a parent or Fragment
return (
  <div>                      // ✅ Option 1: Parent div
    <h1>Title</h1>
    <p>Text</p>
  </div>
);

return (
  <>                         // ✅ Option 2: Fragment (no extra DOM)
    <h1>Title</h1>
    <p>Text</p>
  </>
);

// 5. JavaScript expressions in curly braces
<h1>{user.name.toUpperCase()}</h1>
<p>{2 + 2}</p>
<div>{isLoggedIn ? 'Welcome' : 'Please login'}</div>
```

### JSX vs Angular Template Syntax

| Feature | Angular | React JSX |
|---------|---------|-----------|
| Interpolation | `{{ value }}` | `{value}` |
| Attribute | `[attr]="value"` | `attr={value}` |
| Class | `[class.active]="isActive"` | `className={isActive ? 'active' : ''}` |
| Event | `(click)="onClick()"` | `onClick={onClick}` |
| Loop | `*ngFor="let item of items"` | `{items.map(item => ...)}` |
| Condition | `*ngIf="condition"` | `{condition && ...}` |

---

## 4. Components: Building Blocks of React

### Functional Components (Modern Approach)

```jsx
// Simple Component
const Welcome = () => {
  return <h1>Benvenuto in React!</h1>;
};

// Component with Props
const Greeting = ({ name, age }) => {
  return (
    <div>
      <h1>Ciao, {name}!</h1>
      <p>Hai {age} anni.</p>
    </div>
  );
};

// Usage
<Greeting name="Marco" age={28} />
```

### Class Components (Legacy - Avoid in New Code)

```jsx
// Old way - similar to Angular components
class Welcome extends React.Component {
  render() {
    return <h1>Benvenuto in React!</h1>;
  }
}
```

**Why Functional Components?**
- ✅ Simpler syntax
- ✅ Easier to test
- ✅ Better performance
- ✅ Hooks enable state and lifecycle features
- ✅ Less boilerplate code

### Component Architecture Comparison

```
Angular Component                React Functional Component
─────────────────               ──────────────────────────

@Component({                    const UserProfile = ({ user }) => {
  selector: 'app-user',           const [isEditing, setIsEditing] = 
  template: `...`,                  useState(false);
  styles: [`...`]                 
})                                return (
export class UserComponent {      <div className="user-profile">
  user: User;                       <h2>{user.name}</h2>
  isEditing = false;                {isEditing && <EditForm />}
                                    </div>
  toggleEdit() {                  );
    this.isEditing = !this.isEditing;
  }                               };
}
```

---

## 5. Props: Passing Data Between Components

Props (properties) are **read-only** data passed from parent to child components.

### Basic Props Usage

```jsx
// Parent Component
const App = () => {
  return (
    <div>
      <UserCard 
        name="Giuseppe" 
        age={32} 
        city="Roma"
        isActive={true}
      />
    </div>
  );
};

// Child Component - Receiving Props
const UserCard = (props) => {
  return (
    <div className="card">
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
      <p>City: {props.city}</p>
      {props.isActive && <span>🟢 Active</span>}
    </div>
  );
};
```

### Destructuring Props (Recommended)

```jsx
// Cleaner syntax using destructuring
const UserCard = ({ name, age, city, isActive }) => {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>City: {city}</p>
      {isActive && <span>🟢 Active</span>}
    </div>
  );
};
```

### Default Props

```jsx
// Method 1: Default parameters
const Button = ({ text = "Click me", variant = "primary" }) => {
  return <button className={variant}>{text}</button>;
};

// Method 2: defaultProps (older approach)
Button.defaultProps = {
  text: "Click me",
  variant: "primary"
};
```

### Props vs Angular @Input

```
Angular                          React
───────                         ─────

@Input() name: string;          Props passed automatically
@Input() age: number;           const MyComponent = ({ name, age }) => {}

<app-user                       <UserComponent
  [name]="userName"               name={userName}
  [age]="userAge">                age={userAge}
</app-user>                     />
```

### Data Flow Visualization

```
        ┌─────────────┐
        │   App       │  Parent Component
        │  (Parent)   │
        └──────┬──────┘
               │ Props Flow Down ⬇️
               │ name="Marco"
               │ age={25}
               ▼
        ┌─────────────┐
        │  UserCard   │  Child Component
        │  (Child)    │  (Cannot modify props)
        └─────────────┘
```

**Key Rule:** Props flow **down** (unidirectional), data flows **up** via callbacks.

### Passing Functions as Props (Callbacks)

```jsx
// Parent Component
const TodoList = () => {
  const handleDelete = (id) => {
    console.log('Deleting todo:', id);
  };

  return <TodoItem id={1} onDelete={handleDelete} />;
};

// Child Component
const TodoItem = ({ id, onDelete }) => {
  return (
    <div>
      <span>Task {id}</span>
      <button onClick={() => onDelete(id)}>Delete</button>
    </div>
  );
};
```

**Angular Equivalent:** `@Output() eventEmitter = new EventEmitter()`

---

## 6. State Management with useState Hook

State represents data that **changes over time** and triggers re-renders.

### Basic useState Syntax

```jsx
import { useState } from 'react';

const Counter = () => {
  // [stateVariable, setterFunction] = useState(initialValue)
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Hai cliccato {count} volte</p>
      <button onClick={() => setCount(count + 1)}>
        Incrementa
      </button>
    </div>
  );
};
```

### useState vs Angular Component Properties

```
Angular                         React
───────                        ─────

export class Counter {          const Counter = () => {
  count = 0;                      const [count, setCount] = useState(0);
  
  increment() {                   const increment = () => {
    this.count++;                   setCount(count + 1);
  }                                 };
}                               };
```

### Multiple State Variables

```jsx
const UserForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      {/* ... */}
    </div>
  );
};
```

### Object and Array State

```jsx
// Object State
const [user, setUser] = useState({
  name: 'Marco',
  age: 28,
  city: 'Milano'
});

// Update object (must use spread operator)
const updateAge = () => {
  setUser({ ...user, age: 29 });  // ✅ Correct
  // user.age = 29;  // ❌ Never mutate state directly!
};

// Array State
const [todos, setTodos] = useState([]);

// Add item
const addTodo = (newTodo) => {
  setTodos([...todos, newTodo]);  // ✅ Correct
  // todos.push(newTodo);  // ❌ Wrong
};

// Remove item
const removeTodo = (id) => {
  setTodos(todos.filter(todo => todo.id !== id));
};
```

### State Update Patterns

```jsx
const [count, setCount] = useState(0);

// ❌ Wrong - may not have latest state
const increment = () => {
  setCount(count + 1);
  setCount(count + 1);  // Won't increment by 2!
};

// ✅ Correct - functional update
const increment = () => {
  setCount(prevCount => prevCount + 1);
  setCount(prevCount => prevCount + 1);  // Will increment by 2
};
```

### State Visualization

```
┌────────────────────────────────────────┐
│  Component Rendering Cycle             │
├────────────────────────────────────────┤
│                                        │
│  Initial Render                        │
│  ↓                                     │
│  [count = 0] displayed                 │
│  ↓                                     │
│  User clicks button                    │
│  ↓                                     │
│  setCount(1) called                    │
│  ↓                                     │
│  React schedules re-render             │
│  ↓                                     │
│  Component re-runs with [count = 1]    │
│  ↓                                     │
│  DOM updates to show new value         │
│                                        │
└────────────────────────────────────────┘
```

---

## 7. Event Handling in React

### Basic Event Handling

```jsx
const Button = () => {
  const handleClick = () => {
    console.log('Bottone cliccato!');
  };

  return <button onClick={handleClick}>Clicca qui</button>;
};
```

### Inline Event Handlers

```jsx
// Inline function
<button onClick={() => console.log('Clicked!')}>Click</button>

// With parameters
<button onClick={() => handleDelete(userId)}>Delete</button>
```

### Common Events

```jsx
const EventExamples = () => {
  return (
    <div>
      {/* Click Events */}
      <button onClick={() => console.log('Click')}>Click</button>
      <button onDoubleClick={() => console.log('Double')}>Double Click</button>

      {/* Mouse Events */}
      <div 
        onMouseEnter={() => console.log('Mouse entered')}
        onMouseLeave={() => console.log('Mouse left')}
      >
        Hover me
      </div>

      {/* Input Events */}
      <input 
        onChange={(e) => console.log(e.target.value)}
        onFocus={() => console.log('Focused')}
        onBlur={() => console.log('Blurred')}
      />

      {/* Form Events */}
      <form onSubmit={(e) => {
        e.preventDefault();
        console.log('Form submitted');
      }}>
        <button type="submit">Submit</button>
      </form>

      {/* Keyboard Events */}
      <input
        onKeyDown={(e) => console.log('Key down:', e.key)}
        onKeyPress={(e) => console.log('Key press:', e.key)}
      />
    </div>
  );
};
```

### Event Object

```jsx
const handleClick = (event) => {
  console.log('Event type:', event.type);
  console.log('Target element:', event.target);
  console.log('Button clicked:', event.button);
  
  // Prevent default behavior
  event.preventDefault();
  
  // Stop event propagation
  event.stopPropagation();
};

<button onClick={handleClick}>Click</button>
```

### Angular vs React Events

| Angular | React | Description |
|---------|-------|-------------|
| `(click)="onClick()"` | `onClick={onClick}` | Click event |
| `(change)="onChange($event)"` | `onChange={(e) => onChange(e)}` | Change event |
| `(submit)="onSubmit()"` | `onSubmit={onSubmit}` | Form submit |
| `(keyup)="onKeyUp($event)"` | `onKeyUp={(e) => onKeyUp(e)}` | Key up |
| `(mouseenter)="onEnter()"` | `onMouseEnter={onEnter}` | Mouse enter |

**Key Difference:** React uses camelCase (`onClick`) vs Angular's lowercase (`(click)`)

### Passing Parameters to Event Handlers

```jsx
const TodoList = () => {
  const handleDelete = (id) => {
    console.log('Deleting todo:', id);
  };

  return (
    <div>
      {/* Method 1: Arrow function */}
      <button onClick={() => handleDelete(1)}>Delete</button>

      {/* Method 2: bind (less common in modern React) */}
      <button onClick={handleDelete.bind(null, 1)}>Delete</button>
    </div>
  );
};
```

---

## 8. Conditional Rendering Techniques

React doesn't have directives like Angular's `*ngIf`. Instead, use JavaScript expressions.

### 1. Conditional Rendering with && (Short-circuit)

```jsx
const Greeting = ({ isLoggedIn, username }) => {
  return (
    <div>
      {isLoggedIn && <h1>Benvenuto, {username}!</h1>}
      {!isLoggedIn && <h1>Per favore, effettua il login</h1>}
    </div>
  );
};
```

### 2. Ternary Operator

```jsx
const LoginButton = ({ isLoggedIn }) => {
  return (
    <button>
      {isLoggedIn ? 'Logout' : 'Login'}
    </button>
  );
};

// Complex example
const UserStatus = ({ user }) => {
  return (
    <div>
      {user ? (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>Nessun utente trovato</p>
      )}
    </div>
  );
};
```

### 3. If-Else with Early Return

```jsx
const UserProfile = ({ user }) => {
  // Early return for null/undefined
  if (!user) {
    return <p>Caricamento...</p>;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  return <UserDashboard user={user} />;
};
```

### 4. Switch Statement (using objects)

```jsx
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { text: 'In attesa', color: 'yellow' },
    approved: { text: 'Approvato', color: 'green' },
    rejected: { text: 'Rifiutato', color: 'red' }
  };

  const config = statusConfig[status] || { text: 'Sconosciuto', color: 'gray' };

  return (
    <span style={{ color: config.color }}>
      {config.text}
    </span>
  );
};
```

### 5. Multiple Conditions

```jsx
const Dashboard = ({ user, isLoading, error }) => {
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && user && (
        <UserProfile user={user} />
      )}
      {!isLoading && !error && !user && (
        <p>Nessun dato disponibile</p>
      )}
    </div>
  );
};
```

### Angular vs React Conditional Rendering

```
Angular                         React
───────                        ─────

<div *ngIf="isVisible">         {isVisible && <div>Content</div>}
  Content
</div>

<div *ngIf="user; else          {user ? (
  loading">                       <div>{user.name}</div>
  {{user.name}}                 ) : (
</div>                            <div>Loading...</div>
<ng-template #loading>          )}
  Loading...
</ng-template>

<div [ngSwitch]="status">       {status === 'active' && <Active />}
  <div *ngSwitchCase=           {status === 'inactive' && <Inactive />}
    "'active'">Active</div>     {status === 'pending' && <Pending />}
  <div *ngSwitchCase=
    "'inactive'">Inactive</div>
</div>
```

---

## 9. Lists and Keys: Rendering Multiple Elements

### Basic List Rendering

```jsx
const TodoList = () => {
  const todos = [
    { id: 1, text: 'Imparare React', completed: false },
    { id: 2, text: 'Costruire un progetto', completed: false },
    { id: 3, text: 'Deployare l\'app', completed: true }
  ];

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          {todo.text} - {todo.completed ? '✅' : '⏳'}
        </li>
      ))}
    </ul>
  );
};
```

### Why Keys Are Important

Keys help React identify which items have changed, been added, or removed.

```jsx
// ❌ BAD - Using array index as key (avoid if list can change)
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>
))}

// ❌ VERY BAD - No key
{todos.map((todo) => (
  <li>{todo.text}</li>
))}

// ✅ GOOD - Using unique ID
{todos.map((todo) => (
  <li key={todo.id}>{todo.text}</li>
))}
```

### Key Rules

```
┌────────────────────────────────────────┐
│         Key Requirements               │
├────────────────────────────────────────┤
│  ✅ Must be unique among siblings      │
│  ✅ Should be stable (not change)      │
│  ✅ Should be predictable              │
│  ✅ Prefer ID over index               │
│  ❌ Don't use Math.random()            │
└────────────────────────────────────────┘
```

### Complex List Example

```jsx
const UserList = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Marco', age: 28, city: 'Roma' },
    { id: 2, name: 'Giulia', age: 25, city: 'Milano' },
    { id: 3, name: 'Francesco', age: 32, city: 'Napoli' }
  ]);

  return (
    <div className="user-list">
      {users.map((user) => (
        <div key={user.id} className="user-card">
          <h3>{user.name}</h3>
          <p>Età: {user.age}</p>
          <p>Città: {user.city}</p>
          <button onClick={() => handleDelete(user.id)}>
            Elimina
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Extracting List Items to Components

```jsx
// Better approach - separate component
const UserCard = ({ user, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>Età: {user.age}</p>
      <p>Città: {user.city}</p>
      <button onClick={() => onDelete(user.id)}>
        Elimina
      </button>
    </div>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([...]);

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="user-list">
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onDelete={handleDelete} 
        />
      ))}
    </div>
  );
};
```

### Filtering and Sorting Lists

```jsx
const FilteredList = () => {
  const [todos, setTodos] = useState([...]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Filter logic
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // Sort logic
  const sortedTodos = [...filteredTodos].sort((a, b) => 
    a.text.localeCompare(b.text)
  );

  return (
    <div>
      <div>
        <button onClick={() => setFilter('all')}>Tutti</button>
        <button onClick={() => setFilter('active')}>Attivi</button>
        <button onClick={() => setFilter('completed')}>Completati</button>
      </div>
      
      <ul>
        {sortedTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Angular vs React Lists

```
Angular                         React
───────                        ─────

<div *ngFor="let item          {items.map(item => (
  of items">                     <div key={item.id}>
  {{item.name}}                    {item.name}
</div>                           </div>
                               ))}

<div *ngFor="let item          {items.map((item, index) => (
  of items; let i = index">      <div key={item.id}>
  {{i}}: {{item.name}}             {index}: {item.name}
</div>                           </div>
                               ))}
```

---

## 10. Forms and Controlled Components

In React, form elements can be either **controlled** (React manages state) or **uncontrolled** (DOM manages state). **Controlled components** are preferred.

### Controlled Input Example

```jsx
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    console.log('Login:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <button type="submit">Login</button>
    </form>
  );
};
```

### Controlled vs Uncontrolled

```jsx
// ✅ Controlled Component (Recommended)
const ControlledInput = () => {
  const [value, setValue] = useState('');
  
  return (
    <input 
      value={value} 
      onChange={(e) => setValue(e.target.value)} 
    />
  );
};

// Uncontrolled Component (less common)
const UncontrolledInput = () => {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return <input ref={inputRef} />;
};
```

### Different Form Elements

```jsx
const CompleteForm = () => {
  // State for different input types
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    country: 'italy',
    subscribe: false,
    gender: '',
    skills: []
  });

  // Generic handler for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Checkbox array handler
  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Text Input */}
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
      />

      {/* Email Input */}
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />

      {/* Password Input */}
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />

      {/* Textarea */}
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        placeholder="Bio"
        rows="4"
      />

      {/* Select Dropdown */}
      <select name="country" value={formData.country} onChange={handleChange}>
        <option value="italy">Italia</option>
        <option value="spain">Spagna</option>
        <option value="france">Francia</option>
      </select>

      {/* Single Checkbox */}
      <label>
        <input
          type="checkbox"
          name="subscribe"
          checked={formData.subscribe}
          onChange={handleChange}
        />
        Iscriviti alla newsletter
      </label>

      {/* Radio Buttons */}
      <div>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formData.gender === 'male'}
            onChange={handleChange}
          />
          Maschio
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={formData.gender === 'female'}
            onChange={handleChange}
          />
          Femmina
        </label>
      </div>

      {/* Multiple Checkboxes */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.skills.includes('react')}
            onChange={() => handleSkillChange('react')}
          />
          React
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.skills.includes('angular')}
            onChange={() => handleSkillChange('angular')}
          />
          Angular
        </label>
      </div>

      <button type="submit">Invia</button>
    </form>
  );
};
```

### Form Validation Example

```jsx
const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La password deve avere almeno 8 caratteri';
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form valido!', formData);
      // Submit to API
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Conferma Password"
        />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit">Registrati</button>
    </form>
  );
};
```

### Angular Forms vs React Forms

```
Angular (Template-Driven)       React (Controlled)
─────────────────────          ──────────────────

<form #form="ngForm"            <form onSubmit={handleSubmit}>
  (ngSubmit)="onSubmit()">        <input
  <input                            value={email}
    [(ngModel)]="email"             onChange={(e) => 
    name="email">                     setEmail(e.target.value)}
</form>                           />
                                </form>

Angular (Reactive)              React
──────────────────             ─────

this.form = new FormGroup({     const [formData, setFormData] = 
  email: new FormControl('')      useState({ email: '' });
});

<input [formControl]=           <input
  "form.get('email')">            value={formData.email}
                                  onChange={(e) => setFormData({
                                    ...formData, 
                                    email: e.target.value 
                                  })}
                                />
```

---

## Summary: Key Takeaways for Angular Developers

### Mental Model Shifts

| Concept | Angular | React |
|---------|---------|-------|
| **Templates** | Separate HTML files | JSX in component |
| **Data Binding** | Two-way `[(ngModel)]` | One-way + onChange |
| **Directives** | `*ngIf`, `*ngFor` | JS expressions |
| **State** | Component properties | `useState` hook |
| **Props** | `@Input()` decorators | Function parameters |
| **Events** | `@Output()` + EventEmitter | Callback props |
| **Lifecycle** | Lifecycle hooks | `useEffect` hook |
| **Services** | Dependency Injection | Context API / Props |

### React Philosophy

```
┌────────────────────────────────────────┐
│     React Core Principles              │
├────────────────────────────────────────┤
│  1. Components are functions           │
│  2. Props flow down                    │
│  3. Events flow up                     │
│  4. State triggers re-renders          │
│  5. Immutability is key                │
│  6. Composition over inheritance       │
└────────────────────────────────────────┘
```

### Next Steps

1. **Practice with small projects**: Todo list, weather app, form validation
2. **Learn React Hooks**: `useEffect`, `useContext`, `useReducer`
3. **Explore ecosystem**: React Router, State Management (Redux, Zustand)
4. **TypeScript**: Add type safety (you'll feel at home!)
5. **Build tools**: Deep dive into Vite, Webpack
6. **Testing**: Jest, React Testing Library

### Useful Resources

- 📘 [Official React Docs](https://react.dev)
- 🎓 [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- 🛠️ [Vite Documentation](https://vitejs.dev)
- 📦 [npm trends](https://npmtrends.com) - Compare React libraries

---

**Buon Coding! 🚀**