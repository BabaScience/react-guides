# Module 02: React Hooks Deep Dive

## 🎯 Learning Objectives

Master React Hooks for state management, side effects, and performance optimization:

1. **useState** - State management with functional updates
2. **useEffect** - Side effects and lifecycle management
3. **useContext** - Global state consumption and dependency injection
4. **useRef** - DOM manipulation and value persistence
5. **useMemo** - Computational memoization for performance
6. **useCallback** - Function memoization for stable references
7. **useReducer** - Complex state logic with reducer pattern

## 🔗 Angular to React Mapping

### State Management

**Angular:**
```typescript
export class CounterComponent {
  count = 0;
  
  increment() {
    this.count++;
  }
}
```

**React:**
```typescript
const Counter = () => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(prev => prev + 1);
};
```

### Lifecycle Methods

**Angular:**
```typescript
export class DataComponent implements OnInit, OnDestroy {
  ngOnInit() {
    this.fetchData();
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

**React:**
```typescript
const DataComponent = () => {
  useEffect(() => {
    fetchData();
    return () => {
      // cleanup
    };
  }, []);
};
```

### Dependency Injection

**Angular:**
```typescript
@Injectable()
export class ThemeService {
  theme = 'light';
}

@Component({...})
export class MyComponent {
  constructor(private themeService: ThemeService) {}
}
```

**React:**
```typescript
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const MyComponent = () => {
  const { theme } = useContext(ThemeContext);
};
```

### DOM Access

**Angular:**
```typescript
@ViewChild('myInput') input: ElementRef;

ngAfterViewInit() {
  this.input.nativeElement.focus();
}
```

**React:**
```typescript
const MyComponent = () => {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return <input ref={inputRef} />;
};
```

### Performance Optimization

**Angular:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedComponent {
  @Input() data: any[];
  
  filteredData = this.data.filter(item => item.active);
}
```

**React:**
```typescript
const OptimizedComponent = ({ data }) => {
  const filteredData = useMemo(() => 
    data.filter(item => item.active), 
    [data]
  );
};
```

## 🚀 Getting Started

```bash
# Test this module only
npm test 2

# Watch mode
npm test 2 -- --watch

# Check progress
npm run progress
```

## 💡 Key Concepts

### 1. Rules of Hooks

- Only call hooks at the top level
- Only call hooks from React functions
- Preserve call order across renders

### 2. useState Functional Updates

```tsx
// ❌ May use stale state
setCount(count + 1);

// ✅ Always uses fresh state
setCount(prev => prev + 1);
```

### 3. useEffect Cleanup

```tsx
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);
```

### 4. Context Performance

```tsx
// ❌ New object on every render
const value = { user, setUser };

// ✅ Memoized value
const value = useMemo(() => ({ user, setUser }), [user]);
```

### 5. useMemo vs useCallback

```tsx
// useMemo memoizes the result
const expensiveValue = useMemo(() => compute(a, b), [a, b]);

// useCallback memoizes the function
const stableCallback = useCallback(() => doSomething(), []);
```

### 6. useReducer Pattern

```tsx
const [state, dispatch] = useReducer(reducer, initialState);

// Dispatch actions
dispatch({ type: 'ADD_TODO', payload: 'Learn React' });
```

## ✅ Exercises

1. **Counter with Functional Updates** - useState with functional updates
2. **Data Fetching** - useEffect with cleanup and error handling
3. **Theme Context** - useContext for global state management
4. **Focus Management** - useRef for DOM manipulation
5. **Derived Data** - useMemo for expensive calculations
6. **Stable References** - useCallback for performance optimization
7. **Todo Reducer** - useReducer for complex state logic

## 🎓 Success Criteria

All tests passing = Module mastered ✓

Each test failure provides hints about what needs to be implemented.

## 📚 Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [useHooks.com](https://usehooks.com/) - Custom hook recipes
- [React DevTools](https://react.dev/learn/react-developer-tools)
