import React, { useState, createContext, useContext } from 'react';

/**
 * MODULE 03: Component Patterns — reference solutions
 *
 * One way to solve each exercise, not the only way. Same `// EXERCISE N:`
 * layout as index.tsx so the platform splits this file with the same
 * extractor. Comments explain *why*.
 */

// ============================================
// EXERCISE 1: Card (Children Composition)
// ============================================

interface CardProps {
  title: string;
  children: React.ReactNode;
}

// `children` is the whole point: Card decides the frame, the caller decides
// the contents. Card never has to know what it is wrapping, which is what
// makes it reusable — and what makes composition an answer to prop drilling.
export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
};

// ============================================
// EXERCISE 2: Button Variants (Prop-Driven Styling)
// ============================================

interface ButtonVariantProps {
  variant: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
}

// One prop selects the class, so callers pick from a closed set of looks
// instead of passing raw styles. The union type is what makes that a closed
// set — `variant="danger "` with a typo stops compiling rather than silently
// rendering an unstyled button.
export const ButtonVariant: React.FC<ButtonVariantProps> = ({ variant, children, onClick }) => {
  return (
    <button type="button" className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

// ============================================
// EXERCISE 3: SlotCard (Named Slots Pattern)
// ============================================

interface SlotCardProps {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
}

// Named slots are composition with more than one hole. Where `children` gives
// the caller a single opening, slots let a layout place several pieces in
// positions it controls — the caller supplies content, never arrangement.
export const SlotCard: React.FC<SlotCardProps> = ({ header, body, footer }) => {
  return (
    <div className="slot-card">
      <div data-slot="header">{header}</div>
      <div data-slot="body">{body}</div>
      <div data-slot="footer">{footer}</div>
    </div>
  );
};

// ============================================
// EXERCISE 4: withLogger (Higher-Order Component)
// ============================================

let RENDER_COUNT = 0;
export const getRenderCount = (): number => RENDER_COUNT;
export const resetRenderCount = (): void => { RENDER_COUNT = 0; };

// A HOC is just a function from component to component. `{...props}` is the
// load-bearing part: forward everything, or the wrapper silently swallows the
// props the wrapped component needs.
//
// Counting during render is a side effect in render, which React does not
// promise to call exactly once — it is what this exercise asks for, but a real
// logger belongs in an effect. This is much of why custom hooks replaced HOCs.
export function withLogger<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return (props: P) => {
    RENDER_COUNT += 1;
    return <Component {...props} />;
  };
}

// ============================================
// EXERCISE 5: Toggle (Render-Props / Function Children)
// ============================================

interface ToggleProps {
  children: (api: { on: boolean; toggle: () => void }) => React.ReactNode;
}

// The component owns the state; the caller owns the markup. Toggle renders
// nothing of its own — it calls `children` with its state and hands back
// whatever comes out, so one Toggle can drive a checkbox, a switch or a
// button without knowing which.
export const Toggle: React.FC<ToggleProps> = ({ children }) => {
  const [on, setOn] = useState(false);
  const toggle = () => setOn((current) => !current);

  return <>{children({ on, toggle })}</>;
};

// ============================================
// EXERCISE 6: Tabs (Compound Components)
// ============================================

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultActive: string;
  children: React.ReactNode;
}

// The parent holds the shared state and passes it down through context rather
// than through props, which is what lets the caller arrange <Tab> and
// <TabPanel> freely — nested, reordered, wrapped in a layout — without ever
// wiring `active` between them.
export const Tabs: React.FC<TabsProps> = ({ defaultActive, children }) => {
  const [active, setActive] = useState(defaultActive);

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

interface TabProps {
  id: string;
  children: React.ReactNode;
}

// `useContext` returning null means this Tab was rendered outside <Tabs>.
// Throwing names the mistake at the point it happens, instead of failing later
// with "cannot read property of null".
export const Tab: React.FC<TabProps> = ({ id, children }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('<Tab> must be rendered inside <Tabs>');

  const isActive = ctx.active === id;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => ctx.setActive(id)}
    >
      {children}
    </button>
  );
};

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

// Returning null unmounts the inactive panel rather than hiding it. That keeps
// it out of the accessibility tree and out of `getByText`, and it means a
// hidden panel is not quietly running effects or holding stale state.
export const TabPanel: React.FC<TabPanelProps> = ({ id, children }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('<TabPanel> must be rendered inside <Tabs>');

  return ctx.active === id ? <div role="tabpanel">{children}</div> : null;
};
