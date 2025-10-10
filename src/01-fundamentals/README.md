# Module 01: React Fundamentals

## 🎯 Learning Objectives

Master foundational React concepts essential for Angular developers transitioning to React's declarative paradigm:

1. **Functional Components** - Understanding React's component model
2. **Props & Types** - Unidirectional data flow with TypeScript
3. **Lists & Keys** - Efficient rendering of collections
4. **State Management** - Using the useState hook
5. **Conditional Rendering** - Dynamic UI based on conditions
6. **Event Handling** - Responding to user interactions
7. **Controlled Components** - Form handling patterns
8. **Array Methods** - Filtering and mapping data

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
| Events | `(click)="handler()"` | `onClick={handler}` |
| Forms | `[(ngModel)]` | `value` + `onChange` |

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

### 5. Event Handling

Events use camelCase and pass functions directly:

```tsx
// Angular
<button (click)="onClick()">Click</button>

// React
<button onClick={onClick}>Click</button>
```

### 6. Controlled Components

Forms use explicit state management:

```tsx
// Angular
<input [(ngModel)]="value">

// React
<input 
  value={value} 
  onChange={(e) => setValue(e.target.value)} 
/>
```

## ✅ Exercises

1. **Greeting** - Basic component with optional prop
2. **UserCard** - Multiple props with TypeScript
3. **TodoList** - Rendering arrays with keys
4. **Counter** - useState for state management
5. **StatusMessage** - Conditional rendering logic
6. **ActionButton** - Event handling patterns
7. **ContactForm** - Controlled form components
8. **FilteredList** - Array methods with state

## 🎓 Success Criteria

All tests passing = Module mastered ✓

Each test failure provides hints about what needs to be implemented.

## 📚 Additional Resources

- [React Official Docs](https://react.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Angular to React Migration Guide](https://react.dev/learn/thinking-in-react)
