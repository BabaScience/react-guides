import React, { useState } from 'react';

/**
 * MODULE 08: Forms & Validation
 *
 * Sandbox runtime only ships `react` and `react-dom` — no React Hook Form,
 * Yup, or Zod. Every exercise hand-rolls the form/validation logic so the
 * underlying patterns stay visible.
 */

// ============================================
// EXERCISE 1: validateEmail (Pure Function)
// ============================================

/**
 * OBJECTIVE: A pure email validator.
 *
 * INSTRUCTIONS:
 * - Return `true` if `s` matches the regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`,
 *   i.e. "non-space-or-@ chars" + "@" + "non-space-or-@ chars" + "." +
 *   "non-space-or-@ chars".
 * - Return `false` otherwise.
 * - Pure: no side effects, no trimming, no I/O.
 */

export const validateEmail = (s: string): boolean => {
  // TODO: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  void s;
  return false;
};

// ============================================
// EXERCISE 2: validateMinLength (Pure Function)
// ============================================

/**
 * OBJECTIVE: A pure minimum-length validator.
 *
 * INSTRUCTIONS:
 * - Return `true` iff `s.length >= min`.
 * - Do NOT trim — callers decide whether whitespace counts.
 */

export const validateMinLength = (s: string, min: number): boolean => {
  // TODO: return s.length >= min;
  void s; void min;
  return false;
};

// ============================================
// EXERCISE 3: useField (Custom Hook)
// ============================================

/**
 * OBJECTIVE: A reusable controlled-field hook.
 *
 * INSTRUCTIONS:
 * - Take an `initial` string and a `validate` function `(v: string) => string | null`.
 * - Manage the field value with `useState(initial)`.
 * - Expose `{ value, onChange, error }` where:
 *     - `value` is the current string,
 *     - `onChange` is a `React.ChangeEventHandler<HTMLInputElement>` that
 *       updates the value from `e.target.value`,
 *     - `error` is the result of `validate(value)` (string or null).
 * - Consumers should be able to write `<input value={f.value} onChange={f.onChange} />`.
 */

export interface UseFieldApi {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error: string | null;
}

export const useField = (
  initial: string,
  validate: (v: string) => string | null,
): UseFieldApi => {
  // TODO:
  //   const [value, setValue] = useState(initial);
  //   const onChange: React.ChangeEventHandler<HTMLInputElement> =
  //     (e) => setValue(e.target.value);
  //   return { value, onChange, error: validate(value) };
  void initial; void validate;
  return { value: '', onChange: () => {}, error: null };
};

// ============================================
// EXERCISE 4: LoginForm
// ============================================

/**
 * OBJECTIVE: A controlled login form with inline validation.
 *
 * INSTRUCTIONS:
 * - Props: `onSubmit: (data: { email: string; password: string }) => void`.
 * - Render a `<form role="form">` with two `<label htmlFor>` + `<input id>`
 *   pairs — labels MUST read "Email" and "Password" so tests can use
 *   `getByLabelText('Email')` / `getByLabelText('Password')`.
 * - Render a submit `<button>` whose text is "Log in".
 * - On submit:
 *     - call `e.preventDefault()`,
 *     - validate: email via `validateEmail`, password via
 *       `validateMinLength(password, 6)`,
 *     - if EITHER fails, render the errors in a `<ul role="alert">` with one
 *       `<li>` per error (e.g. "Invalid email" / "Password too short"),
 *     - if BOTH pass, call `onSubmit({ email, password })`.
 *
 * HINT: reuse `validateEmail` and `validateMinLength` from above.
 */

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  // TODO:
  //   - useState for email, password, errors (string[]).
  //   - handleSubmit: preventDefault, build error list, either setErrors or call onSubmit.
  //   - render <form role="form"> with two labeled inputs and a "Log in" submit button.
  //   - when errors.length > 0, render <ul role="alert">{errors.map(...)}</ul>
  void onSubmit;
  void useState;
  return null;
};

// ============================================
// EXERCISE 5: MultiStepForm
// ============================================

/**
 * OBJECTIVE: A 3-step wizard with Back / Next / Submit navigation.
 *
 * INSTRUCTIONS:
 * - Track the current step with `useState<1 | 2 | 3>(1)`.
 * - Render `<h2>Step {n}</h2>` for the active step (text MUST be exactly
 *   "Step 1", "Step 2", "Step 3" so tests can `getByText('Step 1')`).
 * - Render a "Back" button — disabled when step === 1.
 * - On steps 1 and 2 render a "Next" button that advances the step.
 * - On step 3, hide "Next" and instead render a "Submit" button.
 */

export const MultiStepForm: React.FC = () => {
  // TODO:
  //   - useState<1 | 2 | 3>(1) for current step.
  //   - render <h2>Step {step}</h2>
  //   - <button disabled={step === 1} onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>Back</button>
  //   - if (step < 3) -> <button onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}>Next</button>
  //   - else -> <button>Submit</button>
  return null;
};

// ============================================
// EXERCISE 6: FormErrors
// ============================================

/**
 * OBJECTIVE: A reusable error-summary component.
 *
 * INSTRUCTIONS:
 * - Props: `errors: Record<string, string>`.
 * - If `Object.keys(errors).length === 0`, return `null`.
 * - Otherwise render a `<ul role="alert">` containing one
 *   `<li data-error-key="{key}">{message}</li>` per entry.
 */

interface FormErrorsProps {
  errors: Record<string, string>;
}

export const FormErrors: React.FC<FormErrorsProps> = ({ errors }) => {
  // TODO:
  //   const entries = Object.entries(errors);
  //   if (entries.length === 0) return null;
  //   return (
  //     <ul role="alert">
  //       {entries.map(([key, message]) => (
  //         <li key={key} data-error-key={key}>{message}</li>
  //       ))}
  //     </ul>
  //   );
  void errors;
  return null;
};
