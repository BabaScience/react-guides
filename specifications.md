import React, { useState } from 'react';
import { CheckCircle, Circle, Code, Terminal, Book } from 'lucide-react';

const SimplifiedRepoSpec = () => {
  const [activeTab, setActiveTab] = useState('structure');

  const modules = [
    { num: '01', name: 'fundamentals', exercises: 8 },
    { num: '02', name: 'hooks', exercises: 7 },
    { num: '03', name: 'component-patterns', exercises: 6 },
    { num: '04', name: 'styling', exercises: 5 },
    { num: '05', name: 'routing', exercises: 6 },
    { num: '06', name: 'state-management', exercises: 7 },
    { num: '07', name: 'data-fetching', exercises: 6 },
    { num: '08', name: 'forms', exercises: 5 },
    { num: '09', name: 'performance', exercises: 6 },
    { num: '10', name: 'testing', exercises: 7 },
    { num: '11', name: 'typescript', exercises: 6 },
    { num: '12', name: 'advanced-patterns', exercises: 5 }
  ];

  const structure = `react-mastery-exercises/
├── src/
│   ├── 01-fundamentals/
│   │   ├── index.tsx          ← Student implements here
│   │   ├── index.test.tsx     ← Pre-written tests
│   │   └── README.md          ← Instructions & concepts
│   ├── 02-hooks/
│   │   ├── index.tsx
│   │   ├── index.test.tsx
│   │   └── README.md
│   └── ... (12 modules total)
├── scripts/
│   └── test-runner.js         ← Handles module flag logic
├── docs/
│   ├── getting-started.md
│   └── angular-to-react.md
├── package.json
├── jest.config.js
├── tsconfig.json
└── README.md`;

  const packageJson = '{' + '\n' +
  '  "name": "react-mastery-exercises",\n' +
  '  "scripts": {\n' +
  '    "test": "node scripts/test-runner.js",\n' +
  '    "test:watch": "node scripts/test-runner.js --watch",\n' +
  '    "progress": "node scripts/check-progress.js"\n' +
  '  },\n' +
  '  "dependencies": {\n' +
  '    "react": "^18.3.1",\n' +
  '    "react-dom": "^18.3.1"\n' +
  '  },\n' +
  '  "devDependencies": {\n' +
  '    "@testing-library' + '/react": "^14.0.0",\n' +
  '    "@testing-library' + '/jest-dom": "^6.1.5",\n' +
  '    "@types' + '/react": "^18.3.1",\n' +
  '    "jest": "^29.7.0",\n' +
  '    "jest-environment-jsdom": "^29.7.0",\n' +
  '    "ts-jest": "^29.1.1",\n' +
  '    "typescript": "^5.3.3"\n' +
  '  }\n' +
  '}';

  const testRunner = '// scripts/test-runner.js\n' +
  'const { execSync } = require' + '(\'child_process\');\n\n' +
  '// Get module number from command line argument\n' +
  'const moduleArg = process.argv[2];\n' +
  'const isWatch = process.argv.includes(\'--watch\');\n\n' +
  'if (!moduleArg || isNaN(moduleArg)) {\n' +
  '  console.log(\'Usage: npm test [module_number]\');\n' +
  '  console.log(\'Example: npm test 3  (runs tests for modules 1, 2, and 3)\');\n' +
  '  process.exit(1);\n' +
  '}\n\n' +
  'const maxModule = parseInt(moduleArg);\n\n' +
  '// Generate test pattern for modules 01 through maxModule\n' +
  'const modules = Array.from(\n' +
  '  { length: maxModule }, \n' +
  '  (_, i) => String(i + 1).padStart(2, \'0\')\n' +
  ');\n\n' +
  'const testPattern = modules\n' +
  '  .map(num => `src/${num}-*/index.test.tsx`)\n' +
  '  .join(\'|\');\n\n' +
  'console.log(`🧪 Running tests for modules 1-${maxModule}\\n`);\n\n' +
  'const watchFlag = isWatch ? \'--watch\' : \'\';\n\n' +
  'try {\n' +
  '  execSync(\n' +
  '    `jest --testPathPattern="${testPattern}" ${watchFlag}`,\n' +
  '    { stdio: \'inherit\' }\n' +
  '  );\n' +
  '} catch (error) {\n' +
  '  process.exit(1);\n' +
  '}';

  const exampleTest = '// src/01-fundamentals/index.test.tsx\n' +
  'import { render, screen } from ' + '\'@testing-library' + '/react\';\n' +
  'import { \n' +
  '  Greeting, \n' +
  '  UserCard, \n' +
  '  TodoList \n' +
  '} from ' + '\'./index\';\n\n' +
  'describe(\'Module 01: React Fundamentals\', () => {\n' +
  '  \n' +
  '  describe(\'Exercise 1: Basic Component\', () => {\n' +
  '    it(\'should render a greeting with the provided name\', () => {\n' +
  '      render(<Greeting name="Alice" />);\n' +
  '      expect(screen.getByText(\'Hello, Alice!\')).toBeInTheDocument();\n' +
  '    });\n\n' +
  '    it(\'should render default greeting when no name provided\', () => {\n' +
  '      render(<Greeting />);\n' +
  '      expect(screen.getByText(\'Hello, Guest!\')).toBeInTheDocument();\n' +
  '    });\n' +
  '  });\n\n' +
  '  describe(\'Exercise 2: Props and Types\', () => {\n' +
  '    it(\'should render user information with TypeScript types\', () => {\n' +
  '      const user = {\n' +
  '        name: \'John Doe\',\n' +
  '        email: \'john@example.com\',\n' +
  '        age: 30\n' +
  '      };\n' +
  '      \n' +
  '      render(<UserCard {...user} />);\n' +
  '      \n' +
  '      expect(screen.getByText(\'John Doe\')).toBeInTheDocument();\n' +
  '      expect(screen.getByText(\'john@example.com\')).toBeInTheDocument();\n' +
  '      expect(screen.getByText(\'Age: 30\')).toBeInTheDocument();\n' +
  '    });\n' +
  '  });\n\n' +
  '  describe(\'Exercise 3: Lists and Keys\', () => {\n' +
  '    it(\'should render list of todos with proper keys\', () => {\n' +
  '      const todos = [\n' +
  '        { id: 1, text: \'Learn React\', completed: false },\n' +
  '        { id: 2, text: \'Build project\', completed: false }\n' +
  '      ];\n' +
  '      \n' +
  '      render(<TodoList todos={todos} />);\n' +
  '      \n' +
  '      expect(screen.getByText(\'Learn React\')).toBeInTheDocument();\n' +
  '      expect(screen.getByText(\'Build project\')).toBeInTheDocument();\n' +
  '    });\n' +
  '  });\n' +
  '});';

  const exampleImplementation = '// src/01-fundamentals/index.tsx\n' +
  'import React from \'react\';\n\n' +
  '/**\n' +
  ' * EXERCISE 1: Basic Component\n' +
  ' * \n' +
  ' * OBJECTIVE: Create a Greeting component that displays a personalized message\n' +
  ' * \n' +
  ' * ANGULAR EQUIVALENT:\n' +
  ' * @Component({\n' +
  ' *   selector: \'app-greeting\',\n' +
  ' *   template: \'<h1>Hello, {{name}}!</h1>\'\n' +
  ' * })\n' +
  ' * export class GreetingComponent {\n' +
  ' *   @Input() name: string = \'Guest\';\n' +
  ' * }\n' +
  ' * \n' +
  ' * INSTRUCTIONS:\n' +
  ' * - Accept a \'name\' prop (optional, defaults to \'Guest\')\n' +
  ' * - Render: "Hello, [name]!"\n' +
  ' * - Use TypeScript for type safety\n' +
  ' */\n\n' +
  'interface GreetingProps {\n' +
  '  name?: string;\n' +
  '}\n\n' +
  'export const Greeting: React.FC<GreetingProps> = ({ name = \'Guest\' }) => {\n' +
  '  return <h1>Hello, {name}!</h1>;\n' +
  '};\n\n' +
  '/**\n' +
  ' * EXERCISE 2: Props and Types\n' +
  ' * \n' +
  ' * OBJECTIVE: Create a UserCard component with multiple typed props\n' +
  ' * \n' +
  ' * ANGULAR EQUIVALENT: Multiple @Input() decorators with types\n' +
  ' */\n\n' +
  'interface UserCardProps {\n' +
  '  name: string;\n' +
  '  email: string;\n' +
  '  age: number;\n' +
  '}\n\n' +
  'export const UserCard: React.FC<UserCardProps> = ({ name, email, age }) => {\n' +
  '  return (\n' +
  '    <div className="user-card">\n' +
  '      <h2>{name}</h2>\n' +
  '      <p>{email}</p>\n' +
  '      <p>Age: {age}</p>\n' +
  '    </div>\n' +
  '  );\n' +
  '};\n\n' +
  '/**\n' +
  ' * EXERCISE 3: Lists and Keys\n' +
  ' * \n' +
  ' * OBJECTIVE: Render a list of items with proper key management\n' +
  ' * \n' +
  ' * ANGULAR EQUIVALENT: *ngFor with trackBy\n' +
  ' */\n\n' +
  'interface Todo {\n' +
  '  id: number;\n' +
  '  text: string;\n' +
  '  completed: boolean;\n' +
  '}\n\n' +
  'interface TodoListProps {\n' +
  '  todos: Todo[];\n' +
  '}\n\n' +
  'export const TodoList: React.FC<TodoListProps> = ({ todos }) => {\n' +
  '  return (\n' +
  '    <ul>\n' +
  '      {todos.map(todo => (\n' +
  '        <li key={todo.id}>{todo.text}</li>\n' +
  '      ))}\n' +
  '    </ul>\n' +
  '  );\n' +
  '};';

  const moduleReadme = '# Module 01: React Fundamentals\n\n' +
  '## 🎯 Learning Objectives\n\n' +
  'Master foundational React concepts essential for Angular developers transitioning to React\'s declarative paradigm.\n\n' +
  '## 📚 Exercises Overview\n\n' +
  '1. **Basic Component** - Understanding functional components and JSX\n' +
  '2. **Props and Types** - Unidirectional data flow with TypeScript\n' +
  '3. **Lists and Keys** - Rendering collections efficiently\n' +
  '4. **State Management** - Using useState hook\n' +
  '5. **Event Handling** - Responding to user interactions\n' +
  '6. **Conditional Rendering** - Dynamic UI based on state\n' +
  '7. **Forms** - Controlled components pattern\n' +
  '8. **Component Composition** - Building complex UIs from simple parts\n\n' +
  '## 🔗 Angular to React Mapping\n\n' +
  '| Angular | React | Notes |\n' +
  '|---------|-------|-------|\n' +
  '| @Component | React.FC | Function instead of class decorator |\n' +
  '| @Input() | props | Immutable, passed as function arguments |\n' +
  '| *ngIf | {condition && <Component />} | JavaScript conditional expressions |\n' +
  '| *ngFor | {array.map(item => ...)} | JavaScript array methods |\n' +
  '| [(ngModel)] | useState + onChange | Explicit state management |\n\n' +
  '## 🚀 Getting Started\n\n' +
  '```bash\n' +
  '# Test only this module\n' +
  'npm test 1\n\n' +
  '# Watch mode for this module\n' +
  'npm test 1 -- --watch\n\n' +
  '# Check your progress\n' +
  'npm run progress\n' +
  '```\n\n' +
  '## 💡 Key Concepts\n\n' +
  '### Declarative vs Imperative\n' +
  '- **Angular**: Mix of declarative (templates) and imperative (TypeScript)\n' +
  '- **React**: Fully declarative - describe what UI should look like\n\n' +
  '### Component Philosophy\n' +
  '- No decorators or metadata\n' +
  '- Pure functions that return UI descriptions\n' +
  '- Props are immutable within components\n\n' +
  '### Data Flow\n' +
  '- Strictly unidirectional (parent → child)\n' +
  '- No two-way binding by default\n' +
  '- State changes trigger re-renders automatically\n\n' +
  '## ✅ Completion Criteria\n\n' +
  'All tests passing = Module mastered ✓';

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            React Mastery Exercises
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Simplified Test-Driven Learning Repository for Angular Developers
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <p className="text-gray-800">
              <strong>Pedagogical Paradigm:</strong> Students implement functionality to satisfy 
              pre-written test specifications. Progressive module activation ensures systematic 
              knowledge acquisition without overwhelming cognitive load.
            </p>
          </div>

          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Terminal size={20} />
              Command Interface
            </h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-white p-2 rounded border border-green-200">
                <code className="text-green-700">npm test 1</code>
                <span className="text-gray-600 ml-3">→ Tests module 1 only</span>
              </div>
              <div className="bg-white p-2 rounded border border-green-200">
                <code className="text-green-700">npm test 3</code>
                <span className="text-gray-600 ml-3">→ Tests modules 1, 2, and 3</span>
              </div>
              <div className="bg-white p-2 rounded border border-green-200">
                <code className="text-green-700">npm test 5 -- --watch</code>
                <span className="text-gray-600 ml-3">→ Watch mode for modules 1-5</span>
              </div>
              <div className="bg-white p-2 rounded border border-green-200">
                <code className="text-green-700">npm run progress</code>
                <span className="text-gray-600 ml-3">→ Display completion statistics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'structure', label: 'Structure', icon: Code },
              { id: 'runner', label: 'Test Runner', icon: Terminal },
              { id: 'example', label: 'Example Exercise', icon: Book }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'structure' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Repository Structure</h2>
              <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                {structure}
              </pre>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Module Progression</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.map(module => (
                  <div key={module.num} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {module.num}
                      </div>
                      <h3 className="font-bold text-gray-900 capitalize">{module.name.replace('-', ' ')}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{module.exercises} exercises</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Package Configuration</h2>
              <pre className="bg-gray-900 text-blue-300 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                {packageJson}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'runner' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Runner Implementation</h2>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                <p className="text-amber-900">
                  <strong>Mechanism:</strong> Dynamically generates test patterns based on module argument, 
                  enabling incremental curriculum progression without manual test configuration.
                </p>
              </div>
              <pre className="bg-gray-900 text-yellow-300 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                {testRunner}
              </pre>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Workflow Diagram</h2>
              <div className="bg-slate-50 p-6 rounded-lg border-2 border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded font-mono text-sm">
                      npm test 3
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="bg-green-50 border-2 border-green-500 px-4 py-2 rounded text-sm">
                      test-runner.js receives argument "3"
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-12">
                    <div className="text-gray-600">↓</div>
                  </div>
                  <div className="flex items-center gap-4 ml-12">
                    <div className="bg-purple-50 border-2 border-purple-500 px-4 py-2 rounded text-sm">
                      Generate pattern: "01-*|02-*|03-*"
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-12">
                    <div className="text-gray-600">↓</div>
                  </div>
                  <div className="flex items-center gap-4 ml-12">
                    <div className="bg-orange-50 border-2 border-orange-500 px-4 py-2 rounded text-sm">
                      Execute Jest with pattern filter
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-12">
                    <div className="text-gray-600">↓</div>
                  </div>
                  <div className="flex items-center gap-4 ml-12">
                    <div className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">
                      ✓ Tests for modules 1, 2, 3 executed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'example' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Module README Example</h2>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 prose prose-sm max-w-none">
                <pre className="bg-white p-4 rounded border border-gray-300 overflow-x-auto text-xs">
                  {moduleReadme}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Specification</h2>
              <pre className="bg-gray-900 text-pink-300 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                {exampleTest}
              </pre>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Implementation Template</h2>
              <pre className="bg-gray-900 text-cyan-300 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                {exampleImplementation}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-900 mb-3">Implementation Specifications</h3>
          <ul className="space-y-2 text-purple-900">
            <li className="flex items-start gap-2">
              <CheckCircle className="text-purple-600 mt-1 flex-shrink-0" size={18} />
              <span><strong>Incremental Activation:</strong> Module N unlocks only after modules 1 through N-1 achieve complete test passage</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-purple-600 mt-1 flex-shrink-0" size={18} />
              <span><strong>Atomicity:</strong> Each module encapsulates discrete conceptual domain with zero inter-module dependencies</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-purple-600 mt-1 flex-shrink-0" size={18} />
              <span><strong>TypeScript Strictness:</strong> All implementations must satisfy TypeScript strict mode compilation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-purple-600 mt-1 flex-shrink-0" size={18} />
              <span><strong>Documentation Synchronicity:</strong> Every exercise includes Angular-equivalent annotations for cognitive bridging</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedRepoSpec;