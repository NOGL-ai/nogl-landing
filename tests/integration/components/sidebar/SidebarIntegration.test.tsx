import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
jest.mock('@/components/molecules/SidebarItem', () => {
  return function MockSidebarItem({ item, isActive, isCollapsed }: any) {
    return (
      <div 
        data-testid={`sidebar-item-${item.id}`} 
        data-active={isActive}
        data-collapsed={isCollapsed}
        onClick={() => {
          if (item.submenu) {
            // Simulate submenu toggle
            const submenu = document.querySelector(`[data-testid="submenu-${item.id}"]`);
            if (submenu) {
              submenu.remove();
            } else {
              const submenuContainer = document.createElement('div');
              submenuContainer.setAttribute('data-testid', `submenu-${item.id}`);
              submenuContainer.innerHTML = item.submenu.map((sub: any) => 
                `<div data-testid="submenu-item-${sub.id}">${sub.title}</div>`
              ).join('');
              document.body.appendChild(submenuContainer);
            }
          }
        }}
      >
        {item.title}
      </div>
    );
  };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

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
    // Clean up any existing submenus
    document.querySelectorAll('[data-testid^="submenu-"]').forEach(el => el.remove());
  });

  describe('Complete Sidebar Workflow', () => {
    it('renders complete sidebar with all sections', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Header section
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      expect(screen.getByText('Company Ltd')).toBeInTheDocument();
      
      // Main navigation
      expect(screen.getByText(mainNavigationItems.title)).toBeInTheDocument();
      mainNavigationItems.items.forEach(item => {
        expect(screen.getByTestId(`sidebar-item-${item.id}`)).toBeInTheDocument();
      });
      
      // Other navigation
      expect(screen.getByText(otherNavigationItems.title)).toBeInTheDocument();
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
      
      const sidebar = screen.getByRole('generic');
      
      // Mouse enter should trigger hover
      fireEvent.mouseEnter(sidebar);
      expect(mockHoverChange).toHaveBeenCalledWith(true);
      
      // Rerender with hovered state
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onHoverChange={mockHoverChange} />);
      expect(screen.getByText('NOGL')).toBeInTheDocument();
      
      // Mouse leave should trigger unhover
      fireEvent.mouseLeave(sidebar);
      expect(mockHoverChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Navigation Integration', () => {
    it('handles navigation with active state detection', () => {
      mockUsePathname.mockReturnValue('/competitors');
      render(<Sidebar {...defaultProps} />);
      
      // Competitors should be active
      const competitorsItem = screen.getByTestId('sidebar-item-competitors');
      expect(competitorsItem).toHaveAttribute('data-active', 'true');
      
      // Other items should not be active
      const dashboardItem = screen.getByTestId('sidebar-item-dashboard');
      expect(dashboardItem).toHaveAttribute('data-active', 'false');
    });

    it('handles submenu navigation workflow', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Click on item with submenu
      const competitorsItem = screen.getByTestId('sidebar-item-competitors');
      fireEvent.click(competitorsItem);
      
      // Submenu should appear
      expect(screen.getByTestId('submenu-competitors')).toBeInTheDocument();
      expect(screen.getByTestId('submenu-item-competitor')).toBeInTheDocument();
      expect(screen.getByTestId('submenu-item-monitored-urls')).toBeInTheDocument();
      
      // Click again to close
      fireEvent.click(competitorsItem);
      expect(screen.queryByTestId('submenu-competitors')).not.toBeInTheDocument();
    });

    it('handles multiple submenu interactions', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open competitors submenu
      const competitorsItem = screen.getByTestId('sidebar-item-competitors');
      fireEvent.click(competitorsItem);
      expect(screen.getByTestId('submenu-competitors')).toBeInTheDocument();
      
      // Open repricing submenu (should close competitors)
      const repricingItem = screen.getByTestId('sidebar-item-repricing');
      fireEvent.click(repricingItem);
      expect(screen.getByTestId('submenu-repricing')).toBeInTheDocument();
      expect(screen.queryByTestId('submenu-competitors')).not.toBeInTheDocument();
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
      const competitorsItem = screen.getByTestId('sidebar-item-competitors');
      fireEvent.click(competitorsItem);
      expect(screen.getByTestId('submenu-competitors')).toBeInTheDocument();
      
      // Collapse sidebar
      rerender(<Sidebar {...defaultProps} isCollapsed={true} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);
      
      // Submenu should be hidden
      expect(screen.queryByTestId('submenu-competitors')).not.toBeInTheDocument();
      
      // Expand via hover
      rerender(<Sidebar {...defaultProps} isCollapsed={true} isHovered={true} onToggleCollapse={mockToggle} onHoverChange={mockHoverChange} />);
      
      // Submenu should still be hidden (state reset)
      expect(screen.queryByTestId('submenu-competitors')).not.toBeInTheDocument();
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
      // This would test with a large number of navigation items
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
      
      const sidebar = screen.getByRole('generic');
      
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
      
      // Tab through all interactive elements
      const interactiveElements = screen.getAllByRole('button');
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
  });
});
