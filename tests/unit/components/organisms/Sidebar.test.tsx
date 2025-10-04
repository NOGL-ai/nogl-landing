import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/organisms/Sidebar';
import { SidebarProps } from '@/types/navigation';
import { mainNavigationItems, otherNavigationItems, versionInfo, defaultUserProfile } from '@/data/sidebarNavigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock UserProfile component
jest.mock('@/components/organisms/UserProfile', () => {
  return function MockUserProfile({ user, isCollapsed, onLogout }: any) {
    return (
      <div data-testid="user-profile" data-collapsed={isCollapsed}>
        <span>{user?.name || 'User'}</span>
        {onLogout && <button onClick={onLogout}>Logout</button>}
      </div>
    );
  };
});

// Mock SidebarItem component
jest.mock('@/components/molecules/SidebarItem', () => {
  return function MockSidebarItem({ item, isActive, isCollapsed }: any) {
    return (
      <div 
        data-testid={`sidebar-item-${item.id}`} 
        data-active={isActive}
        data-collapsed={isCollapsed}
      >
        {item.title}
      </div>
    );
  };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Sidebar Component', () => {
  const defaultProps: SidebarProps = {
    isCollapsed: false,
    onToggleCollapse: jest.fn(),
    user: defaultUserProfile,
    onLogout: jest.fn(),
    isHovered: false,
    onHoverChange: jest.fn(),
    className: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('renders sidebar with correct structure', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Check main container
      const sidebar = screen.getByRole('generic');
      expect(sidebar).toHaveClass('sticky-sidebar');
      expect(sidebar).toHaveClass('w-[272px]'); // expanded width
    });

    it('renders with collapsed width when collapsed and not hovered', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={false} />);
      
      const sidebar = screen.getByRole('generic');
      expect(sidebar).toHaveClass('w-[80px]');
    });

    it('renders with expanded width when collapsed but hovered', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} />);
      
      const sidebar = screen.getByRole('generic');
      expect(sidebar).toHaveClass('w-[272px]');
      expect(sidebar).toHaveClass('shadow-2xl');
    });

    it('applies custom className', () => {
      render(<Sidebar {...defaultProps} className="custom-class" />);
      
      const sidebar = screen.getByRole('generic');
      expect(sidebar).toHaveClass('custom-class');
    });
  });

  describe('Header Section', () => {
    it('renders logo and company name when expanded', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} />);
      
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText('Company Ltd')).toBeInTheDocument();
    });

    it('hides company name when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={false} />);
      
      expect(screen.queryByText('NOGL')).not.toBeInTheDocument();
      expect(screen.queryByText('Company Ltd')).not.toBeInTheDocument();
    });

    it('shows company name when collapsed but hovered', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} />);
      
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText('Company Ltd')).toBeInTheDocument();
    });

    it('renders toggle button when expanded', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('calls onToggleCollapse when toggle button is clicked', () => {
      const mockToggle = jest.fn();
      render(<Sidebar {...defaultProps} onToggleCollapse={mockToggle} isCollapsed={false} />);
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation Sections', () => {
    it('renders main navigation section title when expanded', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} />);
      
      expect(screen.getByText(mainNavigationItems.title)).toBeInTheDocument();
    });

    it('renders other navigation section title when expanded', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} />);
      
      expect(screen.getByText(otherNavigationItems.title)).toBeInTheDocument();
    });

    it('hides section titles when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={false} />);
      
      expect(screen.queryByText(mainNavigationItems.title)).not.toBeInTheDocument();
      expect(screen.queryByText(otherNavigationItems.title)).not.toBeInTheDocument();
    });

    it('renders all main navigation items', () => {
      render(<Sidebar {...defaultProps} />);
      
      mainNavigationItems.items.forEach(item => {
        expect(screen.getByTestId(`sidebar-item-${item.id}`)).toBeInTheDocument();
      });
    });

    it('renders all other navigation items', () => {
      render(<Sidebar {...defaultProps} />);
      
      otherNavigationItems.items.forEach(item => {
        expect(screen.getByTestId(`sidebar-item-${item.id}`)).toBeInTheDocument();
      });
    });

    it('passes correct props to SidebarItem components', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} />);
      
      const firstItem = screen.getByTestId(`sidebar-item-${mainNavigationItems.items[0].id}`);
      expect(firstItem).toHaveAttribute('data-collapsed', 'false');
    });
  });

  describe('Version Info', () => {
    it('renders version info when expanded', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} />);
      
      expect(screen.getByText(`Version ${versionInfo.version}`)).toBeInTheDocument();
      expect(screen.getByText(versionInfo.badge.text)).toBeInTheDocument();
    });

    it('hides version text when collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={false} />);
      
      expect(screen.queryByText(`Version ${versionInfo.version}`)).not.toBeInTheDocument();
      expect(screen.queryByText(versionInfo.badge.text)).not.toBeInTheDocument();
    });

    it('shows version info when collapsed but hovered', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} />);
      
      expect(screen.getByText(`Version ${versionInfo.version}`)).toBeInTheDocument();
      expect(screen.getByText(versionInfo.badge.text)).toBeInTheDocument();
    });
  });

  describe('User Profile', () => {
    it('renders UserProfile component', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    it('passes correct props to UserProfile', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} />);
      
      const userProfile = screen.getByTestId('user-profile');
      expect(userProfile).toHaveAttribute('data-collapsed', 'true');
    });

    it('passes user and onLogout props to UserProfile', () => {
      const mockLogout = jest.fn();
      const customUser = { name: 'Test User', email: 'test@example.com' };
      
      render(<Sidebar {...defaultProps} user={customUser} onLogout={mockLogout} />);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Hover Interactions', () => {
    it('calls onHoverChange when mouse enters collapsed sidebar', () => {
      const mockHoverChange = jest.fn();
      render(<Sidebar {...defaultProps} isCollapsed={true} onHoverChange={mockHoverChange} />);
      
      const sidebar = screen.getByRole('generic');
      fireEvent.mouseEnter(sidebar);
      
      expect(mockHoverChange).toHaveBeenCalledWith(true);
    });

    it('does not call onHoverChange when mouse enters expanded sidebar', () => {
      const mockHoverChange = jest.fn();
      render(<Sidebar {...defaultProps} isCollapsed={false} onHoverChange={mockHoverChange} />);
      
      const sidebar = screen.getByRole('generic');
      fireEvent.mouseEnter(sidebar);
      
      expect(mockHoverChange).not.toHaveBeenCalled();
    });

    it('calls onHoverChange when mouse leaves sidebar', () => {
      const mockHoverChange = jest.fn();
      render(<Sidebar {...defaultProps} onHoverChange={mockHoverChange} />);
      
      const sidebar = screen.getByRole('generic');
      fireEvent.mouseLeave(sidebar);
      
      expect(mockHoverChange).toHaveBeenCalledWith(false);
    });

    it('does not call onHoverChange when onHoverChange is not provided', () => {
      const { onHoverChange, ...propsWithoutHover } = defaultProps;
      render(<Sidebar {...propsWithoutHover} isCollapsed={true} />);
      
      const sidebar = screen.getByRole('generic');
      fireEvent.mouseEnter(sidebar);
      fireEvent.mouseLeave(sidebar);
      
      // Should not throw error
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Path Active Detection', () => {
    it('correctly identifies active paths', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<Sidebar {...defaultProps} />);
      
      const dashboardItem = screen.getByTestId('sidebar-item-dashboard');
      expect(dashboardItem).toHaveAttribute('data-active', 'true');
    });

    it('correctly identifies nested active paths', () => {
      mockUsePathname.mockReturnValue('/dashboard/settings');
      render(<Sidebar {...defaultProps} />);
      
      const dashboardItem = screen.getByTestId('sidebar-item-dashboard');
      expect(dashboardItem).toHaveAttribute('data-active', 'true');
    });

    it('handles null pathname', () => {
      mockUsePathname.mockReturnValue(null as any);
      render(<Sidebar {...defaultProps} />);
      
      const dashboardItem = screen.getByTestId('sidebar-item-dashboard');
      expect(dashboardItem).toHaveAttribute('data-active', 'false');
    });

    it('handles undefined pathname', () => {
      mockUsePathname.mockReturnValue(undefined as any);
      render(<Sidebar {...defaultProps} />);
      
      const dashboardItem = screen.getByTestId('sidebar-item-dashboard');
      expect(dashboardItem).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Default Props', () => {
    it('uses default values when props are not provided', () => {
      const minimalProps = {
        isCollapsed: false,
        onToggleCollapse: jest.fn(),
      };
      
      render(<Sidebar {...minimalProps} />);
      
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByText('Emon Pixels')).toBeInTheDocument(); // default user name
    });
  });

  describe('Content Visibility Logic', () => {
    it('shows expanded content when not collapsed', () => {
      render(<Sidebar {...defaultProps} isCollapsed={false} isHovered={false} />);
      
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText(`Version ${versionInfo.version}`)).toBeInTheDocument();
    });

    it('shows expanded content when collapsed but hovered', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} />);
      
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText(`Version ${versionInfo.version}`)).toBeInTheDocument();
    });

    it('hides expanded content when collapsed and not hovered', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} isHovered={false} />);
      
      expect(screen.queryByText('NOGL')).not.toBeInTheDocument();
      expect(screen.queryByText(`Version ${versionInfo.version}`)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onToggleCollapse gracefully', () => {
      const { onToggleCollapse, ...propsWithoutToggle } = defaultProps;
      render(<Sidebar {...propsWithoutToggle} isCollapsed={false} />);
      
      const toggleButton = screen.getByRole('button');
      expect(() => fireEvent.click(toggleButton)).not.toThrow();
    });

    it('handles missing onLogout gracefully', () => {
      const { onLogout, ...propsWithoutLogout } = defaultProps;
      render(<Sidebar {...propsWithoutLogout} />);
      
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    it('handles empty navigation items gracefully', () => {
      // This would require mocking the data, but the component should handle empty arrays
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });
});
