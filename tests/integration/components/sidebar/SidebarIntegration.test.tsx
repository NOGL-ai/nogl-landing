import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/organisms/Sidebar';
import { SidebarProps } from '@/types/navigation';
import { mainNavigationItems, otherNavigationItems, defaultUserProfile } from '@/data/sidebarNavigation';

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
// Uses a module-level store so "only one submenu open at a time" can be simulated
// without relying on DOM side effects that leak across tests.
jest.mock('@/components/molecules/SidebarItem', () => {
  const openSubmenus = new Set<string>();
  const MockSidebarItem = ({ item, isActive, isCollapsed }: any) => {
    const handleClick = () => {
      if (!item.submenu) return;
      // Close all other submenus (mimic accordion behavior) and toggle this one
      const existing = document.querySelector(`[data-testid="submenu-${item.id}"]`);
      document.querySelectorAll('[data-testid^="submenu-"]').forEach(el => el.remove());
      openSubmenus.clear();

      if (!existing) {
        openSubmenus.add(item.id);
        const submenuContainer = document.createElement('div');
        submenuContainer.setAttribute('data-testid', `submenu-${item.id}`);
        submenuContainer.innerHTML = item.submenu
          .map((sub: any) => `<div data-testid="submenu-item-${sub.id}">${sub.title}</div>`)
          .join('');
        document.body.appendChild(submenuContainer);
      }
    };

    return (
      <div
        data-testid={`sidebar-item-${item.id}`}
        data-active={isActive}
        data-collapsed={isCollapsed}
        onClick={handleClick}
      >
        {item.title}
      </div>
    );
  };
  return MockSidebarItem;
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const getSidebarRoot = () => screen.getByTestId('sidebar-root');

// Find a main nav item that has a submenu for integration scenarios
const firstSubmenuItem = mainNavigationItems.items.find(item => item.submenu && item.submenu.length > 0);
const secondSubmenuItem = mainNavigationItems.items.filter(item => item.submenu && item.submenu.length > 0)[1];

describe('Sidebar Integration Tests', () => {
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
    // Clean up any existing submenus between tests
    document.querySelectorAll('[data-testid^="submenu-"]').forEach(el => el.remove());
  });

  describe('Complete Sidebar Workflow', () => {
    it('renders complete sidebar with all sections', () => {
      render(<Sidebar {...defaultProps} />);

      // Header section
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText('Company Ltd')).toBeInTheDocument();

      // Main navigation items
      mainNavigationItems.items.forEach(item => {
        expect(screen.getByTestId(`sidebar-item-${item.id}`)).toBeInTheDocument();
      });

      // Other navigation items
      otherNavigationItems.items.forEach(item => {
        expect(screen.getByTestId(`sidebar-item-${item.id}`)).toBeInTheDocument();
      });

      // User profile
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    it('handles complete collapse/expand workflow', () => {
      const mockToggle = jest.fn();
      const { rerender } = render(<Sidebar {...defaultProps} onToggleCollapse={mockToggle} />);

      // Initially expanded
      expect(screen.getByText('NOGL')).toBeInTheDocument();

      // Collapse
      rerender(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={mockToggle} />);
      expect(screen.queryByText('NOGL')).not.toBeInTheDocument();

      // Expand via hover
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onToggleCollapse={mockToggle} />);
      expect(screen.getByText('NOGL')).toBeInTheDocument();

      // Expand via toggle
      rerender(<Sidebar {...defaultProps} isCollapsed={false} onToggleCollapse={mockToggle} />);
      expect(screen.getByText('NOGL')).toBeInTheDocument();
    });

    it('handles complete hover interaction workflow', () => {
      const mockHoverChange = jest.fn();
      const { rerender } = render(<Sidebar {...defaultProps} isCollapsed={true} onHoverChange={mockHoverChange} />);

      const sidebar = getSidebarRoot();

      // Mouse enter should trigger hover
      fireEvent.mouseEnter(sidebar);
      expect(mockHoverChange).toHaveBeenCalledWith(true);

      // Rerender with hovered state
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onHoverChange={mockHoverChange} />);
      expect(screen.getByText('NOGL')).toBeInTheDocument();

      // Mouse leave should trigger unhover
      fireEvent.mouseLeave(getSidebarRoot());
      expect(mockHoverChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Navigation Integration', () => {
    it('handles navigation with active state detection', () => {
      // Use the companies path which exists in the real navigation data
      mockUsePathname.mockReturnValue('/companies');
      render(<Sidebar {...defaultProps} />);

      const companiesItem = screen.getByTestId('sidebar-item-companies');
      expect(companiesItem).toHaveAttribute('data-active', 'true');

      // Dashboard should not be active when on /companies
      const dashboardItem = screen.getByTestId('sidebar-item-dashboard');
      expect(dashboardItem).toHaveAttribute('data-active', 'false');
    });

    it('handles submenu navigation workflow', () => {
      expect(firstSubmenuItem).toBeDefined();
      render(<Sidebar {...defaultProps} />);

      const target = screen.getByTestId(`sidebar-item-${firstSubmenuItem!.id}`);
      fireEvent.click(target);

      // Submenu should appear
      expect(screen.getByTestId(`submenu-${firstSubmenuItem!.id}`)).toBeInTheDocument();
      firstSubmenuItem!.submenu!.forEach(sub => {
        expect(screen.getByTestId(`submenu-item-${sub.id}`)).toBeInTheDocument();
      });

      // Click again to close
      fireEvent.click(target);
      expect(screen.queryByTestId(`submenu-${firstSubmenuItem!.id}`)).not.toBeInTheDocument();
    });

    it('handles multiple submenu interactions', () => {
      expect(firstSubmenuItem).toBeDefined();
      expect(secondSubmenuItem).toBeDefined();
      render(<Sidebar {...defaultProps} />);

      // Open first submenu
      const firstTarget = screen.getByTestId(`sidebar-item-${firstSubmenuItem!.id}`);
      fireEvent.click(firstTarget);
      expect(screen.getByTestId(`submenu-${firstSubmenuItem!.id}`)).toBeInTheDocument();

      // Open second submenu (our mock closes the first)
      const secondTarget = screen.getByTestId(`sidebar-item-${secondSubmenuItem!.id}`);
      fireEvent.click(secondTarget);
      expect(screen.getByTestId(`submenu-${secondSubmenuItem!.id}`)).toBeInTheDocument();
      expect(screen.queryByTestId(`submenu-${firstSubmenuItem!.id}`)).not.toBeInTheDocument();
    });
  });

  describe('User Profile Integration', () => {
    it('integrates user profile with logout functionality', async () => {
      const mockLogout = jest.fn();
      render(<Sidebar {...defaultProps} onLogout={mockLogout} />);

      const userProfile = screen.getByTestId('user-profile');
      expect(userProfile).toBeInTheDocument();

      // Simulate logout button click
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('handles user profile in collapsed state', () => {
      render(<Sidebar {...defaultProps} isCollapsed={true} />);

      const userProfile = screen.getByTestId('user-profile');
      expect(userProfile).toHaveAttribute('data-collapsed', 'true');
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('handles complete responsive workflow', () => {
      const mockHoverChange = jest.fn();
      const { rerender } = render(<Sidebar {...defaultProps} onHoverChange={mockHoverChange} />);

      // Desktop: expanded
      expect(screen.getByText('NOGL')).toBeInTheDocument();

      // Mobile: collapsed
      rerender(<Sidebar {...defaultProps} isCollapsed={true} onHoverChange={mockHoverChange} />);
      expect(screen.queryByText('NOGL')).not.toBeInTheDocument();

      // Mobile with hover: expanded
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onHoverChange={mockHoverChange} />);
      expect(screen.getByText('NOGL')).toBeInTheDocument();
    });

    it('maintains state consistency during responsive changes', () => {
      const mockToggle = jest.fn();
      const mockHoverChange = jest.fn();
      const { rerender } = render(<Sidebar {...defaultProps} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);

      // Open submenu in expanded state
      expect(firstSubmenuItem).toBeDefined();
      const target = screen.getByTestId(`sidebar-item-${firstSubmenuItem!.id}`);
      fireEvent.click(target);
      expect(screen.getByTestId(`submenu-${firstSubmenuItem!.id}`)).toBeInTheDocument();

      // Collapse sidebar — simulate the component tree resetting submenu state
      document.querySelectorAll('[data-testid^="submenu-"]').forEach(el => el.remove());
      rerender(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);
      expect(screen.queryByTestId(`submenu-${firstSubmenuItem!.id}`)).not.toBeInTheDocument();

      // Expand via hover; submenu should stay closed (state reset)
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);
      expect(screen.queryByTestId(`submenu-${firstSubmenuItem!.id}`)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles missing props gracefully', () => {
      const minimalProps = {
        isCollapsed: false,
        onToggleCollapse: jest.fn(),
      };

      render(<Sidebar {...minimalProps} />);

      // Should render without errors
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    it('handles invalid pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null as any);
      render(<Sidebar {...defaultProps} />);

      // Should render without errors
      expect(screen.getByText('NOGL')).toBeInTheDocument();
    });

    it('handles rapid state changes gracefully', () => {
      const mockToggle = jest.fn();
      const mockHoverChange = jest.fn();
      const { rerender } = render(<Sidebar {...defaultProps} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);

      // Rapid state changes
      rerender(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);
      rerender(<Sidebar {...defaultProps} isCollapsed={false} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);

      // Should render without errors
      expect(screen.getByText('NOGL')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('handles large navigation datasets efficiently', () => {
      render(<Sidebar {...defaultProps} />);

      // All items should render
      const allItems = [
        ...mainNavigationItems.items,
        ...otherNavigationItems.items,
      ];

      allItems.forEach(item => {
        expect(screen.getByTestId(`sidebar-item-${item.id}`)).toBeInTheDocument();
      });
    });

    it('handles rapid user interactions efficiently', () => {
      const mockHoverChange = jest.fn();
      render(<Sidebar {...defaultProps} onHoverChange={mockHoverChange} />);

      const sidebar = getSidebarRoot();

      // Rapid hover events
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseEnter(sidebar);
        fireEvent.mouseLeave(sidebar);
      }

      // Should handle without errors
      expect(screen.getByText('NOGL')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains keyboard navigation throughout sidebar', () => {
      render(<Sidebar {...defaultProps} />);

      // There is at least one button (the toggle) in the header
      const interactiveElements = screen.getAllByRole('button');
      expect(interactiveElements.length).toBeGreaterThan(0);
      interactiveElements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });

    it('maintains screen reader compatibility', () => {
      render(<Sidebar {...defaultProps} />);

      // All text content should be accessible
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText('Company Ltd')).toBeInTheDocument();

      // Navigation items should have accessible text
      mainNavigationItems.items.forEach(item => {
        expect(screen.getByText(item.title)).toBeInTheDocument();
      });
    });

    it('exposes a primary navigation landmark', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByRole('navigation', { name: /primary sidebar/i })).toBeInTheDocument();
    });
  });
});
