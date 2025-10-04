/**
 * Sidebar Test Configuration
 * 
 * This file contains configuration settings specific to sidebar component testing.
 * It includes coverage targets, test timeouts, and other sidebar-specific settings.
 */

export const SIDEBAR_TEST_CONFIG = {
  // Coverage targets for sidebar components
  coverage: {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100,
  },
  
  // Test timeouts
  timeouts: {
    unit: 5000,      // 5 seconds for unit tests
    integration: 10000, // 10 seconds for integration tests
    e2e: 30000,     // 30 seconds for e2e tests
  },
  
  // Test data
  testData: {
    navigationItems: {
      main: 6,       // Number of main navigation items
      other: 2,      // Number of other navigation items
      submenu: 5,    // Total number of submenu items
    },
    userProfiles: {
      default: 1,    // Default user profile
      custom: 3,     // Custom user profiles for testing
    },
  },
  
  // Mock configurations
  mocks: {
    nextNavigation: true,
    nextLink: true,
    nextAuth: true,
    userProfile: true,
    sidebarItem: true,
  },
  
  // Test scenarios
  scenarios: {
    responsive: {
      breakpoints: ['mobile', 'tablet', 'desktop'],
      states: ['collapsed', 'expanded', 'hovered'],
    },
    interactions: {
      hover: true,
      click: true,
      keyboard: true,
      touch: true,
    },
    accessibility: {
      screenReader: true,
      keyboardNavigation: true,
      colorContrast: true,
      focusManagement: true,
    },
  },
  
  // Performance thresholds
  performance: {
    renderTime: 100,     // Max render time in ms
    interactionTime: 50, // Max interaction response time in ms
    memoryUsage: 10,     // Max memory usage in MB
  },
  
  // Error scenarios
  errorScenarios: {
    invalidProps: true,
    missingData: true,
    networkErrors: true,
    renderingErrors: true,
  },
} as const;

// Test file patterns
export const TEST_FILE_PATTERNS = {
  unit: [
    'tests/unit/components/organisms/Sidebar.test.tsx',
    'tests/unit/components/organisms/UserProfile.test.tsx',
    'tests/unit/components/molecules/SidebarItem.test.tsx',
    'tests/unit/data/sidebarNavigation.test.ts',
  ],
  integration: [
    'tests/integration/components/sidebar/SidebarIntegration.test.tsx',
  ],
  e2e: [
    'tests/e2e/sidebar/sidebar-navigation.e2e.ts',
    'tests/e2e/sidebar/sidebar-responsive.e2e.ts',
  ],
} as const;

// Test data generators
export const generateTestData = {
  navigationItems: (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      id: `test-item-${i}`,
      title: `Test Item ${i}`,
      path: `/test-${i}`,
      icon: <span data-testid={`test-icon-${i}`}>📊</span>,
    })),
    
  userProfiles: (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      name: `Test User ${i}`,
      email: `test${i}@example.com`,
      avatar: `/test-avatar-${i}.jpg`,
    })),
    
  submenuItems: (parentId: string, count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${parentId}-submenu-${i}`,
      title: `Submenu Item ${i}`,
      path: `/${parentId}/submenu-${i}`,
      icon: null,
    })),
};

// Test utilities
export const testUtils = {
  // Wait for async operations
  waitForAsync: (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Simulate user interactions
  simulateUserInteraction: {
    hover: (element: HTMLElement) => {
      element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    },
    click: (element: HTMLElement) => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    },
    keyboard: (element: HTMLElement, key: string) => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    },
  },
  
  // Performance measurement
  measurePerformance: {
    renderTime: (renderFn: () => void) => {
      const start = performance.now();
      renderFn();
      const end = performance.now();
      return end - start;
    },
    memoryUsage: () => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
      }
      return 0;
    },
  },
  
  // Accessibility testing
  a11y: {
    checkFocusOrder: (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(focusableElements);
    },
    checkAriaLabels: (container: HTMLElement) => {
      const elementsWithAria = container.querySelectorAll('[aria-label]');
      return Array.from(elementsWithAria);
    },
  },
};

// Test environment setup
export const setupSidebarTestEnvironment = () => {
  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  
  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Mock getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => '',
    }),
  });
};

// Cleanup function
export const cleanupSidebarTestEnvironment = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Clean up DOM
  document.querySelectorAll('[data-testid^="submenu-"]').forEach(el => el.remove());
  
  // Reset performance
  if ('clearMarks' in performance) {
    performance.clearMarks();
  }
  if ('clearMeasures' in performance) {
    performance.clearMeasures();
  }
};

// Export types
export type SidebarTestConfig = typeof SIDEBAR_TEST_CONFIG;
export type TestFilePatterns = typeof TEST_FILE_PATTERNS;
