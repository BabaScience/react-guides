import React, { createContext, useContext } from 'react';

/**
 * MODULE 04: React Styling — reference solutions
 *
 * One way to solve each exercise, not the only way. Same `// EXERCISE N:`
 * layout as index.tsx. Comments explain *why*.
 */

// ============================================
// EXERCISE 1: InlineStyled (Inline style prop)
// ============================================

interface InlineStyledProps {
  color: string;
  children: React.ReactNode;
}

// `style` takes a JavaScript object, not a CSS string, so the keys are
// camelCase. This is what inline styles are genuinely good at: a value
// computed at render time, which no stylesheet can express without a class
// per possible value.
export const InlineStyled: React.FC<InlineStyledProps> = ({ color, children }) => {
  return <div style={{ color }}>{children}</div>;
};

// ============================================
// EXERCISE 2: Badge (Variant className)
// ============================================

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

// The opposite trade to exercise 1: the look lives in a stylesheet, and the
// component only chooses which name to point at. That buys pseudo-classes,
// media queries and a single place to restyle every badge at once — none of
// which an inline style can do.
export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};

// ============================================
// EXERCISE 3: PaddedBox (Dynamic inline style)
// ============================================

interface PaddedBoxProps {
  padding: number;
  children: React.ReactNode;
}

// The unit is written explicitly rather than relying on React appending `px`
// to bare numbers. React does do that for length properties, but being
// explicit means the value reads the same whether it came from a number, a
// slider, or a stored preference.
export const PaddedBox: React.FC<PaddedBoxProps> = ({ padding, children }) => {
  return <div style={{ padding: `${padding}px` }}>{children}</div>;
};

// ============================================
// EXERCISE 4: ThemedText (Theming via Context)
// ============================================

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
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

interface ThemedTextProps {
  children: React.ReactNode;
}

// Theming is one place to change a colour and have every consumer follow.
// Context is the React-tree version of that idea; CSS custom properties are
// the stylesheet version, and do the same job without any JavaScript.
export const ThemedText: React.FC<ThemedTextProps> = ({ children }) => {
  const theme = useContext(ThemeContext);
  return <p style={{ color: theme.color, background: theme.background }}>{children}</p>;
};

// ============================================
// EXERCISE 5: ResponsiveGrid (CSS Grid inline style)
// ============================================

interface ResponsiveGridProps {
  columns: number;
  children: React.ReactNode;
}

// A column count that comes from a prop is exactly the case a stylesheet
// handles badly — you would need a class per count. Layout that depends on
// data belongs inline; layout that depends on the viewport belongs in a media
// query, which inline styles cannot express at all.
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ columns, children }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {children}
    </div>
  );
};

// ============================================
// EXERCISE 6: Alert (Role + className)
// ============================================

interface AlertProps {
  type: 'success' | 'error' | 'warning';
  message: string;
}

// `role="alert"` is the part that is not styling. Colour alone communicates
// nothing to a screen reader, and red-green is the most common colour-vision
// deficiency — the role makes the announcement, the class only makes it look
// the part.
export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  return (
    <div role="alert" className={`alert alert-${type}`}>
      {message}
    </div>
  );
};
