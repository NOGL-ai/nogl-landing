import { test, expect } from '@playwright/test';

/**
 * Lightweight performance smoke tests — safe to run in CI.
 *
 * Measures that critical HTTP endpoints respond within acceptable latency
 * thresholds. These tests do NOT require seeded DB data or auth sessions.
 *
 * Thresholds are generous (10 s / 20 s) to accommodate slow GitHub Actions
 * runners and the initial Next.js dev-server compilation cold start.
 */
test.describe('Application performance baseline', () => {
  test('NextAuth providers endpoint responds within 10 s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/auth/providers');
    const elapsed = Date.now() - start;

    expect(response.status()).toBeLessThan(500);
    expect(elapsed).toBeLessThan(10_000);
  });

  test('Signin page responds within 20 s', async ({ page }) => {
    const start = Date.now();
    const response = await page.goto('/en/auth/signin', { waitUntil: 'load' });
    const elapsed = Date.now() - start;

    expect(response?.status() ?? 200).toBeLessThan(500);
    expect(elapsed).toBeLessThan(20_000);
  });
});
