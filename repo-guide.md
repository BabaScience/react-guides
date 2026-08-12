# React Mastery Exercises - Complete Setup Guide

## 🏗️ Repository Structure

```
react-mastery-exercises/
├── src/
│   ├── 01-fundamentals/
│   │   ├── index.tsx
│   │   ├── index.test.tsx
│   │   └── README.md
│   ├── 02-hooks/
│   │   ├── index.tsx
│   │   ├── index.test.tsx
│   │   └── README.md
│   ├── 03-component-patterns/
│   ├── 04-styling/
│   ├── 05-routing/
│   ├── 06-state-management/
│   ├── 07-data-fetching/
│   ├── 08-forms/
│   ├── 09-performance/
│   ├── 10-testing/
│   ├── 11-typescript/
│   └── 12-advanced-patterns/
├── scripts/
│   ├── test-runner.js
│   └── check-progress.js
├── docs/
│   ├── getting-started.md
│   └── angular-to-react.md
├── package.json
├── jest.config.js
├── tsconfig.json
└── README.md
```

---

## 📦 package.json

```json
{
  "name": "react-mastery-exercises",
  "version": "1.0.0",
  "description": "Test-driven React learning for Angular developers",
  "scripts": {
    "test": "node scripts/test-runner.js",
    "test:watch": "node scripts/test-runner.js --watch",
    "progress": "node scripts/check-progress.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.3"
  }
}
```

---

## ⚙️ jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/index.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  collectCoverageFrom: [
    'src/**/index.tsx',
    '!src/**/index.test.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
};
```

---

## 📝 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 🔧 scripts/test-runner.js

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const moduleArg = args.find(arg => !arg.startsWith('--'));
const isWatch = args.includes('--watch');

if (!moduleArg || isNaN(moduleArg)) {
  console.log('\n❌ Usage: npm test [module_number] [options]');
  console.log('\nExamples:');
  console.log('  npm test 1           - Test module 1 only');
  console.log('  npm test 3           - Test modules 1, 2, and 3');
  console.log('  npm test 5 -- --watch - Watch mode for modules 1-5');
  console.log('\n');
  process.exit(1);
}

const maxModule = parseInt(moduleArg);

if (maxModule < 1 || maxModule > 12) {
  console.log('\n❌ Module number must be between 1 and 12\n');
  process.exit(1);
}

// Generate array of module numbers: ['01', '02', '03', ...]
const modules = Array.from(
  { length: maxModule },
  (_, i) => String(i + 1).padStart(2, '0')
);

// Create test pattern that matches any of these modules
const testPattern = modules
  .map(num => `src/${num}-[^/]+/index\\.test\\.tsx`)
  .join('|');

console.log(`\n🧪 Running tests for modules 1-${maxModule}\n`);
console.log('Modules included:', modules.join(', '));
console.log('');

const watchFlag = isWatch ? '--watch' : '';

try {
  execSync(
    `jest --testPathPattern="${testPattern}" ${watchFlag}`,
    {
      stdio: 'inherit',
      cwd: process.cwd()
    }
  );
} catch (error) {
  console.log('\n❌ Tests failed\n');
  process.exit(1);
}
```

---

## 📊 scripts/check-progress.js

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODULES = [
  { num: '01', name: 'Fundamentals' },
  { num: '02', name: 'Hooks Deep Dive' },
  { num: '03', name: 'Component Patterns' },
  { num: '04', name: 'Styling' },
  { num: '05', name: 'Routing' },
  { num: '06', name: 'State Management' },
  { num: '07', name: 'Data Fetching' },
  { num: '08', name: 'Forms & Validation' },
  { num: '09', name: 'Performance' },
  { num: '10', name: 'Testing' },
  { num: '11', name: 'TypeScript' },
  { num: '12', name: 'Advanced Patterns' }
];

console.log('\n📊 React Mastery Progress Report\n');
console.log('='.repeat(60));

let totalPassed = 0;
let totalTests = 0;

MODULES.forEach((module, index) => {
  const testPath = `src/${module.num}-*/index.test.tsx`;
  
  try {
    const result = execSync(
      `jest --testPathPattern="${testPath}" --silent --json`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    const jsonResult = JSON.parse(result);
    const passed = jsonResult.numPassedTests || 0;
    const total = jsonResult.numTotalTests || 0;
    const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    totalPassed += passed;
    totalTests += total;
    
    const status = passed === total ? '✅' : '⏳';
    const bar = createProgressBar(passed, total);
    
    console.log(`${status} Module ${module.num}: ${module.name}`);
    console.log(`   ${bar} ${passed}/${total} (${percentage}%)`);
    console.log('');
    
  } catch (error) {
    console.log(`❌ Module ${module.num}: ${module.name}`);
    console.log(`   Error running tests`);
    console.log('');
  }
});

console.log('='.repeat(60));
const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
console.log(`\nOverall Progress: ${totalPassed}/${totalTests} tests (${overallPercentage}%)`);

if (totalPassed === totalTests && totalTests > 0) {
  console.log('\n🎉 Congratulations! All exercises completed!\n');
} else {
  console.log(`\n💪 Keep going! You're making great progress.\n`);
}

function createProgressBar(current, total, width = 30) {
  if (total === 0) return '░'.repeat(width);
  
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  return '█'.repeat(filled) + '░'.repeat(empty);
}
```

---

## 📚 Example Module: src/01-fundamentals/

### index.tsx (Student Implementation)

```typescript
import React from 'react';

/**
 * MODULE 01: React Fundamentals
 * 
 * ANGULAR DEVELOPER NOTES:
 * - No @Component decorator needed
 * - Functional components are pure functions
 * - Props replace @Input() decorators
 * - TypeScript interfaces define prop types
 */

// ============================================
// EXERCISE 1: Basic Greeting Component
// ============================================

interface GreetingProps {
  name?: string;
}

export const Greeting: React.FC<GreetingProps> = ({ name = 'Guest' }) => {
  // TODO: Implement greeting component
  // Should render: "Hello, [name]!"
  return null;
};

// ============================================
// EXERCISE 2: User Card with Multiple Props
// ============================================

interface UserCardProps {
  name: string;
  email: string;
  age: number;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, age }) => {
  // TODO: Implement user card component
  return null;
};

// ============================================
// EXERCISE 3: Todo List (Arrays & Keys)
// ============================================

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
  return null;
};

// ============================================
// EXERCISE 4: Counter with State
// ============================================

export const Counter: React.FC = () => {
  // TODO: Implement counter using useState
  // Should have increment and decrement buttons
  return null;
};

// ============================================
// EXERCISE 5: Conditional Rendering
// ============================================

interface StatusMessageProps {
  isLoading: boolean;
  error?: string;
  data?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ isLoading, error, data }) => {
  // TODO: Implement conditional rendering
  // Show loading state, error, or data
  return null;
};
```

### index.test.tsx (Pre-written Tests)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Greeting,
  UserCard,
  TodoList,
  Counter,
  StatusMessage
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
  });
});
```

### README.md

```markdown
# Module 01: React Fundamentals

## 🎯 Learning Objectives

Master foundational React concepts essential for Angular developers:

1. **Functional Components** - Understanding React's component model
2. **Props & Types** - Unidirectional data flow with TypeScript
3. **Lists & Keys** - Efficient rendering of collections
4. **State Management** - Using the useState hook
5. **Conditional Rendering** - Dynamic UI based on conditions

## 🔗 Angular to React Mapping

### Component Definition

**Angular:**
```typescript
@Component({
  selector: 'app-greeting',
  template: '<h1>Hello, {{name}}!</h1>'
})
export class GreetingComponent {
  @Input() name: string = 'Guest';
}
```

**React:**
```typescript
interface GreetingProps {
  name?: string;
}

const Greeting: React.FC<GreetingProps> = ({ name = 'Guest' }) => {
  return <h1>Hello, {name}!</h1>;
};
```

### Key Differences

| Concept | Angular | React |
|---------|---------|-------|
| Component | `@Component` class | Function returning JSX |
| Props | `@Input()` decorator | Function parameters |
| Template | String template | JSX (JavaScript expressions) |
| State | Class properties | `useState` hook |
| Loops | `*ngFor` directive | `.map()` method |
| Conditionals | `*ngIf` directive | Ternary / `&&` operator |

## 🚀 Getting Started

```bash
# Test this module only
npm test 1

# Watch mode
npm test 1 -- --watch

# Check progress
npm run progress
```

## 💡 Key Concepts

### 1. JSX is JavaScript

Unlike Angular templates, JSX is JavaScript. You use actual JavaScript expressions:

```tsx
// Angular template
<div *ngIf="isVisible">Content</div>

// React JSX
<div>{isVisible && 'Content'}</div>
```

### 2. Props are Immutable

Props cannot be modified within components. They flow one way: parent → child.

```tsx
// ❌ Wrong
const Component = ({ value }) => {
  value = value + 1; // Don't mutate props!
  return <div>{value}</div>;
};

// ✅ Correct
const Component = ({ value }) => {
  const newValue = value + 1;
  return <div>{newValue}</div>;
};
```

### 3. Keys for Lists

React uses keys to track list items efficiently:

```tsx
// Angular
<div *ngFor="let item of items; trackBy: trackById">

// React
{items.map(item => (
  <div key={item.id}>
))}
```

### 4. State with useState

State replaces Angular's class properties:

```tsx
// Angular
export class Counter {
  count = 0;
  increment() { this.count++; }
}

// React
const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);
};
```

## ✅ Exercises

1. **Greeting** - Basic component with optional prop
2. **UserCard** - Multiple props with TypeScript
3. **TodoList** - Rendering arrays with keys
4. **Counter** - useState for state management
5. **StatusMessage** - Conditional rendering logic

## 🎓 Success Criteria

All tests passing = Module mastered ✓

Each test failure provides hints about what needs to be implemented.
```

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Test module 1 only
npm test 1

# Test modules 1-3
npm test 3

# Watch mode for module 1
npm test 1 -- --watch

# Check overall progress
npm run progress

# Type checking
npm run type-check
```

---

## 📈 Learning Workflow

1. **Read Module README** - Understand concepts and Angular mappings
2. **Open `index.tsx`** - Review exercise descriptions
3. **Run Tests** - See what needs to be implemented
4. **Implement Solutions** - Write code to pass tests
5. **Verify** - All tests pass = move to next module
6. **Track Progress** - Use `npm run progress`

---

## 🎯 Philosophy

This repository implements **test-driven learning**: pre-written tests define success criteria, students implement functionality to satisfy specifications. This ensures:

- **Objective assessment** of understanding
- **Immediate feedback** on implementation correctness
- **Progressive complexity** through structured modules
- **Angular-React bridging** through explicit concept mappings