import { render, screen, fireEvent } from '@testing-library/react';
import {
  ProfileCard,
  CounterButton,
  ContactList,
  ToggleCard
} from './index';

describe('Module RN-04: Core Components & APIs', () => {

  // ============================================
  // EXERCISE 1: Profile Card
  // ============================================

  describe('Exercise 1: ProfileCard', () => {
    const props = {
      name: 'Ada Lovelace',
      role: 'Engineer',
      avatarUrl: 'https://example.com/avatar.png',
    };

    it('should render the profile card container', () => {
      render(<ProfileCard {...props} />);
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    it('should display the name', () => {
      render(<ProfileCard {...props} />);
      const nameEl = screen.getByTestId('name');
      expect(nameEl).toBeInTheDocument();
      expect(nameEl).toHaveTextContent('Ada Lovelace');
    });

    it('should display the role', () => {
      render(<ProfileCard {...props} />);
      const roleEl = screen.getByTestId('role');
      expect(roleEl).toBeInTheDocument();
      expect(roleEl).toHaveTextContent('Engineer');
    });

    it('should render an image with the avatar URL', () => {
      render(<ProfileCard {...props} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  // ============================================
  // EXERCISE 2: Counter Button
  // ============================================

  describe('Exercise 2: CounterButton', () => {
    it('should display initial count of 0', () => {
      render(<CounterButton />);
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
    });

    it('should increment on pressing +', () => {
      render(<CounterButton />);
      fireEvent.click(screen.getByTestId('increment'));
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');
    });

    it('should decrement on pressing -', () => {
      render(<CounterButton />);
      fireEvent.click(screen.getByTestId('increment'));
      fireEvent.click(screen.getByTestId('increment'));
      fireEvent.click(screen.getByTestId('decrement'));
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');
    });

    it('should allow negative counts', () => {
      render(<CounterButton />);
      fireEvent.click(screen.getByTestId('decrement'));
      expect(screen.getByTestId('count')).toHaveTextContent('Count: -1');
    });
  });

  // ============================================
  // EXERCISE 3: Contact List
  // ============================================

  describe('Exercise 3: ContactList', () => {
    const contacts = [
      { id: '1', name: 'Alice', phone: '555-0001' },
      { id: '2', name: 'Bob', phone: '555-0002' },
      { id: '3', name: 'Charlie', phone: '555-0003' },
    ];

    it('should render the list', () => {
      render(<ContactList contacts={contacts} />);
      expect(screen.getByTestId('contact-list')).toBeInTheDocument();
    });

    it('should render all contacts', () => {
      render(<ContactList contacts={contacts} />);
      expect(screen.getByTestId('contact-1')).toBeInTheDocument();
      expect(screen.getByTestId('contact-2')).toBeInTheDocument();
      expect(screen.getByTestId('contact-3')).toBeInTheDocument();
    });

    it('should display contact names', () => {
      render(<ContactList contacts={contacts} />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should display phone numbers', () => {
      render(<ContactList contacts={contacts} />);
      expect(screen.getByText('555-0001')).toBeInTheDocument();
    });

    it('should show empty message when no contacts', () => {
      render(<ContactList contacts={[]} />);
      expect(screen.getByTestId('empty')).toHaveTextContent('No contacts');
    });
  });

  // ============================================
  // EXERCISE 4: Toggle Card
  // ============================================

  describe('Exercise 4: ToggleCard', () => {
    it('should render the header with title', () => {
      render(<ToggleCard title="FAQ" content="Some answer" />);
      expect(screen.getByTestId('toggle-header')).toBeInTheDocument();
      expect(screen.getByText('FAQ')).toBeInTheDocument();
    });

    it('should start collapsed (content hidden)', () => {
      render(<ToggleCard title="FAQ" content="Some answer" />);
      expect(screen.queryByTestId('toggle-content')).toBeNull();
    });

    it('should show content after pressing header', () => {
      render(<ToggleCard title="FAQ" content="Some answer" />);
      fireEvent.click(screen.getByTestId('toggle-header'));
      expect(screen.getByTestId('toggle-content')).toBeInTheDocument();
      expect(screen.getByText('Some answer')).toBeInTheDocument();
    });

    it('should hide content after pressing header again', () => {
      render(<ToggleCard title="FAQ" content="Some answer" />);
      fireEvent.click(screen.getByTestId('toggle-header'));
      fireEvent.click(screen.getByTestId('toggle-header'));
      expect(screen.queryByTestId('toggle-content')).toBeNull();
    });
  });
});
