import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserProfile from '@/components/organisms/UserProfile';
import { UserProfile as UserProfileType } from '@/types/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick, className, ...props }: any) {
    return <a href={href} onClick={onClick} className={className} {...props}>{children}</a>;
  };
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Avatar component
jest.mock('@/shared/Avatar', () => {
  return function MockAvatar({ sizeClass, imgUrl, userName, containerClassName }: any) {
    return (
      <div 
        data-testid="avatar" 
        className={`${sizeClass} ${containerClassName}`}
        data-img-url={imgUrl}
        data-user-name={userName}
      >
        {userName}
      </div>
    );
  };
});

// Mock ThemeToggler component
jest.mock('@/components/atoms/ThemeToggler', () => {
  return function MockThemeToggler() {
    return <div data-testid="theme-toggler">Theme Toggler</div>;
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('UserProfile Component', () => {
  const defaultProps = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      avatar: '/test-avatar.jpg',
    } as UserProfileType,
    isCollapsed: false,
    onLogout: jest.fn(),
  };

  const mockSession = {
    user: {
      name: 'Session User',
      email: 'session@example.com',
      image: 'https://example.com/session-avatar.jpg',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('renders user profile container', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('applies collapsed styles when collapsed', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} isCollapsed={true} />);
      
      const container = screen.getByTestId('avatar').closest('.p-3');
      expect(container).toHaveClass('flex', 'justify-center');
    });

    it('applies expanded styles when not collapsed', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} isCollapsed={false} />);
      
      const container = screen.getByTestId('avatar').closest('.p-3');
      expect(container).not.toHaveClass('flex', 'justify-center');
    });
  });

  describe('Session Handling', () => {
    it('uses session data when available', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Session User')).toBeInTheDocument();
      expect(screen.getByText('session@example.com')).toBeInTheDocument();
    });

    it('uses fallback data when session is not available', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles session with missing user data', () => {
      mockUseSession.mockReturnValue({ 
        data: { user: null }, 
        status: 'authenticated' 
      });
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('handles session with partial user data', () => {
      mockUseSession.mockReturnValue({ 
        data: { 
          user: { 
            name: 'Partial User',
            email: null,
            image: null 
          } 
        }, 
        status: 'authenticated' 
      });
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Partial User')).toBeInTheDocument();
    });
  });

  describe('Avatar Rendering', () => {
    it('uses session image when available', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-img-url', 'https://example.com/session-avatar.jpg');
    });

    it('constructs image URL with NEXT_PUBLIC_IMAGE_URL when session image is relative', () => {
      const originalEnv = process.env.NEXT_PUBLIC_IMAGE_URL;
      process.env.NEXT_PUBLIC_IMAGE_URL = 'https://cdn.example.com';
      
      mockUseSession.mockReturnValue({ 
        data: { 
          user: { 
            name: 'Test User',
            email: 'test@example.com',
            image: 'relative-avatar.jpg' 
          } 
        }, 
        status: 'authenticated' 
      });
      
      render(<UserProfile {...defaultProps} />);
      
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-img-url', 'https://cdn.example.com/relative-avatar.jpg');
      
      process.env.NEXT_PUBLIC_IMAGE_URL = originalEnv;
    });

    it('uses default avatar when no session image', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-img-url', '/images/dashboard/profile-avatar.png');
    });

    it('applies correct avatar classes', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('w-10', 'h-10', 'ring-1', 'ring-white/20');
    });
  });

  describe('User Information Display', () => {
    it('shows user name and email when not collapsed', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} isCollapsed={false} />);
      
      expect(screen.getByText('Session User')).toBeInTheDocument();
      expect(screen.getByText('session@example.com')).toBeInTheDocument();
    });

    it('hides user name and email when collapsed', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} isCollapsed={true} />);
      
      expect(screen.queryByText('Session User')).not.toBeInTheDocument();
      expect(screen.queryByText('session@example.com')).not.toBeInTheDocument();
    });

    it('shows "Account" when no user name available', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      expect(screen.getByText('Account')).toBeInTheDocument();
    });
  });

  describe('Popover Functionality', () => {
    it('opens popover when clicked', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument();
      });
    });

    it('shows user details in popover', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Session User')).toBeInTheDocument();
        expect(screen.getByText('session@example.com')).toBeInTheDocument();
      });
    });

    it('shows navigation links in popover', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument();
        expect(screen.getByText('My bookings')).toBeInTheDocument();
        expect(screen.getByText('Wishlist')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
      });
    });

    it('shows theme toggler in popover', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Dark theme')).toBeInTheDocument();
        expect(screen.getByTestId('theme-toggler')).toBeInTheDocument();
      });
    });

    it('closes popover when navigation link is clicked', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument();
      });
      
      const accountLink = screen.getByText('My Account').closest('a');
      fireEvent.click(accountLink!);
      
      await waitFor(() => {
        expect(screen.queryByText('My Account')).not.toBeInTheDocument();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('shows logout button in popover', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Log out')).toBeInTheDocument();
      });
    });

    it('calls signOut when logout button is clicked', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Log out');
        fireEvent.click(logoutButton);
        
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onLogout prop when provided', async () => {
      const mockOnLogout = jest.fn();
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} onLogout={mockOnLogout} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Log out');
        fireEvent.click(logoutButton);
        
        expect(mockOnLogout).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Unauthenticated State', () => {
    it('shows sign in and sign up links when not authenticated', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
      });
    });

    it('navigates to sign in page', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const signInLink = screen.getByText('Sign In');
        expect(signInLink.closest('a')).toHaveAttribute('href', '/auth/signin');
      });
    });

    it('navigates to sign up page', async () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const signUpLink = screen.getByText('Sign Up');
        expect(signUpLink.closest('a')).toHaveAttribute('href', '/auth/signup');
      });
    });
  });

  describe('Popover Positioning', () => {
    it('positions popover correctly when collapsed', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} isCollapsed={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const popover = screen.getByText('My Account').closest('.absolute.bottom-full');
        expect(popover).toHaveClass('left-1/2', '-translate-x-1/2');
      });
    });

    it('positions popover correctly when expanded', async () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...defaultProps} isCollapsed={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const popover = screen.getByText('My Account').closest('.absolute.bottom-full');
        expect(popover).toHaveClass('left-3', 'right-3');
      });
    });
  });

  describe('Key Prop Changes', () => {
    it('resets popover when collapse state changes', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      const { rerender } = render(<UserProfile {...defaultProps} isCollapsed={false} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Change collapse state
      rerender(<UserProfile {...defaultProps} isCollapsed={true} />);
      
      // Popover should be closed
      expect(screen.queryByText('My Account')).not.toBeInTheDocument();
    });

    it('resets popover when pathname changes', () => {
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      const { rerender } = render(<UserProfile {...defaultProps} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Change pathname
      mockUsePathname.mockReturnValue('/settings');
      rerender(<UserProfile {...defaultProps} />);
      
      // Popover should be closed
      expect(screen.queryByText('My Account')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onLogout prop gracefully', () => {
      const { onLogout, ...propsWithoutLogout } = defaultProps;
      mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' });
      render(<UserProfile {...propsWithoutLogout} />);
      
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('handles empty user prop gracefully', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} user={{} as UserProfileType} />);
      
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('handles undefined user prop gracefully', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
      render(<UserProfile {...defaultProps} user={undefined as any} />);
      
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });
  });
});
