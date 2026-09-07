import React, { useState } from 'react';

/**
 * MODULE 08: Forms & Validation — reference solutions
 *
 * No React Hook Form, Yup or Zod in the sandbox, so every exercise hand-rolls
 * the logic those libraries provide. Doing it once is the clearest argument
 * for reaching for one later.
 */

// ============================================
// EXERCISE 1: validateEmail (Pure Function)
// ============================================

// A deliberately loose regex: something, an @, something, a dot, something.
// Chasing full RFC 5322 compliance in a regex is a well-known dead end, and a
// stricter pattern mostly rejects addresses that are actually valid. The only
// way to truly validate an email is to send one.
export const validateEmail = (s: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

// ============================================
// EXERCISE 2: validateMinLength (Pure Function)
// ============================================

// No trimming, on purpose. Whether leading whitespace counts is a decision for
// the caller — a password may legitimately contain spaces, a display name
// probably should not. A validator that silently trims takes that decision
// away from everyone who uses it.
export const validateMinLength = (s: string, min: number): boolean => {
  return s.length >= min;
};

// ============================================
// EXERCISE 3: useField (Custom Hook)
// ============================================

export interface UseFieldApi {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  error: string | null;
}

// `error` is derived during render rather than stored in state. It is a
// function of the current value, so keeping it in state would mean two things
// to hold in step — and they would eventually disagree, showing an error for a
// value the user already fixed.
//
// Returning an object whose shape matches what an input wants means a consumer
// writes `<input value={f.value} onChange={f.onChange} />` and nothing else.
export const useField = (
  initial: string,
  validate: (v: string) => string | null,
): UseFieldApi => {
  const [value, setValue] = useState(initial);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  return { value, onChange, error: validate(value) };
};

// ============================================
// EXERCISE 4: LoginForm
// ============================================

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

// Three things here are the actual lesson:
//
//   - `e.preventDefault()` stops the browser's own submission, which would
//     reload the page and discard the whole app.
//   - Errors are collected into a list and rendered together, so a user sees
//     everything wrong at once instead of fixing one problem per attempt.
//   - `<label htmlFor>` paired with `<input id>` is what makes each field
//     findable by its visible name — by a screen reader, by a click on the
//     label, and by `getByLabelText`. All three are the same mechanism.
//
// Validating on submit rather than on every keystroke avoids telling someone
// their email is invalid while they are still typing the first character.
export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const found: string[] = [];
    if (!validateEmail(email)) found.push('Invalid email');
    if (!validateMinLength(password, 6)) found.push('Password too short');

    if (found.length > 0) {
      setErrors(found);
      return;
    }

    setErrors([]);
    onSubmit({ email, password });
  };

  return (
    <form role="form" onSubmit={handleSubmit}>
      <label htmlFor="login-email">Email</label>
      <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Log in</button>

      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </form>
  );
};

// ============================================
// EXERCISE 5: MultiStepForm
// ============================================

// The step lives in the wizard, not in the steps. A step component mounts and
// unmounts as the user moves, and unmounting destroys its state — so anything
// stored per step is gone the moment you leave it. The component whose
// lifetime spans the whole flow is the one that must own the progress.
//
// `Math.min` / `Math.max` clamp instead of trusting the buttons: disabling
// "Back" on step 1 is a UI courtesy, not a guarantee about what can be called.
export const MultiStepForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const next = () => setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3);
  const back = () => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3);

  return (
    <div>
      <h2>Step {step}</h2>

      <button type="button" onClick={back} disabled={step === 1}>
        Back
      </button>

      {step < 3 ? (
        <button type="button" onClick={next}>
          Next
        </button>
      ) : (
        <button type="submit">Submit</button>
      )}
    </div>
  );
};

// ============================================
// EXERCISE 6: FormErrors
// ============================================

interface FormErrorsProps {
  errors: Record<string, string>;
}

// Returning null for an empty object rather than an empty `<ul>`: an alert
// region containing nothing is still an alert region, and some screen readers
// announce it. Render nothing when there is nothing to say.
//
// `role="alert"` is what makes the summary heard rather than merely seen —
// errors shown only in red are invisible to a screen reader and hard to see
// for the most common colour-vision deficiency.
export const FormErrors: React.FC<FormErrorsProps> = ({ errors }) => {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <ul role="alert">
      {entries.map(([key, message]) => (
        <li key={key} data-error-key={key}>
          {message}
        </li>
      ))}
    </ul>
  );
};
