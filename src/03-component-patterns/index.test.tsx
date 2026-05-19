import { render, screen, fireEvent } from '@testing-library/react';
import {
  Card,
  ButtonVariant,
  SlotCard,
  withLogger,
  getRenderCount,
  resetRenderCount,
  Toggle,
  Tabs,
  Tab,
  TabPanel,
} from './index';

describe('Module 03: Component Patterns', () => {

  // ============================================
  // EXERCISE 1: Card
  // ============================================
  describe('Exercise 1: Card (composition)', () => {
    it('renders title in an h2', () => {
      render(<Card title="My Card"><span>body</span></Card>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('My Card');
    });

    it('renders children below the title', () => {
      render(<Card title="X"><span>hello world</span></Card>);
      expect(screen.getByText('hello world')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <Card title="X">
          <span>one</span>
          <span>two</span>
        </Card>
      );
      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 2: ButtonVariant
  // ============================================
  describe('Exercise 2: ButtonVariant (prop-driven styling)', () => {
    it('uses btn-primary className for primary variant', () => {
      render(<ButtonVariant variant="primary">Save</ButtonVariant>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('btn-primary');
    });

    it('uses btn-secondary className for secondary variant', () => {
      render(<ButtonVariant variant="secondary">Cancel</ButtonVariant>);
      expect(screen.getByRole('button').className).toContain('btn-secondary');
    });

    it('uses btn-danger className for danger variant', () => {
      render(<ButtonVariant variant="danger">Delete</ButtonVariant>);
      expect(screen.getByRole('button').className).toContain('btn-danger');
    });

    it('renders the label text', () => {
      render(<ButtonVariant variant="primary">Click me</ButtonVariant>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('fires onClick when clicked', () => {
      const fn = jest.fn();
      render(<ButtonVariant variant="primary" onClick={fn}>Go</ButtonVariant>);
      fireEvent.click(screen.getByRole('button'));
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // EXERCISE 3: SlotCard
  // ============================================
  describe('Exercise 3: SlotCard (named slots)', () => {
    it('renders header slot content', () => {
      render(<SlotCard header={<span>HEAD</span>} body={<span>B</span>} footer={<span>F</span>} />);
      expect(screen.getByText('HEAD')).toBeInTheDocument();
    });

    it('renders body slot content', () => {
      render(<SlotCard header={<span>H</span>} body={<span>BODYTEXT</span>} footer={<span>F</span>} />);
      expect(screen.getByText('BODYTEXT')).toBeInTheDocument();
    });

    it('renders footer slot content', () => {
      render(<SlotCard header={<span>H</span>} body={<span>B</span>} footer={<span>FOOT</span>} />);
      expect(screen.getByText('FOOT')).toBeInTheDocument();
    });

    it('tags slots with data-slot attribute', () => {
      const { container } = render(
        <SlotCard header={<span>H</span>} body={<span>B</span>} footer={<span>F</span>} />
      );
      expect(container.querySelector('[data-slot="header"]')).not.toBeNull();
      expect(container.querySelector('[data-slot="body"]')).not.toBeNull();
      expect(container.querySelector('[data-slot="footer"]')).not.toBeNull();
    });
  });

  // ============================================
  // EXERCISE 4: withLogger HOC
  // ============================================
  describe('Exercise 4: withLogger (HOC)', () => {
    beforeEach(() => {
      resetRenderCount();
    });

    it('renders the wrapped component output', () => {
      const Inner = ({ label }: { label: string }) => <p>{label}</p>;
      const Wrapped = withLogger(Inner);
      render(<Wrapped label="hello" />);
      expect(screen.getByText('hello')).toBeInTheDocument();
    });

    it('forwards all props to the wrapped component', () => {
      const Inner = ({ a, b }: { a: string; b: number }) => <p>{`${a}-${b}`}</p>;
      const Wrapped = withLogger(Inner);
      render(<Wrapped a="x" b={42} />);
      expect(screen.getByText('x-42')).toBeInTheDocument();
    });

    it('increments renderCount on each render', () => {
      const Inner = () => <p>x</p>;
      const Wrapped = withLogger(Inner);
      render(<Wrapped />);
      expect(getRenderCount()).toBeGreaterThan(0);
    });
  });

  // ============================================
  // EXERCISE 5: Toggle (render props)
  // ============================================
  describe('Exercise 5: Toggle (render props)', () => {
    it('starts in the off state', () => {
      render(
        <Toggle>{({ on }) => <span>state:{on ? 'on' : 'off'}</span>}</Toggle>
      );
      expect(screen.getByText('state:off')).toBeInTheDocument();
    });

    it('flips state when toggle is called', () => {
      render(
        <Toggle>
          {({ on, toggle }) => (
            <div>
              <span>state:{on ? 'on' : 'off'}</span>
              <button onClick={toggle}>flip</button>
            </div>
          )}
        </Toggle>
      );
      fireEvent.click(screen.getByText('flip'));
      expect(screen.getByText('state:on')).toBeInTheDocument();
    });

    it('toggles back and forth', () => {
      render(
        <Toggle>
          {({ on, toggle }) => (
            <div>
              <span>{on ? 'YES' : 'NO'}</span>
              <button onClick={toggle}>b</button>
            </div>
          )}
        </Toggle>
      );
      const btn = screen.getByText('b');
      fireEvent.click(btn);
      expect(screen.getByText('YES')).toBeInTheDocument();
      fireEvent.click(btn);
      expect(screen.getByText('NO')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 6: Tabs (compound components)
  // ============================================
  describe('Exercise 6: Tabs (compound)', () => {
    function Setup() {
      return (
        <Tabs defaultActive="a">
          <Tab id="a">Alpha</Tab>
          <Tab id="b">Beta</Tab>
          <TabPanel id="a"><p>panel-A</p></TabPanel>
          <TabPanel id="b"><p>panel-B</p></TabPanel>
        </Tabs>
      );
    }

    it('renders the default-active panel only', () => {
      render(<Setup />);
      expect(screen.getByText('panel-A')).toBeInTheDocument();
      expect(screen.queryByText('panel-B')).not.toBeInTheDocument();
    });

    it('marks the active tab button with an "active" className', () => {
      render(<Setup />);
      const alpha = screen.getByText('Alpha');
      expect(alpha.className).toContain('active');
    });

    it('switches panels when a tab is clicked', () => {
      render(<Setup />);
      fireEvent.click(screen.getByText('Beta'));
      expect(screen.getByText('panel-B')).toBeInTheDocument();
      expect(screen.queryByText('panel-A')).not.toBeInTheDocument();
    });

    it('moves the active className on click', () => {
      render(<Setup />);
      fireEvent.click(screen.getByText('Beta'));
      expect(screen.getByText('Beta').className).toContain('active');
      expect(screen.getByText('Alpha').className).not.toContain('active');
    });
  });
});
