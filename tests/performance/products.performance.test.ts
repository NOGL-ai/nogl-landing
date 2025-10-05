import { test, expect } from '@playwright/test'

test.describe('Products Performance Tests', () => {
  test('should load products list within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/test-table')
    
    // Wait for products table to be visible
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)
  })

  test('should handle large product lists efficiently', async ({ page }) => {
    // Mock large dataset
    const largeProductList = Array.from({ length: 1000 }, (_, i) => ({
      id: `prod-${i}`,
      name: `Product ${i}`,
      sku: `SKU-${i.toString().padStart(3, '0')}`,
      price: 10 + (i % 100),
      cost: 5 + (i % 50),
      status: 'ACTIVE',
      featured: i % 10 === 0,
    }))

    await page.route('**/api/products**', async (route) => {
      const url = new URL(route.request().url())
      const pageParam = parseInt(url.searchParams.get('page') || '1')
      const limitParam = parseInt(url.searchParams.get('limit') || '10')
      
      const startIndex = (pageParam - 1) * limitParam
      const endIndex = startIndex + limitParam
      const paginatedProducts = largeProductList.slice(startIndex, endIndex)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: paginatedProducts,
          pagination: {
            page: pageParam,
            limit: limitParam,
            total: largeProductList.length,
            totalPages: Math.ceil(largeProductList.length / limitParam),
          },
        }),
      })
    })

    const startTime = Date.now()
    
    await page.goto('/test-table')
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should handle large datasets efficiently
    expect(loadTime).toBeLessThan(3000)
  })

  test('should search products quickly', async ({ page }) => {
    await page.goto('/test-table')
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible()

    const startTime = Date.now()
    
    // Type in search box
    await page.fill('[data-testid="search-input"]', 'test')
    
    // Wait for search results
    await page.waitForResponse('**/api/products**')
    
    const searchTime = Date.now() - startTime
    
    // Search should complete within 1 second
    expect(searchTime).toBeLessThan(1000)
  })

  test('should handle concurrent requests efficiently', async ({ page }) => {
    const requests: Promise<any>[] = []
    
    // Simulate multiple concurrent requests
    for (let i = 0; i < 10; i++) {
      requests.push(
        page.request.get('http://localhost:3000/api/products', {
          headers: { 'Authorization': 'Bearer test-token' }
        })
      )
    }

    const startTime = Date.now()
    
    const responses = await Promise.all(requests)
    
    const totalTime = Date.now() - startTime
    
    // All requests should complete within 5 seconds
    expect(totalTime).toBeLessThan(5000)
    
    // All requests should be successful
    responses.forEach(response => {
      expect(response.status()).toBe(200)
    })
  })

  test('should maintain performance under load', async ({ page }) => {
    const loadTestResults: number[] = []
    
    // Run multiple requests to simulate load
    for (let i = 0; i < 20; i++) {
      const startTime = Date.now()
      
      await page.goto('/test-table')
      await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
      
      const loadTime = Date.now() - startTime
      loadTestResults.push(loadTime)
      
      // Small delay between requests
      await page.waitForTimeout(100)
    }
    
    // Calculate average load time
    const averageLoadTime = loadTestResults.reduce((a, b) => a + b, 0) / loadTestResults.length
    
    // Average load time should be reasonable
    expect(averageLoadTime).toBeLessThan(2000)
    
    // No single request should be extremely slow
    const maxLoadTime = Math.max(...loadTestResults)
    expect(maxLoadTime).toBeLessThan(5000)
  })

  test('should handle memory efficiently', async ({ page }) => {
    // Monitor memory usage during operations
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // Perform various operations
    await page.goto('/test-table')
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
    
    // Simulate filtering
    await page.fill('[data-testid="search-input"]', 'test')
    await page.waitForResponse('**/api/products**')
    
    // Simulate sorting
    await page.click('[data-testid="sort-by-price"]')
    await page.waitForResponse('**/api/products**')
    
    // Simulate pagination
    await page.click('[data-testid="next-page"]')
    await page.waitForResponse('**/api/products**')

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    const memoryIncrease = finalMemory - initialMemory
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })
})
