import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SidebarItem from '@/components/molecules/SidebarItem';
import { NavigationItem } from '@/types/navigation';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, className, ...props }: any) {
    return <a href={href} className={className} {...props}>{children}</a>;
  };
});

describe('SidebarItem Component', () => {
  const mockItem: NavigationItem = {
    id: 'test-item',
    title: 'Test Item',
    path: '/test',
    icon: <span data-testid="test-icon">📊</span>,
  };

  const mockItemWithSubmenu: NavigationItem = {
    id: 'test-item-with-submenu',
    title: 'Test Item with Submenu',
    path: '/test-with-submenu',
    icon: <span data-testid="test-icon-submenu">📁</span>,
    submenu: [
      {
        id: 'submenu-item-1',
        title: 'Submenu Item 1',
        path: '/test-with-submenu/item-1',
        icon: null,
      },
      {
        id: 'submenu-item-2',
        title: 'Submenu Item 2',
        path: '/test-with-submenu/item-2',
        icon: null,
        isActive: true,
      },
    ],
  };

  const mockItemWithBadge: NavigationItem = {
    id: 'test-item-with-badge',
    title: 'Test Item with Badge',
    path: '/test-with-badge',
    icon: <span data-testid="test-icon-badge">🔔</span>,
    badge: {
      text: 'NEW',
      variant: 'new',
    },
  };

  const mockItemWithSoonBadge: NavigationItem = {
    id: 'test-item-with-soon-badge',
    title: 'Test Item with Soon Badge',
    path: '/test-with-soon-badge',
    icon: <span data-testid="test-icon-soon">⏰</span>,
    badge: {
      text: 'SOON',
      variant: 'soon',
    },
  };

  const mockItemWithDefaultBadge: NavigationItem = {
    id: 'test-item-with-default-badge',
    title: 'Test Item with Default Badge',
    path: '/test-with-default-badge',
    icon: <span data-testid="test-icon-default">📌</span>,
    badge: {
      text: '5',
      variant: 'default',
    },
  };

  describe('Basic Rendering', () => {
    it('renders item with correct title and icon', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={false} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders as link when no submenu', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={false} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('renders as div when has submenu', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      expect(container).not.toHaveAttribute('href');
    });
  });

  describe('Active State', () => {
    it('applies active styles when isActive is true', () => {
      render(<SidebarItem item={mockItem} isActive={true} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item').closest('div');
      expect(container).toHaveClass('bg-[#375DFB]', 'text-white');
    });

    it('applies inactive styles when isActive is false', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item').closest('div');
      expect(container).toHaveClass('text-[#9293A9]');
    });

    it('shows active indicator when active', () => {
      render(<SidebarItem item={mockItem} isActive={true} isCollapsed={false} />);
      
      const activeIndicator = screen.getByRole('generic').querySelector('.absolute.bottom-2.right-0.top-2');
      expect(activeIndicator).toBeInTheDocument();
    });

    it('hides active indicator when inactive', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={false} />);
      
      const activeIndicator = screen.getByRole('generic').querySelector('.absolute.bottom-2.right-0.top-2');
      expect(activeIndicator).not.toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('hides title when collapsed', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={true} />);
      
      expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
    });

    it('shows title when not collapsed', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={false} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('shows tooltip when collapsed and hovered', async () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });
    });

    it('hides tooltip when mouse leaves', async () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(container!);
      
      await waitFor(() => {
        expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
      });
    });
  });

  describe('Badge Rendering', () => {
    it('renders new badge with correct styles', () => {
      render(<SidebarItem item={mockItemWithBadge} isActive={false} isCollapsed={false} />);
      
      const badge = screen.getByText('NEW');
      expect(badge).toHaveClass('bg-[#DF1C41]', 'text-white');
    });

    it('renders soon badge with correct styles when active', () => {
      render(<SidebarItem item={mockItemWithSoonBadge} isActive={true} isCollapsed={false} />);
      
      const badge = screen.getByText('SOON');
      expect(badge).toHaveClass('bg-white/10', 'text-white');
    });

    it('renders soon badge with correct styles when inactive', () => {
      render(<SidebarItem item={mockItemWithSoonBadge} isActive={false} isCollapsed={false} />);
      
      const badge = screen.getByText('SOON');
      expect(badge).toHaveClass('bg-[#375DFB]/10', 'text-[#375DFB]');
    });

    it('renders default badge with correct styles', () => {
      render(<SidebarItem item={mockItemWithDefaultBadge} isActive={false} isCollapsed={false} />);
      
      const badge = screen.getByText('5');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('hides badge when collapsed', () => {
      render(<SidebarItem item={mockItemWithBadge} isActive={false} isCollapsed={true} />);
      
      expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    });

    it('shows badge in tooltip when collapsed', async () => {
      render(<SidebarItem item={mockItemWithBadge} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item with Badge').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByText('NEW')).toBeInTheDocument();
      });
    });
  });

  describe('Submenu Functionality', () => {
    it('shows submenu arrow when has submenu and not collapsed', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const arrow = screen.getByRole('generic').querySelector('svg');
      expect(arrow).toBeInTheDocument();
    });

    it('hides submenu arrow when collapsed', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={true} />);
      
      const arrow = screen.getByRole('generic').querySelector('svg');
      expect(arrow).not.toBeInTheDocument();
    });

    it('toggles submenu when clicked', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      fireEvent.click(container!);
      
      expect(screen.getByText('Submenu Item 1')).toBeInTheDocument();
      expect(screen.getByText('Submenu Item 2')).toBeInTheDocument();
    });

    it('toggles submenu closed when clicked again', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      fireEvent.click(container!);
      fireEvent.click(container!);
      
      expect(screen.queryByText('Submenu Item 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Submenu Item 2')).not.toBeInTheDocument();
    });

    it('opens submenu on hover when not collapsed', async () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByText('Submenu Item 1')).toBeInTheDocument();
      });
    });

    it('closes submenu on mouse leave with delay', async () => {
      jest.useFakeTimers();
      
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByText('Submenu Item 1')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(container!);
      
      // Fast-forward timers to trigger the timeout
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.queryByText('Submenu Item 1')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('does not open submenu on hover when collapsed', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('.group');
      fireEvent.mouseEnter(container!);
      
      expect(screen.queryByText('Submenu Item 1')).not.toBeInTheDocument();
    });

    it('does not toggle submenu when clicked while collapsed', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      fireEvent.click(container!);
      
      expect(screen.queryByText('Submenu Item 1')).not.toBeInTheDocument();
    });

    it('clears existing timeout when mouse enters again', async () => {
      jest.useFakeTimers();
      
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('.group');
      
      // First hover
      fireEvent.mouseEnter(container!);
      await waitFor(() => {
        expect(screen.getByText('Submenu Item 1')).toBeInTheDocument();
      });
      
      // Mouse leave (starts timeout)
      fireEvent.mouseLeave(container!);
      
      // Mouse enter again before timeout completes (should clear timeout)
      fireEvent.mouseEnter(container!);
      
      // Fast-forward timers
      jest.advanceTimersByTime(300);
      
      // Submenu should still be open because timeout was cleared
      await waitFor(() => {
        expect(screen.getByText('Submenu Item 1')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Submenu Items', () => {
    it('renders submenu items with correct links', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      fireEvent.click(container!);
      
      const submenuItem1 = screen.getByText('Submenu Item 1').closest('a');
      const submenuItem2 = screen.getByText('Submenu Item 2').closest('a');
      
      expect(submenuItem1).toHaveAttribute('href', '/test-with-submenu/item-1');
      expect(submenuItem2).toHaveAttribute('href', '/test-with-submenu/item-2');
    });

    it('applies active styles to active submenu items', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      fireEvent.click(container!);
      
      const activeSubmenuItem = screen.getByText('Submenu Item 2').closest('a');
      expect(activeSubmenuItem).toHaveClass('bg-[#375DFB]', 'text-white');
    });

    it('shows active indicator for active submenu items', () => {
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('div');
      fireEvent.click(container!);
      
      const activeSubmenuItem = screen.getByText('Submenu Item 2').closest('a');
      const activeIndicator = activeSubmenuItem?.querySelector('.absolute.bottom-2.right-0.top-2');
      expect(activeIndicator).toBeInTheDocument();
    });
  });

  describe('Tooltip in Collapsed State', () => {
    it('shows tooltip with title when collapsed and hovered', async () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const tooltip = screen.getByText('Test Item').closest('.absolute.left-full');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('shows tooltip with badge when collapsed and hovered', async () => {
      render(<SidebarItem item={mockItemWithBadge} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item with Badge').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByText('NEW')).toBeInTheDocument();
      });
    });

    it('applies correct badge styles in tooltip', async () => {
      render(<SidebarItem item={mockItemWithBadge} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item with Badge').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const badge = screen.getByText('NEW');
        expect(badge).toHaveClass('bg-red-500', 'text-white');
      });
    });

    it('shows tooltip arrow', async () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={true} />);
      
      const container = screen.getByText('Test Item').closest('.group');
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const tooltip = screen.getByText('Test Item').closest('.absolute.left-full');
        const arrow = tooltip?.querySelector('.absolute.right-full');
        expect(arrow).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles item without submenu gracefully', () => {
      render(<SidebarItem item={mockItem} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item').closest('div');
      fireEvent.click(container!);
      
      // Should not throw error
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('handles item with empty submenu array', () => {
      const itemWithEmptySubmenu = { ...mockItem, submenu: [] };
      render(<SidebarItem item={itemWithEmptySubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item').closest('div');
      fireEvent.click(container!);
      
      // Should not throw error
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('handles item with undefined submenu', () => {
      const itemWithUndefinedSubmenu = { ...mockItem, submenu: undefined };
      render(<SidebarItem item={itemWithUndefinedSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item').closest('div');
      fireEvent.click(container!);
      
      // Should not throw error
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('handles rapid mouse enter/leave events', async () => {
      jest.useFakeTimers();
      
      render(<SidebarItem item={mockItemWithSubmenu} isActive={false} isCollapsed={false} />);
      
      const container = screen.getByText('Test Item with Submenu').closest('.group');
      
      // Rapid hover events
      fireEvent.mouseEnter(container!);
      fireEvent.mouseLeave(container!);
      fireEvent.mouseEnter(container!);
      fireEvent.mouseLeave(container!);
      
      // Fast-forward timers
      jest.advanceTimersByTime(300);
      
      // Should not throw error
      expect(screen.getByText('Test Item with Submenu')).toBeInTheDocument();
      
      jest.useRealTimers();
    });
  });
});
