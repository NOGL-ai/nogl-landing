import { test, expect } from '@playwright/test';

/**
 * Lightweight performance smoke tests — safe to run in CI.
 *
 * Strategy: hit /api/health first to absorb the Next.js dev-server cold-start
 * compilation (which can take 10-30 s on GitHub Actions shared runners), then
 * measure subsequent requests which should be served from the warm route cache.
 *
 * Thresholds are intentionally generous (30 s / 45 s) because this job has
 * `continue-on-error: true` and the purpose is to detect catastrophic regressions,
 * not enforce strict SLAs. Real perf profiling happens in production with
 * real infrastructure.
 */
test.describe('Application performance baseline', () => {
  test.beforeAll(async ({ request }) => {
    // Warm up the server — absorbs Next.js compilation cold-start
    // Retry up to 10 times with 3 s delay to let the server finish compiling.
    for (let i = 0; i < 10; i++) {
      try {
        const r = await request.get('/api/health', { timeout: 30_000 });
        if (r.status() < 500) break;
      } catch {
        // Server not ready yet — wait and retry
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  });

  test('NextAuth providers endpoint responds within 30 s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/auth/providers');
    const elapsed = Date.now() - start;

    expect(response.status()).toBeLessThan(500);
    // 30 s threshold: accommodates warm-server latency on slow CI runners
    expect(elapsed).toBeLessThan(30_000);
  });

  test('Signin page responds within 45 s', async ({ page }) => {
    const start = Date.now();
    const response = await page.goto('/en/auth/signin', { waitUntil: 'load' });
    const elapsed = Date.now() - start;

    expect(response?.status() ?? 200).toBeLessThan(500);
    // 45 s threshold: full page load with Next.js RSC rendering on slow CI runners
    expect(elapsed).toBeLessThan(45_000);
  });
});
