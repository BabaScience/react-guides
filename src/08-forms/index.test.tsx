import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  validateEmail,
  validateMinLength,
  useField,
  LoginForm,
  MultiStepForm,
  FormErrors,
} from './index';

describe('Module 08: Forms & Validation', () => {

  // ============================================
  // EXERCISE 1: validateEmail
  // ============================================
  describe('Exercise 1: validateEmail', () => {
    it('returns true for a basic valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('returns true for emails with subdomain TLDs', () => {
      expect(validateEmail('a.b@c.co.uk')).toBe(true);
    });

    it('returns false when the @ is missing', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('returns false when the TLD is missing', () => {
      expect(validateEmail('user@example')).toBe(false);
    });

    it('returns false for whitespace inside the address', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('returns false for the empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  // ============================================
  // EXERCISE 2: validateMinLength
  // ============================================
  describe('Exercise 2: validateMinLength', () => {
    it('returns true when length is exactly min', () => {
      expect(validateMinLength('abcde', 5)).toBe(true);
    });

    it('returns true when length is greater than min', () => {
      expect(validateMinLength('abcdef', 5)).toBe(true);
    });

    it('returns false when length is less than min', () => {
      expect(validateMinLength('abc', 5)).toBe(false);
    });

    it('returns true for empty string when min is 0', () => {
      expect(validateMinLength('', 0)).toBe(true);
    });

    it('does NOT trim whitespace', () => {
      expect(validateMinLength('   ', 2)).toBe(true);
    });
  });

  // ============================================
  // EXERCISE 3: useField
  // ============================================
  describe('Exercise 3: useField (custom hook)', () => {
    it('starts with the initial value', () => {
      const { result } = renderHook(() => useField('hello', () => null));
      expect(result.current.value).toBe('hello');
    });

    it('updates value via the onChange handler', () => {
      const { result } = renderHook(() => useField('', () => null));
      act(() => {
        result.current.onChange({
          target: { value: 'typed' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.value).toBe('typed');
    });

    it('returns the validator result as `error`', () => {
      const validate = (v: string) => (v.length < 3 ? 'too short' : null);
      const { result } = renderHook(() => useField('hi', validate));
      expect(result.current.error).toBe('too short');
    });

    it('clears `error` when the value becomes valid', () => {
      const validate = (v: string) => (v.length < 3 ? 'too short' : null);
      const { result } = renderHook(() => useField('', validate));
      act(() => {
        result.current.onChange({
          target: { value: 'abcd' },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.error).toBeNull();
    });
  });

  // ============================================
  // EXERCISE 4: LoginForm
  // ============================================
  describe('Exercise 4: LoginForm', () => {
    it('shows validation errors when both fields are invalid', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(<LoginForm onSubmit={onSubmit} />);
      await user.click(screen.getByRole('button', { name: 'Log in' }));
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows an error when the email is invalid', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(<LoginForm onSubmit={onSubmit} />);
      await user.type(screen.getByLabelText('Email'), 'not-an-email');
      await user.type(screen.getByLabelText('Password'), 'longenough');
      await user.click(screen.getByRole('button', { name: 'Log in' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows an error when the password is too short', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(<LoginForm onSubmit={onSubmit} />);
      await user.type(screen.getByLabelText('Email'), 'user@example.com');
      await user.type(screen.getByLabelText('Password'), '123');
      await user.click(screen.getByRole('button', { name: 'Log in' }));
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with the field values when both are valid', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(<LoginForm onSubmit={onSubmit} />);
      await user.type(screen.getByLabelText('Email'), 'user@example.com');
      await user.type(screen.getByLabelText('Password'), 'secret123');
      await user.click(screen.getByRole('button', { name: 'Log in' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
      });
    });

    it('renders a form with role="form" and a "Log in" submit button', () => {
      render(<LoginForm onSubmit={() => {}} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 5: MultiStepForm
  // ============================================
  describe('Exercise 5: MultiStepForm', () => {
    it('starts on step 1', () => {
      render(<MultiStepForm />);
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });

    it('disables Back on step 1', () => {
      render(<MultiStepForm />);
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    });

    it('advances to step 2 when Next is clicked', () => {
      render(<MultiStepForm />);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    it('advances to step 3 and replaces Next with Submit', () => {
      render(<MultiStepForm />);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(screen.getByText('Step 3')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('goes back to a previous step when Back is clicked', () => {
      render(<MultiStepForm />);
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 6: FormErrors
  // ============================================
  describe('Exercise 6: FormErrors', () => {
    it('returns null when errors is empty', () => {
      const { container } = render(<FormErrors errors={{}} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders a ul with role="alert" when errors exist', () => {
      render(<FormErrors errors={{ email: 'Required' }} />);
      expect(screen.getByRole('alert').tagName).toBe('UL');
    });

    it('renders one <li> per error with the matching data-error-key', () => {
      const { container } = render(
        <FormErrors errors={{ email: 'Required', password: 'Too short' }} />,
      );
      const items = container.querySelectorAll('li');
      expect(items.length).toBe(2);
      expect(container.querySelector('[data-error-key="email"]')?.textContent).toBe(
        'Required',
      );
      expect(container.querySelector('[data-error-key="password"]')?.textContent).toBe(
        'Too short',
      );
    });
  });
});
