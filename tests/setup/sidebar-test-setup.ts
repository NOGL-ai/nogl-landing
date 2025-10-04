/**
 * Sidebar Test Setup
 * 
 * This file contains shared test utilities, mocks, and setup for sidebar component tests.
 * It follows the DRY principle and provides consistent test environment across all sidebar tests.
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SidebarProps } from '@/types/navigation';
import { defaultUserProfile } from '@/data/sidebarNavigation';

// Mock implementations
export const mockNextNavigation = {
  usePathname: jest.fn(),
};

export const mockNextLink = ({ children, href, ...props }: any) => (
  <a href={href} {...props}>{children}</a>
);

export const mockUserProfile = ({ user, isCollapsed, onLogout }: any) => (
  <div data-testid="user-profile" data-collapsed={isCollapsed}>
    <span>{user?.name || 'User'}</span>
    {onLogout && <button onClick={onLogout}>Logout</button>}
  </div>
);

export const mockSidebarItem = ({ item, isActive, isCollapsed }: any) => (
  <div 
    data-testid={`sidebar-item-${item.id}`} 
    data-active={isActive}
    data-collapsed={isCollapsed}
  >
    {item.title}
  </div>
);

// Test data factories
export const createSidebarProps = (overrides: Partial<SidebarProps> = {}): SidebarProps => ({
  isCollapsed: false,
  onToggleCollapse: jest.fn(),
  user: defaultUserProfile,
  onLogout: jest.fn(),
  isHovered: false,
  onHoverChange: jest.fn(),
  className: '',
  ...overrides,
});

export const createMockNavigationItem = (overrides: any = {}) => ({
  id: 'test-item',
  title: 'Test Item',
  path: '/test',
  icon: <span data-testid="test-icon">📊</span>,
  ...overrides,
});

export const createMockNavigationItemWithSubmenu = (overrides: any = {}) => ({
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
    },
  ],
  ...overrides,
});

export const createMockUserProfile = (overrides: any = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/test-avatar.jpg',
  ...overrides,
});

// Test utilities
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const createMockSession = (overrides: any = {}) => ({
  user: {
    name: 'Session User',
    email: 'session@example.com',
    image: 'https://example.com/session-avatar.jpg',
  },
  ...overrides,
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  sidebarProps?: Partial<SidebarProps>;
}

export const renderWithSidebar = (
  ui: ReactElement,
  { sidebarProps = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  const props = createSidebarProps(sidebarProps);
  
  return render(ui, {
    ...renderOptions,
  });
};

// Test assertions helpers
export const expectSidebarToBeCollapsed = (container: HTMLElement) => {
  expect(container).toHaveClass('w-[80px]');
  expect(container).not.toHaveClass('w-[272px]');
};

export const expectSidebarToBeExpanded = (container: HTMLElement) => {
  expect(container).toHaveClass('w-[272px]');
  expect(container).not.toHaveClass('w-[80px]');
};

export const expectSidebarToBeHovered = (container: HTMLElement) => {
  expect(container).toHaveClass('shadow-2xl');
};

export const expectNavigationItemToBeActive = (item: HTMLElement) => {
  expect(item).toHaveAttribute('data-active', 'true');
};

export const expectNavigationItemToBeInactive = (item: HTMLElement) => {
  expect(item).toHaveAttribute('data-active', 'false');
};

// Mock cleanup utilities
export const cleanupMocks = () => {
  jest.clearAllMocks();
  document.querySelectorAll('[data-testid^="submenu-"]').forEach(el => el.remove());
};

// Test data constants
export const TEST_PATHS = {
  DASHBOARD: '/dashboard',
  CATALOG: '/catalog',
  COMPETITORS: '/competitors',
  REPRICING: '/repricing',
  REPORTS: '/reports',
  PRODUCT_FEED: '/product-feed',
  SETTINGS: '/settings',
  ACCOUNT: '/account',
} as const;

export const TEST_NAVIGATION_ITEMS = {
  DASHBOARD: 'dashboard',
  MY_CATALOG: 'my-catalog',
  COMPETITORS: 'competitors',
  REPRICING: 'repricing',
  REPORTS: 'reports',
  PRODUCT_FEED: 'product-feed',
  SETTINGS: 'settings',
  MY_ACCOUNT: 'my-account',
} as const;

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const simulateRapidInteractions = (element: HTMLElement, eventType: string, count: number = 10) => {
  for (let i = 0; i < count; i++) {
    fireEvent[eventType](element);
  }
};

// Accessibility testing utilities
export const checkA11yCompliance = (container: HTMLElement) => {
  // Check for proper ARIA labels
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAttribute('aria-label');
  });
  
  // Check for proper heading structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  expect(headings.length).toBeGreaterThan(0);
  
  // Check for proper link structure
  const links = container.querySelectorAll('a');
  links.forEach(link => {
    expect(link).toHaveAttribute('href');
  });
};

// Error boundary testing
export const createErrorThrowingComponent = (errorMessage: string) => {
  return function ErrorThrowingComponent() {
    throw new Error(errorMessage);
  };
};

// Mock console methods for testing
export const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock console methods
  global.console = {
    ...console,
    ...mockConsole,
  };
  
  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now()),
  } as any;
  
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// Cleanup test environment
export const cleanupTestEnvironment = () => {
  cleanupMocks();
  jest.restoreAllMocks();
};
