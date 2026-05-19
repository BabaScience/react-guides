import React, { useState, createContext, useContext } from 'react';

/**
 * MODULE 03: Component Patterns & Best Practices
 *
 * Each exercise illustrates a reusable composition pattern.
 */

// ============================================
// EXERCISE 1: Card (Children Composition)
// ============================================

/**
 * OBJECTIVE: Build a Card that wraps arbitrary children with a title.
 *
 * INSTRUCTIONS:
 * - Accept `title: string` and `children: React.ReactNode`.
 * - Render the title inside an <h2>, then render `{children}` below it.
 * - Both must live inside a single wrapper element (e.g. a <div>).
 */

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  // TODO: render <h2>{title}</h2> and {children} inside one wrapper.
  void title; void children;
  return null;
};

// ============================================
// EXERCISE 2: Button Variants (Prop-Driven Styling)
// ============================================

/**
 * OBJECTIVE: A Button that picks a className from its `variant` prop.
 *
 * INSTRUCTIONS:
 * - Accept `variant: 'primary' | 'secondary' | 'danger'`, `children`, and `onClick`.
 * - The rendered <button> must have a className equal to `btn-${variant}`.
 *   (Tests check `button.className.includes('btn-primary')` etc.)
 */

interface ButtonVariantProps {
  variant: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
}

export const ButtonVariant: React.FC<ButtonVariantProps> = ({ variant, children, onClick }) => {
  // TODO: render <button className={`btn-${variant}`} onClick={onClick}>{children}</button>
  void variant; void children; void onClick;
  return null;
};

// ============================================
// EXERCISE 3: SlotCard (Named Slots Pattern)
// ============================================

/**
 * OBJECTIVE: A Card with three named slots: header, body, footer.
 *
 * INSTRUCTIONS:
 * - Accept three React.ReactNode props: `header`, `body`, `footer`.
 * - Render three child elements with `data-slot="header" | "body" | "footer"`
 *   in that order, each holding the matching prop.
 */

interface SlotCardProps {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
}

export const SlotCard: React.FC<SlotCardProps> = ({ header, body, footer }) => {
  // TODO: three <div data-slot="..."> children in header/body/footer order
  void header; void body; void footer;
  return null;
};

// ============================================
// EXERCISE 4: withLogger (Higher-Order Component)
// ============================================

/**
 * OBJECTIVE: HOC that wraps a component and tracks render count.
 *
 * INSTRUCTIONS:
 * - `withLogger(Component)` returns a new component that:
 *   1. Increments `(withLogger as any).renderCount` on every render.
 *   2. Forwards all props to the wrapped Component.
 * - Use the provided RENDER_COUNT module-level variable below.
 *
 * NOTE: tests reset RENDER_COUNT to 0 via the exported `resetRenderCount`.
 */

let RENDER_COUNT = 0;
export const getRenderCount = (): number => RENDER_COUNT;
export const resetRenderCount = (): void => { RENDER_COUNT = 0; };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLogger<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  // TODO: return a functional component that:
  //   1. increments RENDER_COUNT on every call
  //   2. renders <Component {...props} />
  return (_props: P) => {
    void _props;
    return null;
  };
}

// ============================================
// EXERCISE 5: Toggle (Render-Props / Function Children)
// ============================================

/**
 * OBJECTIVE: A Toggle that exposes its state via a function child.
 *
 * INSTRUCTIONS:
 * - Manage a boolean `on` with useState (default false).
 * - Accept `children: (api: { on: boolean; toggle: () => void }) => React.ReactNode`.
 * - Call children with the current state + a toggle function and render the result.
 */

interface ToggleProps {
  children: (api: { on: boolean; toggle: () => void }) => React.ReactNode;
}

export const Toggle: React.FC<ToggleProps> = ({ children }) => {
  // TODO: useState for `on`; return children({ on, toggle })
  void children;
  return null;
};

// ============================================
// EXERCISE 6: Tabs (Compound Components)
// ============================================

/**
 * OBJECTIVE: A Tabs parent with Tab + TabPanel children sharing state via context.
 *
 * INSTRUCTIONS:
 * - Tabs manages the active tab id with useState (initial = `defaultActive`).
 * - It exposes { active, setActive } via TabsContext.
 * - Tab renders a <button> whose className contains "active" when its id matches.
 *   Clicking it calls setActive(id).
 * - TabPanel renders its children ONLY when its id matches the active tab.
 *
 * Tests query buttons by text and check rendered panel contents.
 */

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

export const Tabs: React.FC<TabsProps> = ({ defaultActive, children }) => {
  // TODO: useState for `active`; wrap children in <TabsContext.Provider value={{ active, setActive }}>
  void defaultActive; void children;
  return null;
};

interface TabProps {
  id: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ id, children }) => {
  // TODO: read context, render a <button> with className that contains "active"
  // when `active === id`, onClick={() => setActive(id)}.
  const ctx = useContext(TabsContext);
  void ctx; void id; void children;
  return null;
};

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, children }) => {
  // TODO: read context, render `{children}` only when `active === id`, else null.
  const ctx = useContext(TabsContext);
  void ctx; void id; void children;
  return null;
};
