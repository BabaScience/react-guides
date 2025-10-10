# React Mastery Exercises

> Test-driven React learning repository designed specifically for Angular developers

## 🎯 Overview

This repository provides a structured, progressive approach to learning React through hands-on exercises. Each module builds upon previous concepts, ensuring systematic knowledge acquisition without overwhelming cognitive load.

**Pedagogical Paradigm:** Students implement functionality to satisfy pre-written test specifications, ensuring objective assessment and immediate feedback.

## 🏗️ Repository Structure

```
react-mastery-exercises/
├── src/
│   ├── 01-fundamentals/          ← Start here!
│   │   ├── index.tsx            ← Student implements here
│   │   ├── index.test.tsx       ← Pre-written tests
│   │   └── README.md            ← Instructions & concepts
│   ├── 02-hooks/                ← Coming soon
│   ├── 03-component-patterns/   ← Coming soon
│   └── ... (12 modules total)
├── scripts/
│   ├── test-runner.js           ← Handles module flag logic
│   └── check-progress.js        ← Shows completion status
├── package.json
├── jest.config.js
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

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

## 📚 Module Progression

| Module | Topic | Exercises | Status |
|--------|-------|-----------|--------|
| 01 | Fundamentals | 8 | ✅ Available |
| 02 | Hooks Deep Dive | 7 | 🚧 Coming Soon |
| 03 | Component Patterns | 6 | 🚧 Coming Soon |
| 04 | Styling | 5 | 🚧 Coming Soon |
| 05 | Routing | 6 | 🚧 Coming Soon |
| 06 | State Management | 7 | 🚧 Coming Soon |
| 07 | Data Fetching | 6 | 🚧 Coming Soon |
| 08 | Forms & Validation | 5 | 🚧 Coming Soon |
| 09 | Performance | 6 | 🚧 Coming Soon |
| 10 | Testing | 7 | 🚧 Coming Soon |
| 11 | TypeScript | 6 | 🚧 Coming Soon |
| 12 | Advanced Patterns | 5 | 🚧 Coming Soon |

## 🎓 Learning Workflow

1. **Read Module README** - Understand concepts and Angular mappings
2. **Open `index.tsx`** - Review exercise descriptions
3. **Run Tests** - See what needs to be implemented
4. **Implement Solutions** - Write code to pass tests
5. **Verify** - All tests pass = move to next module
6. **Track Progress** - Use `npm run progress`

## 🔗 Angular to React Mapping

This repository is specifically designed for Angular developers. Each exercise includes:

- **Side-by-side comparisons** of Angular vs React approaches
- **Conceptual mappings** from Angular patterns to React equivalents
- **TypeScript integration** (you'll feel at home!)
- **Progressive complexity** building on familiar concepts

### Key Differences Highlighted

| Concept | Angular | React |
|---------|---------|-------|
| Component | `@Component` class | Function returning JSX |
| Props | `@Input()` decorator | Function parameters |
| State | Class properties | `useState` hook |
| Templates | String templates | JSX expressions |
| Directives | `*ngIf`, `*ngFor` | JavaScript conditionals |
| Events | `(click)="handler()"` | `onClick={handler}` |

## 🧪 Test-Driven Learning

### How It Works

1. **Pre-written Tests** - Define success criteria
2. **Stub Implementations** - Students fill in the code
3. **Immediate Feedback** - Tests show what's missing
4. **Progressive Unlocking** - Next module unlocks after current completion

### Example Test Command

```bash
# Test only module 1
npm test 1

# Test modules 1, 2, and 3
npm test 3

# Watch mode for continuous feedback
npm test 1 -- --watch
```

## 📊 Progress Tracking

```bash
npm run progress
```

Shows visual progress bars for all modules with completion percentages:

```
📊 React Mastery Progress Report
============================================================
✅ Module 01: Fundamentals
   ████████████████████████████████ 8/8 (100.0%)

⏳ Module 02: Hooks Deep Dive
   ████████████████████████████████ 5/7 (71.4%)

❌ Module 03: Component Patterns
   Error running tests

============================================================
Overall Progress: 13/15 tests (86.7%)
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Basic TypeScript knowledge
- Angular development experience

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd react-mastery-exercises

# Install dependencies
npm install

# Verify setup
npm run type-check
```

### Project Configuration

- **TypeScript**: Strict mode enabled
- **Jest**: React Testing Library integration
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting

## 🎯 Module 01: React Fundamentals

**Start here!** This module covers essential React concepts:

1. **Basic Greeting Component** - Props and default values
2. **User Card** - Multiple props with TypeScript
3. **Todo List** - Rendering arrays with keys
4. **Counter** - useState for state management
5. **Status Message** - Conditional rendering
6. **Action Button** - Event handling
7. **Contact Form** - Controlled form components
8. **Filtered List** - Array methods with state

### Getting Started with Module 01

```bash
# Navigate to module 01
cd src/01-fundamentals

# Read the instructions
cat README.md

# Open the exercises
code index.tsx

# Run tests to see what needs implementation
npm test 1
```

## 🤝 Contributing

This repository is designed for learning. If you find issues or have suggestions:

1. **Report Issues** - Help improve the exercises
2. **Suggest Improvements** - Better Angular mappings
3. **Add Examples** - Additional use cases
4. **Fix Typos** - Improve documentation

## 📚 Additional Resources

- [React Official Documentation](https://react.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Angular to React Migration Guide](https://react.dev/learn/thinking-in-react)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🎉 Success Criteria

**Module Complete** = All tests passing ✓

**Repository Complete** = All 12 modules mastered ✓

---

**Happy Learning! 🚀**

*Built with ❤️ for Angular developers transitioning to React*
