import { test, expect } from '@playwright/test'
import { TestDatabase } from '@/lib/testDb'

test.describe('Products E2E Tests', () => {
  let testData: any

  test.beforeAll(async () => {
    // Setup test database
    await TestDatabase.clean()
    testData = await TestDatabase.seed()
  })

  test.afterAll(async () => {
    await TestDatabase.clean()
    await TestDatabase.disconnect()
  })

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: testData.user.id,
            email: testData.user.email,
            name: testData.user.name,
          },
        }),
      })
    })
  })

  test('should display products list', async ({ page }) => {
    // Mock products API
    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: testData.products.map((product: any) => ({
            ...product,
            brand: testData.brand,
            category: testData.category,
            competitors: [],
            _count: { competitors: 0 },
          })),
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
          filters: {},
        }),
      })
    })

    await page.goto('/test-table')
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
    
    // Check if products are displayed
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(2)
    
    // Check product details
    await expect(page.locator('text=Test Product 1')).toBeVisible()
    await expect(page.locator('text=TEST-001')).toBeVisible()
    await expect(page.locator('text=€15.00')).toBeVisible()
  })

  test('should filter products by search', async ({ page }) => {
    let requestCount = 0
    
    await page.route('**/api/products**', async (route) => {
      requestCount++
      
      if (requestCount === 1) {
        // Initial load
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: testData.products.map((product: any) => ({
              ...product,
              brand: testData.brand,
              category: testData.category,
              competitors: [],
              _count: { competitors: 0 },
            })),
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
            filters: {},
          }),
        })
      } else {
        // Search request
        const url = new URL(route.request().url())
        const search = url.searchParams.get('search')
        
        const filteredProducts = testData.products.filter((product: any) =>
          product.name.toLowerCase().includes(search?.toLowerCase() || '')
        )
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: filteredProducts.map((product: any) => ({
              ...product,
              brand: testData.brand,
              category: testData.category,
              competitors: [],
              _count: { competitors: 0 },
            })),
            pagination: { page: 1, limit: 10, total: filteredProducts.length, totalPages: 1 },
            filters: { search },
          }),
        })
      }
    })

    await page.goto('/test-table')
    
    // Wait for initial load
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible()
    
    // Type in search box
    await page.fill('[data-testid="search-input"]', 'Test Product 1')
    
    // Wait for filtered results
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(1)
    await expect(page.locator('text=Test Product 1')).toBeVisible()
  })

  test('should create new product', async ({ page }) => {
    let requestCount = 0
    
    await page.route('**/api/products**', async (route) => {
      requestCount++
      
      if (route.request().method() === 'GET') {
        // GET request - return products
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: testData.products.map((product: any) => ({
              ...product,
              brand: testData.brand,
              category: testData.category,
              competitors: [],
              _count: { competitors: 0 },
            })),
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
            filters: {},
          }),
        })
      } else if (route.request().method() === 'POST') {
        // POST request - create product
        const body = await route.request().postDataJSON()
        
        const newProduct = {
          id: 'prod-new',
          ...body,
          userId: testData.user.id,
          margin: ((body.price - body.cost) / body.cost) * 100,
          lastUpdated: new Date().toISOString(),
          brand: null,
          category: null,
          competitors: [],
          _count: { competitors: 0 },
        }
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newProduct),
        })
      }
    })

    await page.goto('/test-table')
    
    // Click add product button
    await page.click('[data-testid="add-product-button"]')
    
    // Fill product form
    await page.fill('[data-testid="product-name-input"]', 'New E2E Product')
    await page.fill('[data-testid="product-sku-input"]', 'E2E-001')
    await page.fill('[data-testid="product-description-input"]', 'A product created in E2E test')
    await page.fill('[data-testid="product-cost-input"]', '20.00')
    await page.fill('[data-testid="product-price-input"]', '30.00')
    
    // Submit form
    await page.click('[data-testid="submit-product-button"]')
    
    // Wait for success message
    await expect(page.locator('text=Product created successfully')).toBeVisible()
  })

  test('should update product', async ({ page }) => {
    let requestCount = 0
    
    await page.route('**/api/products**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: testData.products.map((product: any) => ({
              ...product,
              brand: testData.brand,
              category: testData.category,
              competitors: [],
              _count: { competitors: 0 },
            })),
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
            filters: {},
          }),
        })
      }
    })
    
    await page.route('**/api/products/*', async (route) => {
      if (route.request().method() === 'PUT') {
        const body = await route.request().postDataJSON()
        
        const updatedProduct = {
          id: testData.products[0].id,
          ...body,
          userId: testData.user.id,
          margin: ((body.price - body.cost) / body.cost) * 100,
          lastUpdated: new Date().toISOString(),
          brand: testData.brand,
          category: testData.category,
          competitors: [],
          _count: { competitors: 0 },
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updatedProduct),
        })
      }
    })

    await page.goto('/test-table')
    
    // Click edit button on first product
    await page.click('[data-testid="edit-product-button"]:first-of-type')
    
    // Update product name
    await page.fill('[data-testid="product-name-input"]', 'Updated Product Name')
    
    // Submit form
    await page.click('[data-testid="submit-product-button"]')
    
    // Wait for success message
    await expect(page.locator('text=Product updated successfully')).toBeVisible()
  })

  test('should delete product', async ({ page }) => {
    let requestCount = 0
    
    await page.route('**/api/products**', async (route) => {
      if (route.request().method() === 'GET') {
        requestCount++
        
        if (requestCount === 1) {
          // Initial load
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              products: testData.products.map((product: any) => ({
                ...product,
                brand: testData.brand,
                category: testData.category,
                competitors: [],
                _count: { competitors: 0 },
              })),
              pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
              filters: {},
            }),
          })
        } else {
          // After deletion
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              products: testData.products.slice(1).map((product: any) => ({
                ...product,
                brand: testData.brand,
                category: testData.category,
                competitors: [],
                _count: { competitors: 0 },
              })),
              pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
              filters: {},
            }),
          })
        }
      }
    })
    
    await page.route('**/api/products/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Product deleted successfully' }),
        })
      }
    })

    await page.goto('/test-table')
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(2)
    
    // Click delete button on first product
    await page.click('[data-testid="delete-product-button"]:first-of-type')
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Wait for success message
    await expect(page.locator('text=Product deleted successfully')).toBeVisible()
    
    // Verify product is removed from list
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(1)
  })

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    await page.goto('/test-table')
    
    // Wait for error message
    await expect(page.locator('text=Failed to load products')).toBeVisible()
  })
})
