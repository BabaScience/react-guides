import React, { createContext, useContext } from 'react';

/**
 * MODULE 04: React Styling
 *
 * Each exercise illustrates a styling concept. The platform sandbox only
 * resolves `react` and `react-dom`, so we cover the fundamentals using
 * inline `style` props, plain `className` strings, and React Context for
 * theming. Higher-level tools (CSS Modules, styled-components, Tailwind)
 * are introduced in the lessons but not exercised at runtime.
 */

// ============================================
// EXERCISE 1: InlineStyled (Inline style prop)
// ============================================

/**
 * OBJECTIVE: Render a <div> whose text colour is driven by a prop.
 *
 * INSTRUCTIONS:
 * - Accept `color: string` and `children: React.ReactNode`.
 * - Render `<div style={{ color }}>{children}</div>`.
 * - Tests inspect the rendered element's `style.color`.
 */

interface InlineStyledProps {
  color: string;
  children: React.ReactNode;
}

export const InlineStyled: React.FC<InlineStyledProps> = ({ color, children }) => {
  // TODO: return <div style={{ color }}>{children}</div>
  void color; void children;
  return null;
};

// ============================================
// EXERCISE 2: Badge (Variant className)
// ============================================

/**
 * OBJECTIVE: A <span> whose className is derived from a `variant` prop.
 *
 * INSTRUCTIONS:
 * - Accept `variant: 'success' | 'warning' | 'danger'` and `children`.
 * - Render `<span className={`badge-${variant}`}>{children}</span>`.
 * - Tests check `span.className.includes('badge-success')` etc.
 */

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  // TODO: return <span className={`badge-${variant}`}>{children}</span>
  void variant; void children;
  return null;
};

// ============================================
// EXERCISE 3: PaddedBox (Dynamic inline style)
// ============================================

/**
 * OBJECTIVE: A box whose padding is driven by a numeric prop.
 *
 * INSTRUCTIONS:
 * - Accept `padding: number` and `children`.
 * - Render `<div style={{ padding: `${padding}px` }}>{children}</div>`.
 * - Tests inspect the inline `style.padding` string (e.g. `"24px"`).
 */

interface PaddedBoxProps {
  padding: number;
  children: React.ReactNode;
}

export const PaddedBox: React.FC<PaddedBoxProps> = ({ padding, children }) => {
  // TODO: return <div style={{ padding: `${padding}px` }}>{children}</div>
  void padding; void children;
  return null;
};

// ============================================
// EXERCISE 4: ThemedText (Theming via Context)
// ============================================

/**
 * OBJECTIVE: Consume a theme from React Context and apply it as inline style.
 *
 * INSTRUCTIONS:
 * - A `Theme` is `{ color: string; background: string }`.
 * - `ThemeContext` is exported with a default theme of black-on-white.
 * - `ThemeProvider` takes `theme` and `children` and wraps children in
 *   `<ThemeContext.Provider value={theme}>`.
 * - `ThemedText` reads the theme with `useContext(ThemeContext)` and
 *   renders `<p style={{ color, background }}>{children}</p>`.
 *
 * Tests render <ThemeProvider theme={{...}}><ThemedText>x</ThemedText></ThemeProvider>
 * and assert on the <p>'s inline style.
 */

export interface Theme {
  color: string;
  background: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<Theme>({ color: '#000', background: '#fff' });

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  // TODO: return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  void theme; void children;
  return null;
};

interface ThemedTextProps {
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ children }) => {
  // TODO: read theme from ThemeContext and return
  //   <p style={{ color: theme.color, background: theme.background }}>{children}</p>
  const theme = useContext(ThemeContext);
  void theme; void children;
  return null;
};

// ============================================
// EXERCISE 5: ResponsiveGrid (CSS Grid inline style)
// ============================================

/**
 * OBJECTIVE: A CSS-grid wrapper whose column count is driven by a prop.
 *
 * INSTRUCTIONS:
 * - Accept `columns: number` and `children`.
 * - Render a <div> with inline style:
 *     { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }
 * - Tests check `style.display === 'grid'` and that the `style` attribute
 *   contains the substring `repeat(N, 1fr)`.
 */

interface ResponsiveGridProps {
  columns: number;
  children: React.ReactNode;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ columns, children }) => {
  // TODO: return a <div> with display:'grid' and gridTemplateColumns:`repeat(${columns}, 1fr)`
  void columns; void children;
  return null;
};

// ============================================
// EXERCISE 6: Alert (Role + className)
// ============================================

/**
 * OBJECTIVE: An accessible alert whose styling and semantics come from props.
 *
 * INSTRUCTIONS:
 * - Accept `type: 'success' | 'error' | 'warning'` and `message: string`.
 * - Render `<div role="alert" className={`alert-${type}`}>{message}</div>`.
 * - Tests use `getByRole('alert')`, then check className + text content.
 */

interface AlertProps {
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  // TODO: return <div role="alert" className={`alert-${type}`}>{message}</div>
  void type; void message;
  return null;
};
