import { test, expect } from '@playwright/test';

/**
 * Lightweight performance smoke tests — safe to run in CI.
 *
 * Measures that critical HTTP endpoints respond within acceptable latency
 * thresholds. These tests do NOT require seeded DB data or auth sessions.
 */
test.describe('Application performance baseline', () => {
  test('NextAuth providers endpoint responds within 3 s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/auth/providers');
    const elapsed = Date.now() - start;

    expect(response.status()).toBeLessThan(500);
    expect(elapsed).toBeLessThan(3000);
  });

  test('Signin page responds within 5 s', async ({ page }) => {
    const start = Date.now();
    const response = await page.goto('/en/auth/signin', { waitUntil: 'load' });
    const elapsed = Date.now() - start;

    expect(response?.status() ?? 200).toBeLessThan(500);
    expect(elapsed).toBeLessThan(5000);
  });
});
