import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  match,
  parseQuery,
  Link,
  Route,
  useNavigate,
  ProtectedRoute,
} from './index';

describe('Module 05: Routing', () => {

  // ============================================
  // EXERCISE 1: match
  // ============================================
  describe('Exercise 1: match (pattern matching)', () => {
    it('extracts a single named parameter', () => {
      expect(match('/users/:id', '/users/42')).toEqual({ id: '42' });
    });

    it('extracts multiple named parameters', () => {
      expect(match('/a/:x/b/:y', '/a/1/b/2')).toEqual({ x: '1', y: '2' });
    });

    it('returns an empty object when the pattern is fully static and matches', () => {
      expect(match('/users', '/users')).toEqual({});
    });

    it('returns null when a static segment differs', () => {
      expect(match('/x', '/y')).toBeNull();
    });

    it('returns null when segment counts differ', () => {
      expect(match('/users/:id', '/users/42/extra')).toBeNull();
      expect(match('/users/:id', '/users')).toBeNull();
    });

    it('keeps parameter values as strings', () => {
      const result = match('/users/:id', '/users/42');
      expect(result).not.toBeNull();
      expect(typeof result!.id).toBe('string');
    });
  });

  // ============================================
  // EXERCISE 2: parseQuery
  // ============================================
  describe('Exercise 2: parseQuery (query string parsing)', () => {
    it('parses a string with a leading "?"', () => {
      expect(parseQuery('?a=1&b=2')).toEqual({ a: '1', b: '2' });
    });

    it('parses a string without a leading "?"', () => {
      expect(parseQuery('a=1')).toEqual({ a: '1' });
    });

    it('returns an empty object for an empty string', () => {
      expect(parseQuery('')).toEqual({});
    });

    it('keeps values as strings', () => {
      const result = parseQuery('count=42');
      expect(result.count).toBe('42');
    });

    it('handles multiple pairs without a leading "?"', () => {
      expect(parseQuery('a=1&b=2&c=3')).toEqual({ a: '1', b: '2', c: '3' });
    });
  });

  // ============================================
  // EXERCISE 3: Link
  // ============================================
  describe('Exercise 3: Link (client-side navigation)', () => {
    it('renders an anchor with the `to` value as href', () => {
      const navigate = jest.fn();
      render(<Link to="/about" navigate={navigate}>About</Link>);
      const a = screen.getByText('About').closest('a');
      expect(a).not.toBeNull();
      expect(a!.getAttribute('href')).toBe('/about');
    });

    it('renders the children inside the anchor', () => {
      const navigate = jest.fn();
      render(<Link to="/x" navigate={navigate}>Click me</Link>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls navigate(to) on click', () => {
      const navigate = jest.fn();
      render(<Link to="/about" navigate={navigate}>About</Link>);
      fireEvent.click(screen.getByText('About'));
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith('/about');
    });

    it('prevents the default browser navigation on click', () => {
      const navigate = jest.fn();
      render(<Link to="/about" navigate={navigate}>About</Link>);
      const anchor = screen.getByText('About').closest('a')!;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      anchor.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  // ============================================
  // EXERCISE 4: Route
  // ============================================
  describe('Exercise 4: Route (conditional path match)', () => {
    it('renders children when path === currentPath', () => {
      render(
        <Route path="/home" currentPath="/home">
          <p>HOME-CONTENT</p>
        </Route>
      );
      expect(screen.getByText('HOME-CONTENT')).toBeInTheDocument();
    });

    it('renders nothing when path does not match currentPath', () => {
      const { container } = render(
        <Route path="/home" currentPath="/about">
          <p>HOME-CONTENT</p>
        </Route>
      );
      expect(container.textContent).toBe('');
    });

    it('supports switching content based on currentPath', () => {
      const { rerender } = render(
        <Route path="/a" currentPath="/a">
          <p>A-VIEW</p>
        </Route>
      );
      expect(screen.getByText('A-VIEW')).toBeInTheDocument();
      rerender(
        <Route path="/a" currentPath="/b">
          <p>A-VIEW</p>
        </Route>
      );
      expect(screen.queryByText('A-VIEW')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 5: useNavigate
  // ============================================
  describe('Exercise 5: useNavigate (navigation hook)', () => {
    function Probe({ initial }: { initial: string }) {
      const [path, navigate] = useNavigate(initial);
      return (
        <div>
          <span data-testid="p">{path}</span>
          <button onClick={() => navigate('/x')}>go-x</button>
          <button onClick={() => navigate('/y')}>go-y</button>
        </div>
      );
    }

    it('returns the initial path on first render', () => {
      render(<Probe initial="/home" />);
      expect(screen.getByTestId('p')).toHaveTextContent('/home');
    });

    it('updates the path when navigate is called', () => {
      render(<Probe initial="/home" />);
      fireEvent.click(screen.getByText('go-x'));
      expect(screen.getByTestId('p')).toHaveTextContent('/x');
    });

    it('supports successive navigations', () => {
      render(<Probe initial="/home" />);
      fireEvent.click(screen.getByText('go-x'));
      fireEvent.click(screen.getByText('go-y'));
      expect(screen.getByTestId('p')).toHaveTextContent('/y');
    });
  });

  // ============================================
  // EXERCISE 6: ProtectedRoute
  // ============================================
  describe('Exercise 6: ProtectedRoute (auth gate)', () => {
    it('renders children when authenticated', () => {
      render(
        <ProtectedRoute isAuthenticated={true} fallback={<p>LOGIN</p>}>
          <p>DASHBOARD</p>
        </ProtectedRoute>
      );
      expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
      expect(screen.queryByText('LOGIN')).not.toBeInTheDocument();
    });

    it('renders fallback when not authenticated', () => {
      render(
        <ProtectedRoute isAuthenticated={false} fallback={<p>LOGIN</p>}>
          <p>DASHBOARD</p>
        </ProtectedRoute>
      );
      expect(screen.getByText('LOGIN')).toBeInTheDocument();
      expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument();
    });

    it('flips the rendered content when isAuthenticated changes', () => {
      const { rerender } = render(
        <ProtectedRoute isAuthenticated={false} fallback={<p>LOGIN</p>}>
          <p>DASHBOARD</p>
        </ProtectedRoute>
      );
      expect(screen.getByText('LOGIN')).toBeInTheDocument();
      rerender(
        <ProtectedRoute isAuthenticated={true} fallback={<p>LOGIN</p>}>
          <p>DASHBOARD</p>
        </ProtectedRoute>
      );
      expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    });
  });
});
