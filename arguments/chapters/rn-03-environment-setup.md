# Environment Setup: From Zero to Running App

> Setting up Expo, simulators, and your first running React Native project in under 10 minutes.

---

## Table of Contents

1. [Expo vs Bare React Native CLI](#1-expo-vs-bare-react-native-cli)
2. [Required Installs](#2-required-installs)
3. [Project Bootstrap](#3-project-bootstrap)

---

## 1. Expo vs Bare React Native CLI

### The first decision nobody explains properly

When you start a web React project, the answer is simple: run `npm create vite@latest` and move on with your life. React Native is not that clean. You are immediately faced with a fork in the road: **Expo** or the **bare React Native CLI**. Pick wrong and you will either eject mid-project or fight tooling you never needed. So let's settle this now.

The React Native CLI (sometimes called "bare" or "vanilla" RN) gives you a raw Xcode project and a raw Android Gradle project sitting right in your repo. You have total control — and total responsibility. You configure Xcode signing, Gradle build variants, CocoaPods, native module linking, and ProGuard rules yourself. This is the equivalent of ejecting from Create React App back in 2018 and wiring Webpack by hand.

**Expo** sits on top of React Native and manages the native projects for you. It started as a closed sandbox (the old "Managed Workflow") but has evolved dramatically. The modern approach — **Expo with Development Builds** — gives you a custom native binary that includes any native modules you actually need, built in the cloud or locally, while Expo handles the build pipeline, OTA updates, and configuration through a single `app.json` file.

### The comparison you actually need

| Criteria | Expo + Dev Build | Bare React Native CLI |
|---|---|---|
| **Setup time** | ~5 minutes | 30-60 minutes |
| **Native code access** | Full (via config plugins + dev client) | Full (you own the Xcode/Android projects) |
| **OTA updates** | Built-in with `expo-updates` | Manual setup with CodePush or custom |
| **Build pipeline** | EAS Build (cloud) or local | Xcode + Gradle locally |
| **Upgrade path** | `npx expo install` handles compatibility | Manual, error-prone `react-native upgrade` |
| **Best for** | 95% of new projects | Brownfield apps, deeply custom native code |

### The recommendation

Use **Expo with Development Builds**. This is not the old "Expo Go" sandbox that could not use custom native modules. The modern Expo stack gives you everything the bare CLI does, minus the maintenance burden of raw Xcode and Gradle projects. You can still write native Objective-C, Swift, Java, or Kotlin when you need to — Expo's config plugin system and `expo-modules-core` make that seamless.

The only situation where the bare CLI makes sense today is if you are integrating React Native into an **existing native app** (a "brownfield" scenario) or if your company has a native build team that insists on owning the Xcode project directly.

```mermaid
flowchart TD
    Start["New React Native project?"] --> Q1{"Need to embed RN\ninto existing native app?"}
    Q1 -->|Yes| Bare["Bare React Native CLI"]
    Q1 -->|No| Q2{"Need custom native modules\n(Bluetooth, NFC, etc.)?"}
    Q2 -->|No| ExpoManaged["Expo Managed\n(Expo Go for prototyping)"]
    Q2 -->|Yes| ExpoDev["Expo + Development Build\n(recommended)"]
    
    style ExpoDev fill:#51cf66,stroke:#2b8a3e,color:#000
    style Bare fill:#ff6b6b,stroke:#c92a2a,color:#000
    style ExpoManaged fill:#4dabf7,stroke:#1864ab,color:#000
```

> **Note:** If you are coming from web React and used `create-react-app` or Vite, think of Expo as the Vite of React Native — it handles the complex build tooling so you can focus on writing components. The bare CLI is like configuring Webpack, Babel, and PostCSS from scratch.

---

## 2. Required Installs

### The dependency stack is larger than you expect

On the web, you need Node.js and a browser. That is it. React Native compiles to actual native code, so you need the full native toolchain for every platform you want to target. This is the most painful part of getting started — but you only do it once.

Here is every tool you need, in order of installation.

### Node.js (LTS 20+)

You already have this if you do web React work. Verify:

```bash
node --version
# Should print v20.x.x or higher
```

If not, install from [nodejs.org](https://nodejs.org) or use a version manager like `nvm` (macOS/Linux) or `nvm-windows`. Expo SDK 52+ requires Node 18 at minimum, but you should be on LTS 20 or 22.

### Watchman (macOS only)

Watchman is a file-watching service from Meta that makes the Metro bundler (React Native's equivalent of Vite/Webpack) dramatically faster on macOS. Without it, hot reloads on large projects can lag.

```bash
brew install watchman
```

On Windows and Linux, Metro uses its own file watcher. You do not need Watchman there.

### Xcode and iOS Simulator (macOS only)

You **cannot** build iOS apps on Windows or Linux. Period. If you do not have a Mac, skip iOS for now and work with Android only — or use EAS Build in the cloud and test on a physical iPhone.

1. Install Xcode from the Mac App Store (it is ~12 GB, start the download now).
2. Open Xcode at least once and accept the license agreement.
3. Install the Xcode Command Line Tools:

```bash
xcode-select --install
```

4. Install CocoaPods (iOS dependency manager):

```bash
sudo gem install cocoapods
```

> **Gotcha:** If `gem install` fails with a permissions error on newer macOS versions, use `brew install cocoapods` instead. The Homebrew version avoids fighting with Apple's system Ruby.

5. Open Xcode, go to **Settings > Platforms**, and download at least one iOS Simulator runtime (iOS 17+ recommended).

### Android Studio, Android SDK, and Emulator

This is required on **all** operating systems if you want to run on Android.

1. Download and install [Android Studio](https://developer.android.com/studio).
2. During setup, make sure these components are checked:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Virtual Device (AVD)
3. Open Android Studio, go to **SDK Manager** (Settings > Languages & Frameworks > Android SDK), and install:
   - **SDK Platforms tab:** Android 14 (API 34) or newer
   - **SDK Tools tab:** Android SDK Build-Tools, Android Emulator, Android SDK Platform-Tools

4. Create an emulator via **Device Manager**:

```
Device: Pixel 7 (or Pixel 8)
System Image: API 34 (x86_64 or arm64 depending on your machine)
```

5. Set environment variables. On macOS/Linux, add to your `~/.zshrc` or `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

On Windows, set `ANDROID_HOME` to `%LOCALAPPDATA%\Android\Sdk` in your System Environment Variables, and add the `emulator` and `platform-tools` subdirectories to your `PATH`.

6. Verify it works:

```bash
adb --version
# Should print Android Debug Bridge version
```

### JDK 17

React Native's Android build requires JDK 17. Android Studio bundles a JDK, but it is safer to have a standalone one:

```bash
# macOS
brew install --cask zulu@17

# Windows (via Chocolatey)
choco install zulu17

# Verify
java -version
# Should print openjdk version "17.x.x"
```

> **Gotcha:** JDK 21 might seem like a good idea since it is the latest LTS, but React Native's Gradle configuration targets JDK 17 specifically. Using 21 can produce cryptic build errors. Stick with 17.

### EAS CLI

EAS (Expo Application Services) is how you build and submit apps without wrestling with Xcode and Gradle directly. Install it globally:

```bash
npm install -g eas-cli
```

### The complete checklist

```
┌─────────────────────────────────────────────────────────────┐
│                  Required Installs Checklist                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  All platforms:                                             │
│  ✓ Node.js LTS 20+                                         │
│  ✓ Android Studio + Android SDK (API 34+)                   │
│  ✓ Android Emulator (Pixel 7, API 34)                       │
│  ✓ JDK 17 (Azul Zulu recommended)                           │
│  ✓ EAS CLI (npm install -g eas-cli)                         │
│                                                             │
│  macOS additional:                                          │
│  ✓ Watchman                                                 │
│  ✓ Xcode + iOS Simulator runtime                            │
│  ✓ CocoaPods                                                │
│  ✓ Xcode Command Line Tools                                 │
│                                                             │
│  Not required:                                              │
│  ✗ Expo Go app (we use Development Builds instead)          │
│  ✗ Ruby version manager (unless CocoaPods demands it)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Common mistake:** Many tutorials tell you to install the `react-native-cli` package globally. **Do not do this.** It conflicts with the modern Expo workflow and is no longer recommended even for bare projects. The `npx` command handles everything you need.

---

## 3. Project Bootstrap

### From empty folder to running app

On the web, `npm create vite@latest` gives you a working dev server in about 15 seconds. React Native takes a bit longer because it has to install native dependencies and build a native binary — but Expo keeps it as painless as possible.

### Create the project

```bash
npx create-expo-app@latest my-app
cd my-app
```

This scaffolds a new Expo project with TypeScript, file-based routing (via Expo Router), and a sensible default structure. You will see something like this:

```
my-app/
├── app/                    # File-based routes (like Next.js pages/)
│   ├── (tabs)/             # Tab navigator group
│   │   ├── index.tsx       # Home tab
│   │   └── explore.tsx     # Explore tab
│   ├── _layout.tsx         # Root layout
│   └── +not-found.tsx      # 404 screen
├── assets/                 # Images, fonts
├── components/             # Shared components
├── constants/              # Theme colors, config
├── app.json                # Expo configuration
├── package.json
└── tsconfig.json
```

Notice there is no `ios/` or `android/` folder yet. Expo generates those when you create a development build. This is a feature, not a limitation — it means those folders are derived artifacts, not source code you maintain.

> **Web comparison:** `app.json` in Expo is like `vite.config.ts` on the web — it is your central config file. Except it also controls your app icon, splash screen, permissions, and native module settings. One file to rule them all.

### Run on iOS Simulator (macOS only)

```bash
npx expo run:ios
```

The first run takes 3-5 minutes because it is compiling the entire native project. Subsequent runs are much faster thanks to caching. This command:

1. Generates the `ios/` directory if it does not exist
2. Installs CocoaPods dependencies
3. Compiles the native binary via `xcodebuild`
4. Installs the app on the iOS Simulator
5. Starts the Metro bundler (the JS dev server)

You should see the default tab-based app on the simulator.

### Run on Android Emulator

Make sure your Android emulator is running first (start it from Android Studio's Device Manager), then:

```bash
npx expo run:android
```

Same deal: first build is slow, subsequent builds are fast. This generates the `android/` directory, runs `gradlew assembleDebug`, and installs the APK on the emulator.

### The development loop

Once the app is running, your workflow looks like this:

```mermaid
sequenceDiagram
    participant You as Developer
    participant Metro as Metro Bundler
    participant Device as Simulator/Device

    You->>Metro: Save a .tsx file
    Metro->>Metro: Bundle JS changes
    Metro->>Device: Hot reload (Fast Refresh)
    Device->>Device: UI updates instantly
    
    Note over You,Device: JS-only changes = instant reload
    Note over You,Device: Native changes = rebuild required
```

**Fast Refresh** works exactly like HMR on the web — you save a file, and the component re-renders without losing state. The key difference: if you add a new **native** dependency (like a camera library that includes Objective-C or Java code), you need to rebuild the native binary with `npx expo run:ios` or `npx expo run:android`. Pure JavaScript/TypeScript changes never require a rebuild.

### Verifying everything works

Open `app/(tabs)/index.tsx` in your editor and change some text. Save the file and watch the simulator update within a second or two. If that works, your environment is correctly set up.

Let's go one step further and make sure you can write a component. Replace the contents of `app/(tabs)/index.tsx` with:

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>It works!</Text>
      <Text style={styles.subtitle}>
        Your React Native environment is ready.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
```

Save. The simulator should show your new screen instantly.

> **Web comparison:** Notice there is no `className` or CSS file. In React Native, you use `StyleSheet.create` with JavaScript objects that look like CSS but use camelCase property names. There is no cascade, no specificity, no `!important`. Every style is scoped to its component. We will cover styling in depth in a later chapter.

### Troubleshooting common setup issues

**Metro bundler port conflict:**

```bash
# If port 8081 is already in use
npx expo start --port 8082
```

**iOS build fails with "signing" error:**
Open `ios/myapp.xcworkspace` in Xcode, select the project target, and set a valid Development Team under Signing & Capabilities. You need a free or paid Apple Developer account.

**Android emulator not detected:**
Make sure the emulator is fully booted before running `npx expo run:android`. You can verify ADB sees it:

```bash
adb devices
# Should list your emulator
```

**`pod install` fails on macOS:**
This usually means a Ruby or CocoaPods version mismatch. The nuclear fix:

```bash
cd ios
bundle install        # If a Gemfile exists
bundle exec pod install
cd ..
```

**Gradle build fails with "SDK location not found":**
Your `ANDROID_HOME` environment variable is not set or pointing to the wrong path. Double-check it:

```bash
echo $ANDROID_HOME
# macOS/Linux: should print something like /Users/you/Library/Android/sdk
# Windows (PowerShell): echo $env:ANDROID_HOME
```

**"Unable to load script" on Android:**
The Metro bundler might not be reachable from the emulator. Run:

```bash
adb reverse tcp:8081 tcp:8081
```

This forwards the emulator's port 8081 to your machine's port 8081.

> **Pro tip:** When things go truly sideways, the reset command is your friend:
> ```bash
> npx expo start --clear
> ```
> This clears the Metro cache and often fixes mysterious bundling errors. It is the React Native equivalent of deleting `node_modules` and reinstalling — but faster.

---