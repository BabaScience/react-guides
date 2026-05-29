# Forms and Input: TextInput and Beyond

> The single input primitive, keyboard management, and form handling in a mobile-first world.

---

## Table of Contents

1. [Core Input Primitives](#1-core-input-primitives)
2. [Form Libraries](#2-form-libraries)
3. [Specialized Inputs](#3-specialized-inputs)

---

## 1. Core Input Primitives

### The Single Input to Rule Them All

On the web, you have a buffet of input types: `<input type="text">`, `<input type="email">`, `<input type="number">`, `<input type="password">`, `<textarea>`, `<select>`, and a dozen more. Each one renders a different native widget and carries its own validation behavior.

React Native throws all of that away and gives you exactly one component: `TextInput`.

That is not a limitation — it is a reflection of how mobile platforms actually work. On iOS and Android, there is one text field widget. You change its *behavior* (what keyboard appears, whether text is obscured, how auto-correct behaves) through props, not by swapping components. Once you internalize this, forms in React Native feel simpler than on the web, not harder.

```mermaid
graph TD
    A["Web: Many Input Types"] --> B["&lt;input type='text'&gt;"]
    A --> C["&lt;input type='email'&gt;"]
    A --> D["&lt;input type='number'&gt;"]
    A --> E["&lt;input type='password'&gt;"]
    A --> F["&lt;textarea&gt;"]
    A --> G["&lt;select&gt;"]

    H["React Native: One Primitive"] --> I["TextInput"]
    I --> J["keyboardType='email-address'"]
    I --> K["keyboardType='numeric'"]
    I --> L["secureTextEntry={true}"]
    I --> M["multiline={true}"]
    I --> N["Props control behavior"]

    style H fill:#61dafb,stroke:#333,color:#000
    style I fill:#61dafb,stroke:#333,color:#000
```

### TextInput Props That Matter

Here is a `TextInput` configured for an email field. Notice how props replace what the web does with `type` attributes:

```tsx
import { TextInput, StyleSheet } from "react-native";
import { useState } from "react";

function EmailField() {
  const [email, setEmail] = useState("");

  return (
    <TextInput
      value={email}
      onChangeText={setEmail}
      placeholder="you@example.com"
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      returnKeyType="next"
      textContentType="emailAddress"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
```

Let's break down the props you will use constantly:

- **`keyboardType`** — Controls which keyboard layout appears. Options include `"default"`, `"email-address"`, `"numeric"`, `"phone-pad"`, `"decimal-pad"`, `"number-pad"`, and `"url"`. This is the closest equivalent to web input types.
- **`returnKeyType`** — Changes the label on the keyboard's return key: `"done"`, `"next"`, `"search"`, `"go"`, `"send"`. Use `"next"` when you have another field below, `"done"` for the last field.
- **`autoCapitalize`** — Set to `"none"` for emails and usernames, `"sentences"` for normal text, `"words"` for names, `"characters"` for all-caps.
- **`autoCorrect`** — Turn it off for emails, usernames, codes. Leave it on for freeform text.
- **`secureTextEntry`** — Obscures text for passwords. This replaces `<input type="password">`.
- **`textContentType`** (iOS) / **`autoComplete`** (Android + iOS 12+) — Enables autofill from the OS keychain. Use `"emailAddress"`, `"password"`, `"newPassword"`, `"oneTimeCode"`, etc.

### onChangeText vs onChange

This catches people coming from the web. On the web you write `onChange={(e) => setValue(e.target.value)}`. React Native gives you two options:

```tsx
// Preferred: onChangeText gives you the string directly
<TextInput onChangeText={(text) => setName(text)} />

// Also available: onChange gives you a native event
<TextInput
  onChange={(e) => {
    const text = e.nativeEvent.text;
    setName(text);
  }}
/>
```

Use `onChangeText` in 99% of cases. It is simpler and it is what form libraries expect. The only time you need `onChange` is when you need metadata from the native event (cursor position, for instance).

### Keyboard Management

The keyboard on mobile is not a quiet popup — it slides up and covers roughly half the screen. If your input is in the bottom half, the user cannot see what they are typing. This is the single biggest source of frustration in mobile forms, and React Native gives you tools to handle it.

**KeyboardAvoidingView** wraps your form and adjusts layout when the keyboard appears:

```tsx
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";

function LoginForm() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Your form fields here */}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
```

> **Gotcha:** The `behavior` prop on `KeyboardAvoidingView` is different per platform. Use `"padding"` on iOS and `"height"` on Android. Getting this wrong is the number one reason people think KeyboardAvoidingView "doesn't work" and abandon it. It works fine — it just needs the right behavior for each OS.

The `TouchableWithoutFeedback` wrapper with `Keyboard.dismiss` is the "tap outside to close keyboard" pattern. On the web, clicking outside an input naturally blurs it. On mobile, the keyboard stays open until you explicitly dismiss it. You need this wrapper.

The `keyboardShouldPersistTaps="handled"` prop on ScrollView is critical: without it, tapping a button while the keyboard is open dismisses the keyboard *instead of* pressing the button. Your users will tap "Submit" and nothing will happen — the keyboard just closes. They have to tap again. Setting this to `"handled"` lets buttons receive taps even when the keyboard is visible.

### Focusing the Next Field

On the web, pressing Tab moves to the next field automatically. On mobile, there is no Tab key. You wire this up yourself using refs and the `onSubmitEditing` callback:

```tsx
import { useRef } from "react";
import { TextInput } from "react-native";

function SignupForm() {
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  return (
    <>
      <TextInput
        placeholder="First name"
        returnKeyType="next"
        onSubmitEditing={() => lastNameRef.current?.focus()}
        blurOnSubmit={false}
      />
      <TextInput
        ref={lastNameRef}
        placeholder="Last name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        blurOnSubmit={false}
      />
      <TextInput
        ref={emailRef}
        placeholder="Email"
        returnKeyType="done"
        keyboardType="email-address"
      />
    </>
  );
}
```

Set `blurOnSubmit={false}` on all fields except the last one. Without it, pressing "Next" on the keyboard blurs the current field before focusing the next one, causing an ugly keyboard flicker as it briefly hides and reappears.

---

## 2. Form Libraries

### Why You Need One

Managing a couple of inputs with `useState` is fine. Managing a form with 8 fields, validation, error messages, dirty/touched tracking, and submit handling with raw state is a nightmare — the same nightmare you already know from web React. The good news: the same libraries work.

### React Hook Form — The Clear Winner

React Hook Form works in React Native with zero changes to its core API. You swap HTML elements for RN components and use `Controller` instead of `register` (since `register` relies on DOM refs). That is the only difference.

```tsx
import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    // Call your API
    console.log(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        )}
      />
      {errors.email && (
        <Text style={styles.error}>{errors.email.message}</Text>
      )}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Min. 8 characters"
            secureTextEntry
            returnKeyType="done"
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: { borderColor: "#e53e3e" },
  error: { color: "#e53e3e", fontSize: 12, marginTop: 4 },
  button: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
```

### Zod for Validation

Notice the Zod schema in the example above. Zod is the validation library I recommend because it does two things at once: it validates data *and* it infers TypeScript types from the schema. You define your form shape once, and you get runtime validation plus compile-time type safety for free:

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.coerce.number().min(13).max(120),
});

// This type is derived automatically — no duplication
type FormData = z.infer<typeof schema>;
// { email: string; password: string; age: number }
```

The `zodResolver` from `@hookform/resolvers` bridges Zod and React Hook Form. Install both:

```bash
npm install react-hook-form zod @hookform/resolvers
```

### What About Formik?

Formik was the standard for years and it still works. But React Hook Form is faster (fewer re-renders since it uses uncontrolled inputs under the hood where possible), has a smaller bundle, and the `Controller` API is cleaner than Formik's `<Field>` + `<ErrorMessage>` pattern. If you are starting a new project, use React Hook Form. If your existing codebase uses Formik, there is no urgent reason to migrate — it is slower but not broken.

```mermaid
graph LR
    A["Form Libraries Comparison"] --> B["React Hook Form"]
    A --> C["Formik"]
    A --> D["Raw useState"]

    B --> B1["Few re-renders"]
    B --> B2["Controller for RN"]
    B --> B3["Zod / Yup resolvers"]
    B --> B4["Recommended"]

    C --> C1["More re-renders"]
    C --> C2["Field + ErrorMessage"]
    C --> C3["Yup integration"]
    C --> C4["Fine if already using"]

    D --> D1["Full re-renders"]
    D --> D2["Manual validation"]
    D --> D3["Only for 1-2 fields"]

    style B4 fill:#48bb78,stroke:#333,color:#000
    style C4 fill:#ecc94b,stroke:#333,color:#000
    style D3 fill:#fc8181,stroke:#333,color:#000
```

> **Common mistake:** Do not build your own form state management with `useReducer` and a bunch of `useState` calls just to avoid a dependency. Form libraries handle dirty tracking, touched state, async validation, field arrays, and a dozen edge cases you will eventually need. The dependency is worth it.

---

## 3. Specialized Inputs

### Beyond TextInput

TextInput handles text. But mobile forms often need date pickers, dropdowns, sliders, OTP codes, and phone numbers. None of these exist in core React Native — you reach for community packages.

### Date and Time Pickers

The go-to package is `@react-native-community/datetimepicker`. It renders the native iOS and Android date/time picker dialogs:

```bash
npm install @react-native-community/datetimepicker
```

```tsx
import { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

function DateField() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker is a dialog — it closes automatically
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View>
      <Pressable onPress={() => setShow(true)}>
        <Text style={{ fontSize: 16, padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}>
          {date.toLocaleDateString()}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}
```

> **Platform difference:** On iOS, the picker is an inline spinner that stays visible. On Android, it is a modal dialog that disappears after selection. Your show/hide logic needs to account for this — on Android, always set `show` to `false` in `onChange`. On iOS, you may want a "Done" button to dismiss it.

### Picker / Select Dropdown

The web `<select>` element has no equivalent in core React Native. Use `@react-native-picker/picker`:

```bash
npm install @react-native-picker/picker
```

```tsx
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";

function CountryPicker() {
  const [country, setCountry] = useState("us");

  return (
    <Picker
      selectedValue={country}
      onValueChange={(value) => setCountry(value)}
    >
      <Picker.Item label="United States" value="us" />
      <Picker.Item label="Canada" value="ca" />
      <Picker.Item label="United Kingdom" value="uk" />
      <Picker.Item label="France" value="fr" />
    </Picker>
  );
}
```

On iOS this renders a spinning wheel; on Android it renders a dropdown menu. If you want a consistent cross-platform look, many teams build a custom modal picker with a FlatList instead. But for standard forms, the native picker is fine and accessible out of the box.

### OTP / Verification Code Input

OTP inputs — those 4-6 separate boxes for verification codes — are surprisingly tricky to build from scratch. You need to manage focus between boxes, handle paste from clipboard, and support the OS auto-fill for SMS codes. Use a library:

```bash
npm install react-native-otp-entry
```

```tsx
import { OtpInput } from "react-native-otp-entry";

function VerificationScreen() {
  const handleOtpFilled = (code: string) => {
    // Verify the code with your API
    console.log("OTP entered:", code);
  };

  return (
    <OtpInput
      numberOfDigits={6}
      onFilled={handleOtpFilled}
      autoFocus
      theme={{
        pinCodeContainerStyle: {
          borderWidth: 2,
          borderColor: "#ccc",
          borderRadius: 8,
          width: 48,
          height: 56,
        },
        focusedPinCodeContainerStyle: {
          borderColor: "#3b82f6",
        },
      }}
    />
  );
}
```

> **Tip:** Set `textContentType="oneTimeCode"` on a regular TextInput if you want iOS to suggest the SMS code from the notification banner without using a full OTP library. This works well enough for simple cases.

### Phone Number Input

Phone inputs need country code selection, formatting, and validation. The `react-native-phone-number-input` package handles this, but you can also pair a regular TextInput with a library like `libphonenumber-js` for validation:

```tsx
import { TextInput } from "react-native";
import { parsePhoneNumberFromString } from "libphonenumber-js";

function PhoneField() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validate = (text: string) => {
    setPhone(text);
    const parsed = parsePhoneNumberFromString(text, "US");
    if (parsed && parsed.isValid()) {
      setError("");
    } else if (text.length > 5) {
      setError("Enter a valid phone number");
    }
  };

  return (
    <>
      <TextInput
        value={phone}
        onChangeText={validate}
        keyboardType="phone-pad"
        placeholder="(555) 123-4567"
        textContentType="telephoneNumber"
        autoComplete="tel"
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
    </>
  );
}
```

### Putting It All Together

Here is a mental model for choosing the right input approach:

```mermaid
flowchart TD
    A["What input do you need?"] --> B{"Is it text-based?"}
    B -->|Yes| C["Use TextInput"]
    C --> C1["Configure with keyboardType,\nsecureTextEntry, multiline, etc."]

    B -->|No| D{"What type?"}
    D -->|Date / Time| E["@react-native-community/datetimepicker"]
    D -->|Dropdown / Select| F["@react-native-picker/picker\nor custom modal FlatList"]
    D -->|OTP Code| G["react-native-otp-entry\nor TextInput + oneTimeCode"]
    D -->|Slider| H["@react-native-community/slider"]
    D -->|Toggle| I["Built-in Switch component"]

    style C fill:#61dafb,stroke:#333,color:#000
    style I fill:#48bb78,stroke:#333,color:#000
```

The general rule: start with `TextInput` and its props. You will be surprised how far it takes you. Reach for community packages only when you need a genuinely different interaction model — date wheels, dropdown lists, sliders. And always wrap everything in React Hook Form with Zod validation. That stack — TextInput + community pickers + React Hook Form + Zod — handles every form you will build in production.