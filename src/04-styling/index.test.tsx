import { render, screen } from '@testing-library/react';
import {
  InlineStyled,
  Badge,
  PaddedBox,
  ThemedText,
  ThemeProvider,
  ResponsiveGrid,
  Alert,
} from './index';

describe('Module 04: React Styling', () => {

  // ============================================
  // EXERCISE 1: InlineStyled
  // ============================================
  describe('Exercise 1: InlineStyled (inline style prop)', () => {
    it('applies the color prop as inline color', () => {
      render(<InlineStyled color="red">hello</InlineStyled>);
      const el = screen.getByText('hello') as HTMLElement;
      expect(el.style.color).toBe('red');
    });

    it('renders the children text', () => {
      render(<InlineStyled color="blue">world</InlineStyled>);
      expect(screen.getByText('world')).toBeInTheDocument();
    });

    it('updates the color when the prop changes', () => {
      const { rerender } = render(<InlineStyled color="red">x</InlineStyled>);
      expect((screen.getByText('x') as HTMLElement).style.color).toBe('red');
      rerender(<InlineStyled color="green">x</InlineStyled>);
      expect((screen.getByText('x') as HTMLElement).style.color).toBe('green');
    });

    it('accepts arbitrary CSS color values', () => {
      render(<InlineStyled color="rgb(10, 20, 30)">y</InlineStyled>);
      const el = screen.getByText('y') as HTMLElement;
      expect(el.style.color).toBe('rgb(10, 20, 30)');
    });
  });

  // ============================================
  // EXERCISE 2: Badge
  // ============================================
  describe('Exercise 2: Badge (variant className)', () => {
    it('uses badge-success className for success variant', () => {
      render(<Badge variant="success">OK</Badge>);
      const el = screen.getByText('OK');
      expect(el.className).toContain('badge-success');
    });

    it('uses badge-warning className for warning variant', () => {
      render(<Badge variant="warning">Heads up</Badge>);
      expect(screen.getByText('Heads up').className).toContain('badge-warning');
    });

    it('uses badge-danger className for danger variant', () => {
      render(<Badge variant="danger">Boom</Badge>);
      expect(screen.getByText('Boom').className).toContain('badge-danger');
    });

    it('renders the children text', () => {
      render(<Badge variant="success">Approved</Badge>);
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 3: PaddedBox
  // ============================================
  describe('Exercise 3: PaddedBox (dynamic inline style)', () => {
    it('applies padding in pixels', () => {
      render(<PaddedBox padding={16}>boxed</PaddedBox>);
      const el = screen.getByText('boxed') as HTMLElement;
      expect(el.style.padding).toBe('16px');
    });

    it('accepts a different padding value', () => {
      render(<PaddedBox padding={24}>boxed</PaddedBox>);
      const el = screen.getByText('boxed') as HTMLElement;
      expect(el.style.padding).toBe('24px');
    });

    it('renders the children text', () => {
      render(<PaddedBox padding={8}>content</PaddedBox>);
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('handles zero padding', () => {
      render(<PaddedBox padding={0}>z</PaddedBox>);
      const el = screen.getByText('z') as HTMLElement;
      expect(el.style.padding).toBe('0px');
    });
  });

  // ============================================
  // EXERCISE 4: ThemedText
  // ============================================
  describe('Exercise 4: ThemedText (theming via context)', () => {
    it('applies the theme colour from the provider', () => {
      render(
        <ThemeProvider theme={{ color: 'red', background: 'blue' }}>
          <ThemedText>hello</ThemedText>
        </ThemeProvider>
      );
      const el = screen.getByText('hello') as HTMLElement;
      expect(el.style.color).toBe('red');
    });

    it('applies the theme background from the provider', () => {
      render(
        <ThemeProvider theme={{ color: 'red', background: 'blue' }}>
          <ThemedText>hello</ThemedText>
        </ThemeProvider>
      );
      const el = screen.getByText('hello') as HTMLElement;
      expect(el.style.background).toContain('blue');
    });

    it('renders the children text', () => {
      render(
        <ThemeProvider theme={{ color: 'black', background: 'white' }}>
          <ThemedText>label</ThemedText>
        </ThemeProvider>
      );
      expect(screen.getByText('label')).toBeInTheDocument();
    });

    it('reacts to a different theme value', () => {
      render(
        <ThemeProvider theme={{ color: 'green', background: 'yellow' }}>
          <ThemedText>tag</ThemedText>
        </ThemeProvider>
      );
      const el = screen.getByText('tag') as HTMLElement;
      expect(el.style.color).toBe('green');
      expect(el.style.background).toContain('yellow');
    });
  });

  // ============================================
  // EXERCISE 5: ResponsiveGrid
  // ============================================
  describe('Exercise 5: ResponsiveGrid (CSS grid inline style)', () => {
    it('sets display to grid', () => {
      render(
        <ResponsiveGrid columns={3}>
          <span>a</span>
          <span>b</span>
          <span>c</span>
        </ResponsiveGrid>
      );
      const el = screen.getByText('a').parentElement as HTMLElement;
      expect(el.style.display).toBe('grid');
    });

    it('uses repeat(N, 1fr) for the grid template columns', () => {
      render(
        <ResponsiveGrid columns={3}>
          <span>cell</span>
        </ResponsiveGrid>
      );
      const el = screen.getByText('cell').parentElement as HTMLElement;
      const styleAttr = el.getAttribute('style') ?? '';
      expect(styleAttr.includes('repeat(3, 1fr)')).toBe(true);
    });

    it('updates the column count when the prop changes', () => {
      const { rerender } = render(
        <ResponsiveGrid columns={2}>
          <span>cell</span>
        </ResponsiveGrid>
      );
      let el = screen.getByText('cell').parentElement as HTMLElement;
      expect(el.getAttribute('style') ?? '').toContain('repeat(2, 1fr)');
      rerender(
        <ResponsiveGrid columns={4}>
          <span>cell</span>
        </ResponsiveGrid>
      );
      el = screen.getByText('cell').parentElement as HTMLElement;
      expect(el.getAttribute('style') ?? '').toContain('repeat(4, 1fr)');
    });

    it('renders its children', () => {
      render(
        <ResponsiveGrid columns={2}>
          <span>one</span>
          <span>two</span>
        </ResponsiveGrid>
      );
      expect(screen.getByText('one')).toBeInTheDocument();
      expect(screen.getByText('two')).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 6: Alert
  // ============================================
  describe('Exercise 6: Alert (role + variant className)', () => {
    it('renders an element with role="alert"', () => {
      render(<Alert type="success" message="Saved!" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows the message text inside the alert', () => {
      render(<Alert type="success" message="Saved!" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Saved!');
    });

    it('uses alert-success className for success type', () => {
      render(<Alert type="success" message="ok" />);
      expect(screen.getByRole('alert').className).toContain('alert-success');
    });

    it('uses alert-error className for error type', () => {
      render(<Alert type="error" message="bad" />);
      expect(screen.getByRole('alert').className).toContain('alert-error');
    });

    it('uses alert-warning className for warning type', () => {
      render(<Alert type="warning" message="careful" />);
      expect(screen.getByRole('alert').className).toContain('alert-warning');
    });
  });
});
