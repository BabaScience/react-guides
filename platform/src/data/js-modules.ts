import type { Module, Step } from '@/types/exercise';

const prerequisitesSteps: Step[] = [
  { type: 'lesson', id: 'before-you-start', title: 'Before You Start', sectionHeading: '1. Before You Start' },
];

const languageBasicsSteps: Step[] = [
  { type: 'lesson', id: 'what-javascript-is', title: 'What JavaScript Is', sectionHeading: '1. What JavaScript Is' },
  { type: 'lesson', id: 'variables-and-declarations', title: 'Variables and Declarations', sectionHeading: '2. Variables and Declarations' },
  { type: 'lesson', id: 'primitive-types', title: 'Primitive Types', sectionHeading: '3. Primitive Types' },
  { type: 'lesson', id: 'reference-types', title: 'Reference Types', sectionHeading: '4. Reference Types' },
  { type: 'lesson', id: 'type-coercion', title: 'Type Coercion', sectionHeading: '5. Type Coercion' },
  { type: 'lesson', id: 'typeof-and-type-checking', title: 'typeof and Type Checking', sectionHeading: '6. typeof and Type Checking' },
];

const operatorsSteps: Step[] = [
  { type: 'lesson', id: 'arithmetic', title: 'Arithmetic', sectionHeading: '1. Arithmetic' },
  { type: 'lesson', id: 'assignment', title: 'Assignment', sectionHeading: '2. Assignment' },
  { type: 'lesson', id: 'comparison', title: 'Comparison', sectionHeading: '3. Comparison' },
  { type: 'lesson', id: 'logical-operators', title: 'Logical Operators', sectionHeading: '4. Logical Operators' },
  { type: 'lesson', id: 'spread-rest-destructuring', title: 'Spread, Rest, Destructuring', sectionHeading: '5. Spread, Rest, Destructuring' },
  { type: 'lesson', id: 'optional-chaining-and-nullish-access', title: 'Optional Chaining and Nullish Access', sectionHeading: '6. Optional Chaining and Nullish Access' },
];

const controlFlowSteps: Step[] = [
  { type: 'lesson', id: 'conditionals', title: 'Conditionals', sectionHeading: '1. Conditionals' },
  { type: 'lesson', id: 'loops', title: 'Loops', sectionHeading: '2. Loops' },
  { type: 'lesson', id: 'loop-control', title: 'Loop Control', sectionHeading: '3. Loop Control' },
  { type: 'lesson', id: 'when-to-use-which', title: 'When to Use Which', sectionHeading: '4. When to Use Which' },
];

const functionsSteps: Step[] = [
  { type: 'lesson', id: 'function-forms', title: 'Function Forms', sectionHeading: '1. Function Forms' },
  { type: 'lesson', id: 'parameters', title: 'Parameters', sectionHeading: '2. Parameters' },
  { type: 'lesson', id: 'returns', title: 'Returns', sectionHeading: '3. Returns' },
  { type: 'lesson', id: 'higher-order-functions', title: 'Higher-Order Functions', sectionHeading: '4. Higher-Order Functions' },
  { type: 'lesson', id: 'pure-functions', title: 'Pure Functions', sectionHeading: '5. Pure Functions' },
  { type: 'lesson', id: 'currying-and-partial-application', title: 'Currying and Partial Application', sectionHeading: '6. Currying and Partial Application' },
];

const objectsPrototypesSteps: Step[] = [
  { type: 'lesson', id: 'object-creation', title: 'Object Creation', sectionHeading: '1. Object Creation' },
  { type: 'lesson', id: 'property-access-and-descriptors', title: 'Property Access and Descriptors', sectionHeading: '2. Property Access and Descriptors' },
  { type: 'lesson', id: 'object-methods', title: 'Object Methods', sectionHeading: '3. Object Methods' },
  { type: 'lesson', id: 'prototypes', title: 'Prototypes', sectionHeading: '4. Prototypes' },
  { type: 'lesson', id: 'cloning', title: 'Cloning', sectionHeading: '5. Cloning' },
  { type: 'lesson', id: 'maps-and-sets', title: 'Maps and Sets', sectionHeading: '6. Maps and Sets' },
];

const arraysSteps: Step[] = [
  { type: 'lesson', id: 'creation', title: 'Creation', sectionHeading: '1. Creation' },
  { type: 'lesson', id: 'mutation-methods', title: 'Mutation Methods', sectionHeading: '2. Mutation Methods' },
  { type: 'lesson', id: 'non-mutating-methods', title: 'Non-Mutating Methods', sectionHeading: '3. Non-Mutating Methods' },
  { type: 'lesson', id: 'reduction-and-search', title: 'Reduction and Search', sectionHeading: '4. Reduction and Search' },
  { type: 'lesson', id: 'iteration-patterns', title: 'Iteration Patterns', sectionHeading: '5. Iteration Patterns' },
];

const stringsNumbersDatesSteps: Step[] = [
  { type: 'lesson', id: 'strings', title: 'Strings', sectionHeading: '1. Strings' },
  { type: 'lesson', id: 'numbers', title: 'Numbers', sectionHeading: '2. Numbers' },
  { type: 'lesson', id: 'math-and-bigint', title: 'Math and BigInt', sectionHeading: '3. Math and BigInt' },
  { type: 'lesson', id: 'dates', title: 'Dates', sectionHeading: '4. Dates' },
];

const scopeClosuresSteps: Step[] = [
  { type: 'lesson', id: 'scope', title: 'Scope', sectionHeading: '1. Scope' },
  { type: 'lesson', id: 'lexical-scoping', title: 'Lexical Scoping', sectionHeading: '2. Lexical Scoping' },
  { type: 'lesson', id: 'hoisting', title: 'Hoisting', sectionHeading: '3. Hoisting' },
  { type: 'lesson', id: 'closures', title: 'Closures', sectionHeading: '4. Closures' },
];

const thisKeywordSteps: Step[] = [
  { type: 'lesson', id: 'default-binding', title: 'Default Binding', sectionHeading: '1. Default Binding' },
  { type: 'lesson', id: 'implicit-binding', title: 'Implicit Binding', sectionHeading: '2. Implicit Binding' },
  { type: 'lesson', id: 'explicit-binding', title: 'Explicit Binding', sectionHeading: '3. Explicit Binding' },
  { type: 'lesson', id: 'new-binding', title: 'new Binding', sectionHeading: '4. new Binding' },
  { type: 'lesson', id: 'arrow-functions-and-this', title: 'Arrow Functions and this', sectionHeading: '5. Arrow Functions and this' },
];

const classesSteps: Step[] = [
  { type: 'lesson', id: 'class-syntax', title: 'Class Syntax', sectionHeading: '1. Class Syntax' },
  { type: 'lesson', id: 'private-fields-and-static', title: 'Private Fields and Static', sectionHeading: '2. Private Fields and Static' },
  { type: 'lesson', id: 'inheritance', title: 'Inheritance', sectionHeading: '3. Inheritance' },
  { type: 'lesson', id: 'when-to-use-classes-vs-functions', title: 'When to Use Classes vs Functions', sectionHeading: '4. When to Use Classes vs Functions' },
];

const modulesSteps: Step[] = [
  { type: 'lesson', id: 'es-modules', title: 'ES Modules', sectionHeading: '1. ES Modules' },
  { type: 'lesson', id: 'commonjs', title: 'CommonJS', sectionHeading: '2. CommonJS' },
  { type: 'lesson', id: 'dynamic-imports', title: 'Dynamic Imports', sectionHeading: '3. Dynamic Imports' },
  { type: 'lesson', id: 'module-patterns', title: 'Module Patterns', sectionHeading: '4. Module Patterns' },
];

const asyncSteps: Step[] = [
  { type: 'lesson', id: 'callbacks', title: 'Callbacks', sectionHeading: '1. Callbacks' },
  { type: 'lesson', id: 'promises', title: 'Promises', sectionHeading: '2. Promises' },
  { type: 'lesson', id: 'promise-combinators', title: 'Promise Combinators', sectionHeading: '3. Promise Combinators' },
  { type: 'lesson', id: 'async-await', title: 'Async Await', sectionHeading: '4. Async Await' },
  { type: 'lesson', id: 'parallel-vs-serial', title: 'Parallel vs Serial', sectionHeading: '5. Parallel vs Serial' },
  { type: 'lesson', id: 'cancellation', title: 'Cancellation', sectionHeading: '6. Cancellation' },
];

const errorHandlingSteps: Step[] = [
  { type: 'lesson', id: 'throwing-and-catching', title: 'Throwing and Catching', sectionHeading: '1. Throwing and Catching' },
  { type: 'lesson', id: 'error-types', title: 'Error Types', sectionHeading: '2. Error Types' },
  { type: 'lesson', id: 'custom-errors', title: 'Custom Errors', sectionHeading: '3. Custom Errors' },
  { type: 'lesson', id: 'async-error-handling', title: 'Async Error Handling', sectionHeading: '4. Async Error Handling' },
  { type: 'lesson', id: 'error-semantics', title: 'Error Semantics', sectionHeading: '5. Error Semantics' },
];

const eventLoopSteps: Step[] = [
  { type: 'lesson', id: 'mental-model', title: 'Mental Model', sectionHeading: '1. Mental Model' },
  { type: 'lesson', id: 'the-loop', title: 'The Loop', sectionHeading: '2. The Loop' },
  { type: 'lesson', id: 'microtasks-vs-macrotasks', title: 'Microtasks vs Macrotasks', sectionHeading: '3. Microtasks vs Macrotasks' },
  { type: 'lesson', id: 'browser-specific', title: 'Browser-Specific', sectionHeading: '4. Browser-Specific' },
  { type: 'lesson', id: 'node-specific', title: 'Node-Specific', sectionHeading: '5. Node-Specific' },
];

const browserApisSteps: Step[] = [
  { type: 'lesson', id: 'the-dom', title: 'The DOM', sectionHeading: '1. The DOM' },
  { type: 'lesson', id: 'events', title: 'Events', sectionHeading: '2. Events' },
  { type: 'lesson', id: 'fetch-and-http', title: 'Fetch and HTTP', sectionHeading: '3. Fetch and HTTP' },
  { type: 'lesson', id: 'storage', title: 'Storage', sectionHeading: '4. Storage' },
  { type: 'lesson', id: 'other-essential-apis', title: 'Other Essential APIs', sectionHeading: '5. Other Essential APIs' },
];

const nodejsSteps: Step[] = [
  { type: 'lesson', id: 'what-node-is', title: 'What Node Is', sectionHeading: '1. What Node Is' },
  { type: 'lesson', id: 'core-modules', title: 'Core Modules', sectionHeading: '2. Core Modules' },
  { type: 'lesson', id: 'streams', title: 'Streams', sectionHeading: '3. Streams' },
  { type: 'lesson', id: 'npm-ecosystem', title: 'npm Ecosystem', sectionHeading: '4. npm Ecosystem' },
  { type: 'lesson', id: 'frameworks', title: 'Frameworks', sectionHeading: '5. Frameworks' },
];

const modernEsSteps: Step[] = [
  { type: 'lesson', id: 'es2020-and-es2021', title: 'ES2020 and ES2021', sectionHeading: '1. ES2020 and ES2021' },
  { type: 'lesson', id: 'es2022-and-es2023', title: 'ES2022 and ES2023', sectionHeading: '2. ES2022 and ES2023' },
  { type: 'lesson', id: 'es2024-and-beyond', title: 'ES2024 and Beyond', sectionHeading: '3. ES2024 and Beyond' },
];

const typescriptSteps: Step[] = [
  { type: 'lesson', id: 'what-typescript-adds', title: 'What TypeScript Adds', sectionHeading: '1. What TypeScript Adds' },
  { type: 'lesson', id: 'type-system-fundamentals', title: 'Type System Fundamentals', sectionHeading: '2. Type System Fundamentals' },
  { type: 'lesson', id: 'generics', title: 'Generics', sectionHeading: '3. Generics' },
  { type: 'lesson', id: 'utility-types', title: 'Utility Types', sectionHeading: '4. Utility Types' },
  { type: 'lesson', id: 'advanced-typescript', title: 'Advanced TypeScript', sectionHeading: '5. Advanced TypeScript' },
];

const toolingSteps: Step[] = [
  { type: 'lesson', id: 'package-managers', title: 'Package Managers', sectionHeading: '1. Package Managers' },
  { type: 'lesson', id: 'bundlers', title: 'Bundlers', sectionHeading: '2. Bundlers' },
  { type: 'lesson', id: 'linters-and-formatters', title: 'Linters and Formatters', sectionHeading: '3. Linters and Formatters' },
  { type: 'lesson', id: 'monorepo-tools', title: 'Monorepo Tools', sectionHeading: '4. Monorepo Tools' },
];

const testingSteps: Step[] = [
  { type: 'lesson', id: 'test-runners', title: 'Test Runners', sectionHeading: '1. Test Runners' },
  { type: 'lesson', id: 'test-types', title: 'Test Types', sectionHeading: '2. Test Types' },
  { type: 'lesson', id: 'end-to-end-testing', title: 'End-to-End Testing', sectionHeading: '3. End-to-End Testing' },
  { type: 'lesson', id: 'coverage-and-strategy', title: 'Coverage and Strategy', sectionHeading: '4. Coverage and Strategy' },
];

const performanceSteps: Step[] = [
  { type: 'lesson', id: 'measurement', title: 'Measurement', sectionHeading: '1. Measurement' },
  { type: 'lesson', id: 'javascript-specific', title: 'JavaScript-Specific', sectionHeading: '2. JavaScript-Specific' },
  { type: 'lesson', id: 'memory', title: 'Memory', sectionHeading: '3. Memory' },
  { type: 'lesson', id: 'bundle-size', title: 'Bundle Size', sectionHeading: '4. Bundle Size' },
  { type: 'lesson', id: 'rendering', title: 'Rendering', sectionHeading: '5. Rendering' },
];

const securitySteps: Step[] = [
  { type: 'lesson', id: 'xss', title: 'XSS', sectionHeading: '1. XSS' },
  { type: 'lesson', id: 'csrf-and-injection', title: 'CSRF and Injection', sectionHeading: '2. CSRF and Injection' },
  { type: 'lesson', id: 'authentication', title: 'Authentication', sectionHeading: '3. Authentication' },
  { type: 'lesson', id: 'dependencies-and-secrets', title: 'Dependencies and Secrets', sectionHeading: '4. Dependencies and Secrets' },
];

const patternsSteps: Step[] = [
  { type: 'lesson', id: 'programming-paradigms', title: 'Programming Paradigms', sectionHeading: '1. Programming Paradigms' },
  { type: 'lesson', id: 'design-patterns', title: 'Design Patterns', sectionHeading: '2. Design Patterns' },
  { type: 'lesson', id: 'functional-patterns', title: 'Functional Patterns', sectionHeading: '3. Functional Patterns' },
  { type: 'lesson', id: 'code-organization', title: 'Code Organization', sectionHeading: '4. Code Organization' },
  { type: 'lesson', id: 'concurrency-patterns', title: 'Concurrency Patterns', sectionHeading: '5. Concurrency Patterns' },
];

export const jsModules: Module[] = [
  {
    id: 'js-01-prerequisites',
    number: 1,
    name: 'Prerequisites',
    description: 'What you need before diving into JavaScript',
    guideFile: 'arguments/chapters/js-01-prerequisites.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: prerequisitesSteps,
    exercises: [],
  },
  {
    id: 'js-02-language-basics',
    number: 2,
    name: 'Language Basics',
    description: 'Variables, primitive and reference types, coercion, and type checking',
    guideFile: 'arguments/chapters/js-02-language-basics.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: languageBasicsSteps,
    exercises: [],
  },
  {
    id: 'js-03-operators',
    number: 3,
    name: 'Operators & Expressions',
    description: 'Arithmetic, assignment, comparison, logical, spread/rest, and optional chaining',
    guideFile: 'arguments/chapters/js-03-operators.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: operatorsSteps,
    exercises: [],
  },
  {
    id: 'js-04-control-flow',
    number: 4,
    name: 'Control Flow',
    description: 'Conditionals, loops, loop control, and choosing the right construct',
    guideFile: 'arguments/chapters/js-04-control-flow.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: controlFlowSteps,
    exercises: [],
  },
  {
    id: 'js-05-functions',
    number: 5,
    name: 'Functions Deep Dive',
    description: 'Function forms, parameters, returns, higher-order functions, purity, and currying',
    guideFile: 'arguments/chapters/js-05-functions.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: functionsSteps,
    exercises: [],
  },
  {
    id: 'js-06-objects-prototypes',
    number: 6,
    name: 'Objects & Prototypes',
    description: 'Object creation, property descriptors, prototypes, cloning, Maps and Sets',
    guideFile: 'arguments/chapters/js-06-objects-prototypes.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: objectsPrototypesSteps,
    exercises: [],
  },
  {
    id: 'js-07-arrays',
    number: 7,
    name: 'Arrays & Iteration',
    description: 'Array creation, mutation and non-mutating methods, reduction, search, iteration',
    guideFile: 'arguments/chapters/js-07-arrays.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: arraysSteps,
    exercises: [],
  },
  {
    id: 'js-08-strings-numbers-dates',
    number: 8,
    name: 'Strings, Numbers, Dates',
    description: 'String manipulation, number handling, Math, BigInt, and Date APIs',
    guideFile: 'arguments/chapters/js-08-strings-numbers-dates.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: stringsNumbersDatesSteps,
    exercises: [],
  },
  {
    id: 'js-09-scope-closures',
    number: 9,
    name: 'Scope, Closures, Hoisting',
    description: 'Scope rules, lexical scoping, hoisting behavior, and closure patterns',
    guideFile: 'arguments/chapters/js-09-scope-closures.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: scopeClosuresSteps,
    exercises: [],
  },
  {
    id: 'js-10-this-keyword',
    number: 10,
    name: "The 'this' Keyword",
    description: 'Default, implicit, explicit, and new binding rules plus arrow function behavior',
    guideFile: 'arguments/chapters/js-10-this-keyword.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: thisKeywordSteps,
    exercises: [],
  },
  {
    id: 'js-11-classes',
    number: 11,
    name: 'Classes & Inheritance',
    description: 'Class syntax, private fields, static members, inheritance, and when to use classes',
    guideFile: 'arguments/chapters/js-11-classes.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: classesSteps,
    exercises: [],
  },
  {
    id: 'js-12-modules',
    number: 12,
    name: 'Modules',
    description: 'ES Modules, CommonJS, dynamic imports, and module patterns',
    guideFile: 'arguments/chapters/js-12-modules.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: modulesSteps,
    exercises: [],
  },
  {
    id: 'js-13-async',
    number: 13,
    name: 'Asynchronous JavaScript',
    description: 'Callbacks, Promises, async/await, parallel vs serial execution, cancellation',
    guideFile: 'arguments/chapters/js-13-async.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: asyncSteps,
    exercises: [],
  },
  {
    id: 'js-14-error-handling',
    number: 14,
    name: 'Error Handling',
    description: 'Throwing, catching, error types, custom errors, and async error strategies',
    guideFile: 'arguments/chapters/js-14-error-handling.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: errorHandlingSteps,
    exercises: [],
  },
  {
    id: 'js-15-event-loop',
    number: 15,
    name: 'The Event Loop',
    description: 'Mental model, microtasks vs macrotasks, browser and Node specifics',
    guideFile: 'arguments/chapters/js-15-event-loop.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: eventLoopSteps,
    exercises: [],
  },
  {
    id: 'js-16-browser-apis',
    number: 16,
    name: 'Browser APIs & DOM',
    description: 'DOM manipulation, events, Fetch, storage, and essential browser APIs',
    guideFile: 'arguments/chapters/js-16-browser-apis.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: browserApisSteps,
    exercises: [],
  },
  {
    id: 'js-17-nodejs',
    number: 17,
    name: 'Node.js Runtime',
    description: 'What Node is, core modules, streams, npm ecosystem, and frameworks',
    guideFile: 'arguments/chapters/js-17-nodejs.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: nodejsSteps,
    exercises: [],
  },
  {
    id: 'js-18-modern-es',
    number: 18,
    name: 'Modern ES2020+',
    description: 'New language features from ES2020 through ES2024 and beyond',
    guideFile: 'arguments/chapters/js-18-modern-es.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: modernEsSteps,
    exercises: [],
  },
  {
    id: 'js-19-typescript',
    number: 19,
    name: 'TypeScript',
    description: 'Type system fundamentals, generics, utility types, and advanced patterns',
    guideFile: 'arguments/chapters/js-19-typescript.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: typescriptSteps,
    exercises: [],
  },
  {
    id: 'js-20-tooling',
    number: 20,
    name: 'Tooling & Build',
    description: 'Package managers, bundlers, linters, formatters, and monorepo tools',
    guideFile: 'arguments/chapters/js-20-tooling.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: toolingSteps,
    exercises: [],
  },
  {
    id: 'js-21-testing',
    number: 21,
    name: 'Testing',
    description: 'Test runners, test types, end-to-end testing, coverage and strategy',
    guideFile: 'arguments/chapters/js-21-testing.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: testingSteps,
    exercises: [],
  },
  {
    id: 'js-22-performance',
    number: 22,
    name: 'Performance',
    description: 'Measurement, JS-specific optimizations, memory, bundle size, rendering',
    guideFile: 'arguments/chapters/js-22-performance.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: performanceSteps,
    exercises: [],
  },
  {
    id: 'js-23-security',
    number: 23,
    name: 'Security',
    description: 'XSS, CSRF, injection, authentication, dependency and secret management',
    guideFile: 'arguments/chapters/js-23-security.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: securitySteps,
    exercises: [],
  },
  {
    id: 'js-24-patterns',
    number: 24,
    name: 'Patterns & Architecture',
    description: 'Programming paradigms, design patterns, functional patterns, code organization, concurrency',
    guideFile: 'arguments/chapters/js-24-patterns.md',
    exerciseDir: '',
    status: 'available',
    track: 'javascript',
    steps: patternsSteps,
    exercises: [],
  },
];
