graph TB
    Root[react-mastery-exercises]
    
    Root --> SRC[src/]
    Root --> Config[Configuration Files]
    Root --> Scripts[scripts/]
    Root --> Docs[docs/]
    
    SRC --> M01[01-fundamentals/]
    SRC --> M02[02-hooks/]
    SRC --> M03[03-component-patterns/]
    SRC --> M04[04-styling/]
    SRC --> M05[05-routing/]
    SRC --> M06[06-state-management/]
    SRC --> M07[07-data-fetching/]
    SRC --> M08[08-forms/]
    SRC --> M09[09-performance/]
    SRC --> M10[10-testing/]
    SRC --> M11[11-typescript/]
    SRC --> M12[12-advanced-patterns/]
    
    M01 --> M01I[index.tsx<br/>Student implements here]
    M01 --> M01T[index.test.tsx<br/>Pre-written tests]
    M01 --> M01R[README.md<br/>Instructions]
    
    Scripts --> TestRunner[test-runner.js<br/>Handles module flags]
    Scripts --> Progress[check-progress.js<br/>Shows completion status]
    
    Config --> Package[package.json<br/>npm test 3 runs modules 1-3]
    Config --> Jest[jest.config.js]
    Config --> TS[tsconfig.json]
    
    Docs --> Guide[getting-started.md]
    Docs --> Mapping[angular-to-react.md]
    
    TestRunner -.Module Flag.-> M01T
    TestRunner -.Module Flag.-> M02
    TestRunner -.Module Flag.-> M03
    
    style Root fill:#e1f5ff
    style SRC fill:#fff9e6
    style M01 fill:#e6f7ff
    style M01I fill:#d9f7be
    style M01T fill:#ffccc7
    style Scripts fill:#f9f0ff
    style TestRunner fill:#ff9999
    style Config fill:#f0f0f0
    style Docs fill:#fff1f0