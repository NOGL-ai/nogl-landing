import { test, expect } from '@playwright/test';

/**
 * Smoke / health-check tests — safe to run in CI.
 *
 * These tests only require that the Next.js dev server starts and responds.
 * They do NOT require seeded data, auth, or specific UI components.
 */
test.describe('Application health', () => {
  test('NextAuth providers endpoint is reachable', async ({ request }) => {
    const response = await request.get('/api/auth/providers');
    // Returns 200 with an empty object when no providers are configured
    expect(response.status()).toBeLessThan(500);
  });

  test('public signin page renders without a server error', async ({ page }) => {
    const response = await page.goto('/en/auth/signin', { waitUntil: 'load' });
    // 200 or any redirect (3xx) is acceptable — just not a 5xx crash
    expect(response?.status() ?? 200).toBeLessThan(500);
  });

  test('root path responds without a server error', async ({ page }) => {
    // In dev mode auth middleware is bypassed, so this may redirect or
    // render the dashboard — either way it must not 500.
    const response = await page.goto('/en', { waitUntil: 'load' });
    expect(response?.status() ?? 200).toBeLessThan(500);
  });
});
