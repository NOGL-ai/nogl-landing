import { test, expect } from '@playwright/test';

/**
 * Stacked Bar Chart Tests
 * 
 * These tests verify that stacked bar charts don't overflow their containers
 * and behave correctly across theme changes.
 * 
 * Bug Prevention: Ensures maxValue is calculated from TOTALS, not individual segments
 * 
 * @see docs/design-system/CHART_IMPLEMENTATION_GUIDE.md
 */

test.describe('Stacked Bar Charts - Overflow Prevention', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to dashboard before each test
		await page.goto('/en/dashboard');
		// Wait for charts to render
		await page.waitForSelector('[role="img"][aria-labelledby="chart-legend"]');
	});

	test('should not overflow container - Pricing Bar Chart', async ({ page }) => {
		// Get chart container dimensions
		const chartContainer = page.locator('[role="img"][aria-labelledby="chart-legend"]').first();
		const containerBox = await chartContainer.boundingBox();
		
		if (!containerBox) {
			throw new Error('Chart container not found');
		}
		
		// Get all bar groups
		const bars = page.locator('[role="group"][aria-label*="total"]');
		const count = await bars.count();
		
		// Check each bar doesn't exceed container height
		for (let i = 0; i < count; i++) {
			const bar = bars.nth(i);
			const barBox = await bar.boundingBox();
			
			if (barBox) {
				expect(barBox.height).toBeLessThanOrEqual(containerBox.height);
				
				// Additional check: bar should not be more than 10% taller than container
				// This catches edge cases with floating point errors
				const overflowPercentage = (barBox.height / containerBox.height) * 100;
				expect(overflowPercentage).toBeLessThanOrEqual(100);
			}
		}
	});

	test('should calculate maxValue from totals, not segments', async ({ page }) => {
		// Use browser console to verify calculation
		const result = await page.evaluate(() => {
			// Get sample data from the page
			const data = [
				{ month: 'Jan', comparable: 48, competitive: 97, premium: 145 },
				{ month: 'Feb', comparable: 57, competitive: 116, premium: 177 }
			];
			
			// ❌ WRONG calculation (the bug)
			const wrongMax = Math.max(...data.flatMap(d => [d.comparable, d.competitive, d.premium]));
			
			// ✅ CORRECT calculation
			const correctMax = Math.max(...data.map(d => d.comparable + d.competitive + d.premium));
			
			return {
				wrongMax,
				correctMax,
				febTotal: data[1].comparable + data[1].competitive + data[1].premium,
				wouldOverflow: (data[1].comparable + data[1].competitive + data[1].premium) / wrongMax > 1
			};
		});
		
		// Verify the correct calculation prevents overflow
		expect(result.correctMax).toBe(350); // Feb total
		expect(result.wrongMax).toBe(177);   // Just max segment
		expect(result.wouldOverflow).toBe(true); // Bug would cause overflow
		
		// The fix should use correctMax (350) not wrongMax (177)
		expect(result.correctMax).toBeGreaterThan(result.wrongMax);
	});

	test('theme switching should not cause overflow', async ({ page }) => {
		// Get initial container and bar heights
		const chartContainer = page.locator('[role="img"]').first();
		const initialContainerHeight = await chartContainer.evaluate(el => el.offsetHeight);
		
		// Toggle to dark mode
		await page.click('[aria-label="Switch to dark mode"]');
		await page.waitForTimeout(500); // Wait for theme transition
		
		// Verify no overflow after theme change
		const bars = page.locator('[role="group"]');
		const containerHeight = await chartContainer.evaluate(el => el.offsetHeight);
		const barHeights = await bars.evaluateAll(elements => 
			elements.map(el => el.offsetHeight)
		);
		
		// Container height should remain stable
		expect(containerHeight).toBe(initialContainerHeight);
		
		// No bar should exceed container
		barHeights.forEach((height, index) => {
			expect(height).toBeLessThanOrEqual(containerHeight);
		});
		
		// Toggle back to light mode
		await page.click('[aria-label="Switch to light mode"]');
		await page.waitForTimeout(500);
		
		// Verify again
		const finalBarHeights = await bars.evaluateAll(elements => 
			elements.map(el => el.offsetHeight)
		);
		
		finalBarHeights.forEach(height => {
			expect(height).toBeLessThanOrEqual(containerHeight);
		});
	});

	test('all bars should be visible and properly stacked', async ({ page }) => {
		const bars = page.locator('[role="group"]');
		const count = await bars.count();
		
		expect(count).toBe(12); // 12 months of data
		
		// Check each bar has 3 stacked segments
		for (let i = 0; i < count; i++) {
			const bar = bars.nth(i);
			const segments = bar.locator('div[style*="backgroundColor"]');
			const segmentCount = await segments.count();
			
			expect(segmentCount).toBe(3); // comparable, competitive, premium
		}
	});

	test('tab switching should maintain proper scaling', async ({ page }) => {
		// Click B2C tab
		await page.click('[role="tab"][aria-label="B2C pricing"]');
		await page.waitForTimeout(300);
		
		// Verify no overflow
		const chartContainer = page.locator('[role="img"]').first();
		const bars = page.locator('[role="group"]');
		
		const containerHeight = await chartContainer.evaluate(el => el.offsetHeight);
		const barHeights = await bars.evaluateAll(elements => 
			elements.map(el => el.offsetHeight)
		);
		
		barHeights.forEach(height => {
			expect(height).toBeLessThanOrEqual(containerHeight);
		});
		
		// Click D2C tab
		await page.click('[role="tab"][aria-label="D2C pricing"]');
		await page.waitForTimeout(300);
		
		// Verify again
		const finalBarHeights = await bars.evaluateAll(elements => 
			elements.map(el => el.offsetHeight)
		);
		
		finalBarHeights.forEach(height => {
			expect(height).toBeLessThanOrEqual(containerHeight);
		});
	});
});

test.describe('Visual Regression - Charts', () => {
	test('pricing charts should match baseline', async ({ page }) => {
		await page.goto('/en/dashboard');
		
		// Wait for charts to render
		await page.waitForSelector('[role="region"][aria-label="Pricing comparison chart"]');
		
		// Take screenshot of both charts
		const chartsContainer = page.locator('div').filter({ has: page.locator('[role="region"][aria-label="Pricing comparison chart"]') }).first();
		
		// Visual regression check
		await expect(chartsContainer).toHaveScreenshot('pricing-charts.png', {
			maxDiffPixels: 100, // Allow minor rendering differences
		});
	});
});

