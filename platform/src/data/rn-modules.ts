import type { Module, Step } from '@/types/exercise';

const prerequisitesSteps: Step[] = [
  { type: 'lesson', id: 'react-prerequisites', title: 'React (Non-Negotiable)', sectionHeading: '1. React (Non-Negotiable)' },
  { type: 'lesson', id: 'js-ts-prerequisites', title: 'JavaScript / TypeScript', sectionHeading: '2. JavaScript / TypeScript' },
  { type: 'lesson', id: 'tooling-prerequisites', title: 'Tooling', sectionHeading: '3. Tooling' },
  { type: 'lesson', id: 'mobile-concepts', title: 'Mobile Concepts', sectionHeading: '4. Mobile Concepts' },
];

const rnFundamentalsSteps: Step[] = [
  { type: 'lesson', id: 'what-rn-is', title: 'What React Native Actually Is', sectionHeading: '1. What React Native Actually Is' },
  { type: 'lesson', id: 'mental-model-shift', title: 'Mental Model Shift from Web', sectionHeading: '2. Mental Model Shift from Web' },
  { type: 'lesson', id: 'architecture-overview', title: 'Architecture Overview', sectionHeading: '3. Architecture Overview' },
];

const envSetupSteps: Step[] = [
  { type: 'lesson', id: 'expo-vs-bare', title: 'Expo vs Bare React Native CLI', sectionHeading: '1. Expo vs Bare React Native CLI' },
  { type: 'lesson', id: 'required-installs', title: 'Required Installs', sectionHeading: '2. Required Installs' },
  { type: 'lesson', id: 'project-bootstrap', title: 'Project Bootstrap', sectionHeading: '3. Project Bootstrap' },
];

const coreComponentsSteps: Step[] = [
  { type: 'lesson', id: 'building-block-components', title: 'Building-Block Components', sectionHeading: '1. Building-Block Components' },
  { type: 'exercise', id: 'profile-card', title: 'Exercise: ProfileCard' },
  { type: 'exercise', id: 'counter-button', title: 'Exercise: CounterButton' },
  { type: 'lesson', id: 'core-apis', title: 'Core APIs to Internalize', sectionHeading: '2. Core APIs to Internalize' },
  { type: 'exercise', id: 'contact-list', title: 'Exercise: ContactList' },
  { type: 'exercise', id: 'toggle-card', title: 'Exercise: ToggleCard' },
];

const stylingLayoutSteps: Step[] = [
  { type: 'lesson', id: 'core-mechanics', title: 'Core Mechanics', sectionHeading: '1. Core Mechanics' },
  { type: 'lesson', id: 'responsive-design', title: 'Responsive Design', sectionHeading: '2. Responsive Design' },
  { type: 'lesson', id: 'styling-libraries', title: 'Styling Libraries', sectionHeading: '3. Styling Libraries' },
  { type: 'lesson', id: 'theming', title: 'Theming', sectionHeading: '4. Theming' },
  { type: 'lesson', id: 'icons-and-assets', title: 'Icons and Assets', sectionHeading: '5. Icons and Assets' },
];

const navigationSteps: Step[] = [
  { type: 'lesson', id: 'react-navigation-v7', title: 'React Navigation v7', sectionHeading: '1. React Navigation v7' },
  { type: 'lesson', id: 'navigation-concepts', title: 'Concepts to Master', sectionHeading: '2. Concepts to Master' },
  { type: 'lesson', id: 'expo-router', title: 'Expo Router', sectionHeading: '3. Expo Router' },
];

const stateManagementSteps: Step[] = [
  { type: 'lesson', id: 'local-state', title: 'Local State', sectionHeading: '1. Local State' },
  { type: 'lesson', id: 'global-state', title: 'Global State', sectionHeading: '2. Global State' },
  { type: 'lesson', id: 'server-state', title: 'Server State', sectionHeading: '3. Server State' },
];

const formsInputSteps: Step[] = [
  { type: 'lesson', id: 'core-inputs', title: 'Core Input Primitives', sectionHeading: '1. Core Input Primitives' },
  { type: 'lesson', id: 'form-libraries', title: 'Form Libraries', sectionHeading: '2. Form Libraries' },
  { type: 'lesson', id: 'specialized-inputs', title: 'Specialized Inputs', sectionHeading: '3. Specialized Inputs' },
];

const networkingDataSteps: Step[] = [
  { type: 'lesson', id: 'http', title: 'HTTP', sectionHeading: '1. HTTP' },
  { type: 'lesson', id: 'tanstack-query', title: 'Server State with TanStack Query', sectionHeading: '2. Server State with TanStack Query' },
  { type: 'lesson', id: 'graphql', title: 'GraphQL', sectionHeading: '3. GraphQL' },
  { type: 'lesson', id: 'realtime', title: 'Realtime', sectionHeading: '4. Realtime' },
  { type: 'lesson', id: 'offline-first', title: 'Offline-First Patterns', sectionHeading: '5. Offline-First Patterns' },
];

const nativeDeviceApisSteps: Step[] = [
  { type: 'lesson', id: 'hardware-sensors', title: 'Hardware and Sensors', sectionHeading: '1. Hardware and Sensors' },
  { type: 'lesson', id: 'media', title: 'Media', sectionHeading: '2. Media' },
  { type: 'lesson', id: 'system-apis', title: 'System APIs', sectionHeading: '3. System APIs' },
  { type: 'lesson', id: 'permissions-philosophy', title: 'Permissions Philosophy', sectionHeading: '4. Permissions Philosophy' },
];

const storagePersistenceSteps: Step[] = [
  { type: 'lesson', id: 'key-value-storage', title: 'Key-Value Storage', sectionHeading: '1. Key-Value Storage' },
  { type: 'lesson', id: 'secure-storage', title: 'Secure Storage', sectionHeading: '2. Secure Storage' },
  { type: 'lesson', id: 'relational-document', title: 'Relational and Document Storage', sectionHeading: '3. Relational and Document Storage' },
  { type: 'lesson', id: 'when-to-use-what', title: 'When to Use What', sectionHeading: '4. When to Use What' },
];

const animationsGesturesSteps: Step[] = [
  { type: 'lesson', id: 'reanimated-3', title: 'Reanimated 3', sectionHeading: '1. Reanimated 3' },
  { type: 'lesson', id: 'gesture-handler', title: 'Gesture Handler', sectionHeading: '2. Gesture Handler' },
  { type: 'lesson', id: 'other-animation-tools', title: 'Other Animation Tools', sectionHeading: '3. Other Animation Tools' },
  { type: 'lesson', id: 'when-to-reach-for-what', title: 'When to Reach for What', sectionHeading: '4. When to Reach for What' },
];

const performanceSteps: Step[] = [
  { type: 'lesson', id: 'two-thread-model', title: 'The Two-Thread Mental Model', sectionHeading: '1. The Two-Thread Mental Model' },
  { type: 'lesson', id: 'lists-performance', title: 'Lists', sectionHeading: '2. Lists' },
  { type: 'lesson', id: 're-renders', title: 'Re-Renders', sectionHeading: '3. Re-Renders' },
  { type: 'lesson', id: 'images-performance', title: 'Images', sectionHeading: '4. Images' },
  { type: 'lesson', id: 'js-engine', title: 'JS Engine', sectionHeading: '5. JS Engine' },
  { type: 'lesson', id: 'perf-tools', title: 'Performance Tools', sectionHeading: '6. Performance Tools' },
  { type: 'lesson', id: 'bundle-size', title: 'Bundle Size', sectionHeading: '7. Bundle Size' },
];

const nativeModulesSteps: Step[] = [
  { type: 'lesson', id: 'new-architecture', title: 'The New Architecture', sectionHeading: '1. The New Architecture' },
  { type: 'lesson', id: 'when-to-write-native', title: 'When to Write a Native Module', sectionHeading: '2. When to Write a Native Module' },
  { type: 'lesson', id: 'native-skills-needed', title: 'Skills Needed', sectionHeading: '3. Skills Needed' },
  { type: 'lesson', id: 'recommended-path', title: 'Recommended Path', sectionHeading: '4. Recommended Path' },
];

const authSecuritySteps: Step[] = [
  { type: 'lesson', id: 'auth-patterns', title: 'Auth Patterns', sectionHeading: '1. Auth Patterns' },
  { type: 'lesson', id: 'auth-providers', title: 'Auth Providers', sectionHeading: '2. Auth Providers' },
  { type: 'lesson', id: 'token-handling', title: 'Token Handling', sectionHeading: '3. Token Handling' },
  { type: 'lesson', id: 'security-hardening', title: 'Security Hardening', sectionHeading: '4. Security Hardening' },
];

const testingSteps: Step[] = [
  { type: 'lesson', id: 'unit-component-testing', title: 'Unit and Component Testing', sectionHeading: '1. Unit and Component Testing' },
  { type: 'lesson', id: 'integration-testing', title: 'Integration Testing', sectionHeading: '2. Integration Testing' },
  { type: 'lesson', id: 'e2e-testing', title: 'End-to-End Testing', sectionHeading: '3. End-to-End Testing' },
  { type: 'lesson', id: 'visual-regression', title: 'Visual Regression', sectionHeading: '4. Visual Regression' },
  { type: 'lesson', id: 'performance-regression', title: 'Performance Regression', sectionHeading: '5. Performance Regression' },
];

const pushBackgroundSteps: Step[] = [
  { type: 'lesson', id: 'push-notifications', title: 'Push Notifications', sectionHeading: '1. Push Notifications' },
  { type: 'lesson', id: 'backend-services', title: 'Backend Services', sectionHeading: '2. Backend Services' },
  { type: 'lesson', id: 'background-work', title: 'Background Work', sectionHeading: '3. Background Work' },
  { type: 'lesson', id: 'background-limits', title: 'Background Limits', sectionHeading: '4. Background Limits' },
];

const buildDeploySteps: Step[] = [
  { type: 'lesson', id: 'eas-build', title: 'EAS Build', sectionHeading: '1. EAS Build' },
  { type: 'lesson', id: 'local-builds', title: 'Local Builds', sectionHeading: '2. Local Builds' },
  { type: 'lesson', id: 'ios-submission', title: 'iOS Submission', sectionHeading: '3. iOS Submission' },
  { type: 'lesson', id: 'android-submission', title: 'Android Submission', sectionHeading: '4. Android Submission' },
  { type: 'lesson', id: 'versioning', title: 'Versioning', sectionHeading: '5. Versioning' },
  { type: 'lesson', id: 'ci-cd', title: 'CI/CD', sectionHeading: '6. CI/CD' },
];

const otaUpdatesSteps: Step[] = [
  { type: 'lesson', id: 'eas-update', title: 'EAS Update', sectionHeading: '1. EAS Update' },
  { type: 'lesson', id: 'what-can-be-ota', title: 'What Can Be OTA\'d', sectionHeading: '2. What Can Be OTA\'d' },
  { type: 'lesson', id: 'update-strategy', title: 'Update Strategy', sectionHeading: '3. Update Strategy' },
  { type: 'lesson', id: 'versioning-ota', title: 'Versioning OTA with Native', sectionHeading: '4. Versioning OTA with Native' },
  { type: 'lesson', id: 'compliance', title: 'Compliance', sectionHeading: '5. Compliance' },
];

const monitoringSteps: Step[] = [
  { type: 'lesson', id: 'crash-reporting', title: 'Crash Reporting', sectionHeading: '1. Crash Reporting' },
  { type: 'lesson', id: 'analytics', title: 'Analytics', sectionHeading: '2. Analytics' },
  { type: 'lesson', id: 'performance-monitoring', title: 'Performance Monitoring', sectionHeading: '3. Performance Monitoring' },
  { type: 'lesson', id: 'feature-flags', title: 'Feature Flags and Remote Config', sectionHeading: '4. Feature Flags and Remote Config' },
  { type: 'lesson', id: 'logging', title: 'Logging', sectionHeading: '5. Logging' },
  { type: 'lesson', id: 'ab-testing', title: 'A/B Testing', sectionHeading: '6. A/B Testing' },
];

const advancedTopicsSteps: Step[] = [
  { type: 'lesson', id: 'monorepo', title: 'Monorepo', sectionHeading: '1. Monorepo' },
  { type: 'lesson', id: 'cross-platform-sharing', title: 'Cross-Platform Code Sharing', sectionHeading: '2. Cross-Platform Code Sharing' },
  { type: 'lesson', id: 'internationalization', title: 'Internationalization', sectionHeading: '3. Internationalization' },
  { type: 'lesson', id: 'accessibility', title: 'Accessibility', sectionHeading: '4. Accessibility' },
  { type: 'lesson', id: 'animations-at-scale', title: 'Animations at Scale', sectionHeading: '5. Animations at Scale' },
  { type: 'lesson', id: 'audio-video-at-scale', title: 'Audio / Video at Scale', sectionHeading: '6. Audio / Video at Scale' },
  { type: 'lesson', id: 'maps', title: 'Maps', sectionHeading: '7. Maps' },
  { type: 'lesson', id: 'bluetooth-nfc', title: 'Bluetooth / NFC / Hardware', sectionHeading: '8. Bluetooth / NFC / Hardware' },
  { type: 'lesson', id: 'payments', title: 'Payments', sectionHeading: '9. Payments' },
  { type: 'lesson', id: 'architecture-patterns', title: 'Architecture Patterns', sectionHeading: '10. Architecture Patterns' },
  { type: 'lesson', id: 'multi-environment', title: 'Multi-Environment', sectionHeading: '11. Multi-Environment' },
  { type: 'lesson', id: 'app-size-optimization', title: 'App Size Optimization', sectionHeading: '12. App Size Optimization' },
  { type: 'lesson', id: 'app-store-optimization', title: 'App Store Optimization', sectionHeading: '13. App Store Optimization' },
];

export const rnModules: Module[] = [
  {
    id: 'rn-01-prerequisites',
    number: 1,
    name: 'Prerequisites',
    description: 'React, JavaScript/TypeScript, tooling, and mobile concepts you need before starting',
    guideFile: 'arguments/chapters/rn-01-prerequisites.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: prerequisitesSteps,
    exercises: [],
  },
  {
    id: 'rn-02-fundamentals',
    number: 2,
    name: 'React Native Fundamentals',
    description: 'What RN actually is, mental model shift from web, architecture overview',
    guideFile: 'arguments/chapters/rn-02-fundamentals.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: rnFundamentalsSteps,
    exercises: [],
  },
  {
    id: 'rn-03-environment-setup',
    number: 3,
    name: 'Environment Setup',
    description: 'Expo vs Bare CLI, required installs, project bootstrap',
    guideFile: 'arguments/chapters/rn-03-environment-setup.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: envSetupSteps,
    exercises: [],
  },
  {
    id: 'rn-04-core-components',
    number: 4,
    name: 'Core Components & APIs',
    description: 'View, Text, Image, FlatList, Pressable, and essential platform APIs',
    guideFile: 'arguments/chapters/rn-04-core-components.md',
    exerciseDir: 'src/rn-04-core-components',
    status: 'available',
    track: 'react-native',
    steps: coreComponentsSteps,
    exercises: [
      {
        id: 'profile-card',
        number: 1,
        name: 'ProfileCard (View + Text + Image)',
        componentName: 'ProfileCard',
        description: 'Build a profile card using View, Text, and Image — the three most fundamental RN components.',
        hints: [
          'Wrap everything in `<View testID="profile-card">`',
          'Use `<Image testID="avatar" source={{ uri: avatarUrl }} style={{ width: 60, height: 60 }} />`',
          'Use `<Text testID="name">{name}</Text>` for the name',
          'Use `<Text testID="role">{role}</Text>` for the role',
        ],
      },
      {
        id: 'counter-button',
        number: 2,
        name: 'CounterButton (Pressable + State)',
        componentName: 'CounterButton',
        description: 'Create a tappable counter using Pressable — the modern touch primitive in React Native.',
        hints: [
          'Use `useState(0)` for the count',
          'Display `Count: {count}` in `<Text testID="count">`',
          '`<Pressable testID="increment" onPress={() => setCount(c => c + 1)}><Text>+</Text></Pressable>`',
          'Same pattern for decrement with `-`',
        ],
      },
      {
        id: 'contact-list',
        number: 3,
        name: 'ContactList (FlatList)',
        componentName: 'ContactList',
        description: 'Render a scrollable list of contacts using FlatList — the virtualized list for React Native.',
        hints: [
          'Use `<FlatList testID="contact-list" data={contacts} keyExtractor={item => item.id} ... />`',
          'Each row: `<View testID={`contact-${item.id}`}><Text>{item.name}</Text><Text>{item.phone}</Text></View>`',
          'Handle empty state: `ListEmptyComponent={<Text testID="empty">No contacts</Text>}`',
        ],
      },
      {
        id: 'toggle-card',
        number: 4,
        name: 'ToggleCard (Pressable + Conditional)',
        componentName: 'ToggleCard',
        description: 'Build a card that expands/collapses on press — combining Pressable with conditional rendering.',
        hints: [
          'Use `useState(false)` for the expanded state',
          '`<Pressable testID="toggle-header" onPress={() => setExpanded(e => !e)}><Text>{title}</Text></Pressable>`',
          'Only render content when expanded: `{expanded && <View testID="toggle-content"><Text>{content}</Text></View>}`',
        ],
      },
    ],
  },
  {
    id: 'rn-05-styling-layout',
    number: 5,
    name: 'Styling & Layout',
    description: 'StyleSheet, Flexbox, responsive design, NativeWind, theming',
    guideFile: 'arguments/chapters/rn-05-styling-layout.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: stylingLayoutSteps,
    exercises: [],
  },
  {
    id: 'rn-06-navigation',
    number: 6,
    name: 'Navigation',
    description: 'React Navigation v7, Expo Router, deep linking, auth flows',
    guideFile: 'arguments/chapters/rn-06-navigation.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: navigationSteps,
    exercises: [],
  },
  {
    id: 'rn-07-state-management',
    number: 7,
    name: 'State Management',
    description: 'Local state, Zustand, Jotai, Redux Toolkit, TanStack Query',
    guideFile: 'arguments/chapters/rn-07-state-management.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: stateManagementSteps,
    exercises: [],
  },
  {
    id: 'rn-08-forms-input',
    number: 8,
    name: 'Forms & Input',
    description: 'TextInput, keyboard handling, React Hook Form, specialized pickers',
    guideFile: 'arguments/chapters/rn-08-forms-input.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: formsInputSteps,
    exercises: [],
  },
  {
    id: 'rn-09-networking-data',
    number: 9,
    name: 'Networking & Data',
    description: 'fetch, TanStack Query, GraphQL, WebSockets, offline-first patterns',
    guideFile: 'arguments/chapters/rn-09-networking-data.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: networkingDataSteps,
    exercises: [],
  },
  {
    id: 'rn-10-native-device-apis',
    number: 10,
    name: 'Native Device APIs',
    description: 'Camera, location, biometrics, sensors, media, permissions',
    guideFile: 'arguments/chapters/rn-10-native-device-apis.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: nativeDeviceApisSteps,
    exercises: [],
  },
  {
    id: 'rn-11-storage-persistence',
    number: 11,
    name: 'Storage & Persistence',
    description: 'MMKV, secure storage, SQLite, WatermelonDB, when to use what',
    guideFile: 'arguments/chapters/rn-11-storage-persistence.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: storagePersistenceSteps,
    exercises: [],
  },
  {
    id: 'rn-12-animations-gestures',
    number: 12,
    name: 'Animations & Gestures',
    description: 'Reanimated 3, Gesture Handler, Lottie, Skia, motion design',
    guideFile: 'arguments/chapters/rn-12-animations-gestures.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: animationsGesturesSteps,
    exercises: [],
  },
  {
    id: 'rn-13-performance',
    number: 13,
    name: 'Performance Engineering',
    description: 'Two-thread model, FlashList, re-renders, Hermes, profiling',
    guideFile: 'arguments/chapters/rn-13-performance.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: performanceSteps,
    exercises: [],
  },
  {
    id: 'rn-14-native-modules',
    number: 14,
    name: 'Native Modules & New Architecture',
    description: 'JSI, Fabric, TurboModules, Codegen, Expo Modules API',
    guideFile: 'arguments/chapters/rn-14-native-modules.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: nativeModulesSteps,
    exercises: [],
  },
  {
    id: 'rn-15-auth-security',
    number: 15,
    name: 'Auth & Security',
    description: 'OAuth, token handling, biometric unlock, certificate pinning, hardening',
    guideFile: 'arguments/chapters/rn-15-auth-security.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: authSecuritySteps,
    exercises: [],
  },
  {
    id: 'rn-16-testing',
    number: 16,
    name: 'Testing',
    description: 'Jest, RNTL, Maestro, Detox, visual regression, Reassure',
    guideFile: 'arguments/chapters/rn-16-testing.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: testingSteps,
    exercises: [],
  },
  {
    id: 'rn-17-push-background',
    number: 17,
    name: 'Push & Background Tasks',
    description: 'Push notifications, APNs/FCM, background fetch, headless JS',
    guideFile: 'arguments/chapters/rn-17-push-background.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: pushBackgroundSteps,
    exercises: [],
  },
  {
    id: 'rn-18-build-deploy',
    number: 18,
    name: 'Build & Deploy',
    description: 'EAS Build, app store submission, versioning, CI/CD pipelines',
    guideFile: 'arguments/chapters/rn-18-build-deploy.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: buildDeploySteps,
    exercises: [],
  },
  {
    id: 'rn-19-ota-updates',
    number: 19,
    name: 'OTA Updates',
    description: 'EAS Update, delta updates, runtime versioning, compliance',
    guideFile: 'arguments/chapters/rn-19-ota-updates.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: otaUpdatesSteps,
    exercises: [],
  },
  {
    id: 'rn-20-monitoring-production',
    number: 20,
    name: 'Monitoring & Production',
    description: 'Sentry, analytics, feature flags, logging, A/B testing',
    guideFile: 'arguments/chapters/rn-20-monitoring-production.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: monitoringSteps,
    exercises: [],
  },
  {
    id: 'rn-21-advanced-topics',
    number: 21,
    name: 'Advanced Topics',
    description: 'Monorepo, i18n, accessibility, maps, payments, architecture at scale',
    guideFile: 'arguments/chapters/rn-21-advanced-topics.md',
    exerciseDir: '',
    status: 'available',
    track: 'react-native',
    steps: advancedTopicsSteps,
    exercises: [],
  },
];
