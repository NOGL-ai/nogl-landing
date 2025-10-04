import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with sidebar
    await page.goto('/dashboard');
    
    // Wait for sidebar to load
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
  });

  test('should render sidebar with all navigation items', async ({ page }) => {
    // Check main navigation items
    await expect(page.locator('[data-testid="sidebar-item-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-item-my-catalog"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-item-competitors"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-item-repricing"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-item-reports"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-item-product-feed"]')).toBeVisible();
    
    // Check other navigation items
    await expect(page.locator('[data-testid="sidebar-item-settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-item-my-account"]')).toBeVisible();
  });

  test('should toggle sidebar collapse/expand', async ({ page }) => {
    // Initially expanded
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/w-\[272px\]/);
    
    // Click toggle button
    await page.click('[data-testid="sidebar-toggle"]');
    
    // Should be collapsed
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/w-\[80px\]/);
    
    // Click toggle again
    await page.click('[data-testid="sidebar-toggle"]');
    
    // Should be expanded again
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/w-\[272px\]/);
  });

  test('should show submenu on hover for items with submenu', async ({ page }) => {
    // Hover over competitors item
    await page.hover('[data-testid="sidebar-item-competitors"]');
    
    // Submenu should appear
    await expect(page.locator('[data-testid="submenu-competitors"]')).toBeVisible();
    await expect(page.locator('[data-testid="submenu-item-competitor"]')).toBeVisible();
    await expect(page.locator('[data-testid="submenu-item-monitored-urls"]')).toBeVisible();
    
    // Move mouse away
    await page.hover('body');
    
    // Submenu should disappear after delay
    await page.waitForTimeout(400);
    await expect(page.locator('[data-testid="submenu-competitors"]')).not.toBeVisible();
  });

  test('should navigate to correct pages when clicking navigation items', async ({ page }) => {
    // Click on dashboard
    await page.click('[data-testid="sidebar-item-dashboard"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Click on catalog
    await page.click('[data-testid="sidebar-item-my-catalog"]');
    await expect(page).toHaveURL('/catalog');
    
    // Click on settings
    await page.click('[data-testid="sidebar-item-settings"]');
    await expect(page).toHaveURL('/settings');
  });

  test('should show active state for current page', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Dashboard item should be active
    await expect(page.locator('[data-testid="sidebar-item-dashboard"]')).toHaveAttribute('data-active', 'true');
    
    // Other items should not be active
    await expect(page.locator('[data-testid="sidebar-item-my-catalog"]')).toHaveAttribute('data-active', 'false');
  });

  test('should show tooltip when sidebar is collapsed', async ({ page }) => {
    // Collapse sidebar
    await page.click('[data-testid="sidebar-toggle"]');
    
    // Hover over dashboard item
    await page.hover('[data-testid="sidebar-item-dashboard"]');
    
    // Tooltip should appear
    await expect(page.locator('[data-testid="tooltip-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="tooltip-dashboard"]')).toContainText('Dashboard');
  });

  test('should handle user profile interactions', async ({ page }) => {
    // Click on user profile
    await page.click('[data-testid="user-profile-button"]');
    
    // Profile dropdown should appear
    await expect(page.locator('[data-testid="user-profile-dropdown"]')).toBeVisible();
    
    // Should show user information
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
  });

  test('should handle logout functionality', async ({ page }) => {
    // Click on user profile
    await page.click('[data-testid="user-profile-button"]');
    
    // Click logout
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Sidebar should be collapsed by default on mobile
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/w-\[80px\]/);
    
    // Hover should expand sidebar
    await page.hover('[data-testid="sidebar"]');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/w-\[272px\]/);
  });

  test('should maintain state during page navigation', async ({ page }) => {
    // Open submenu
    await page.hover('[data-testid="sidebar-item-competitors"]');
    await expect(page.locator('[data-testid="submenu-competitors"]')).toBeVisible();
    
    // Navigate to different page
    await page.click('[data-testid="sidebar-item-dashboard"]');
    
    // Submenu should be closed
    await expect(page.locator('[data-testid="submenu-competitors"]')).not.toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on sidebar
    await page.focus('[data-testid="sidebar"]');
    
    // Tab through navigation items
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="sidebar-item-dashboard"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="sidebar-item-my-catalog"]:focus')).toBeVisible();
    
    // Enter should activate item
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/catalog');
  });

  test('should handle rapid interactions without errors', async ({ page }) => {
    // Rapid hover events
    for (let i = 0; i < 5; i++) {
      await page.hover('[data-testid="sidebar-item-competitors"]');
      await page.hover('[data-testid="sidebar-item-repricing"]');
    }
    
    // Should not throw errors
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('should show version information', async ({ page }) => {
    // Version info should be visible when expanded
    await expect(page.locator('[data-testid="version-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="version-text"]')).toContainText('Version 1.7.2');
    await expect(page.locator('[data-testid="version-badge"]')).toContainText('NEW');
  });

  test('should handle theme switching', async ({ page }) => {
    // Click on user profile
    await page.click('[data-testid="user-profile-button"]');
    
    // Click theme toggle
    await page.click('[data-testid="theme-toggle"]');
    
    // Should toggle theme
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    
    // Click again
    await page.click('[data-testid="theme-toggle"]');
    
    // Should toggle back
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Sidebar Accessibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="sidebar"]');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA labels on interactive elements
    await expect(page.locator('[data-testid="sidebar-toggle"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="user-profile-button"]')).toHaveAttribute('aria-label');
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Use screen reader navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through all items
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should maintain focus management', async ({ page }) => {
    // Focus on sidebar
    await page.focus('[data-testid="sidebar"]');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should be visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Sidebar Performance E2E Tests', () => {
  test('should load sidebar quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
  });

  test('should handle rapid interactions smoothly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="sidebar"]');
    
    const startTime = Date.now();
    
    // Rapid interactions
    for (let i = 0; i < 10; i++) {
      await page.hover('[data-testid="sidebar-item-dashboard"]');
      await page.hover('[data-testid="sidebar-item-my-catalog"]');
    }
    
    const interactionTime = Date.now() - startTime;
    expect(interactionTime).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should not cause memory leaks', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    
    // Perform many interactions
    for (let i = 0; i < 50; i++) {
      await page.hover('[data-testid="sidebar-item-dashboard"]');
      await page.hover('[data-testid="sidebar-item-my-catalog"]');
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
    
    // Memory increase should be reasonable
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
  });
});
