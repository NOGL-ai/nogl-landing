import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for performance tests only.
 * Uses testDir './tests/performance' so Playwright can discover the tests
 * even though the default playwright.config.ts uses './tests/e2e'.
 *
 * The existing products.performance.test.ts navigates to /test-table which
 * is not a production route — it is ignored here until it is fixed.
 * The health.perf.spec.ts file provides the CI smoke coverage.
 */
export default defineConfig({
  testDir: './tests/performance',
  /* Skip the legacy /test-table based tests in CI */
  testIgnore: process.env.CI ? ['**/products.performance.test.ts'] : [],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['github']] : [['html']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
