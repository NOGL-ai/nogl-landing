import { NextRequest } from 'next/server'
import { createMocks } from 'node-mocks-http'

export class TestUtils {
  /**
   * Create a mock NextRequest for testing
   */
  static createMockRequest(options: {
    method?: string
    url?: string
    body?: any
    headers?: Record<string, string>
    query?: Record<string, string>
  } = {}): NextRequest {
    const {
      method = 'GET',
      url = 'http://localhost:3000/api/test',
      body,
      headers = {},
      query = {},
    } = options

    const urlWithQuery = new URL(url)
    Object.entries(query).forEach(([key, value]) => {
      urlWithQuery.searchParams.set(key, value)
    })

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    if (body) {
      requestInit.body = JSON.stringify(body)
    }

    return new NextRequest(urlWithQuery.toString(), requestInit)
  }

  /**
   * Create a mock user object for testing
   */
  static createMockUser(overrides: any = {}) {
    return {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      ...overrides,
    }
  }

  /**
   * Create a mock product object for testing
   */
  static createMockProduct(overrides: any = {}) {
    return {
      id: 'prod-1',
      name: 'Test Product',
      sku: 'TEST-001',
      description: 'A test product',
      image: 'https://example.com/image.jpg',
      productUrl: 'https://example.com/product',
      cost: 10.00,
      price: 15.00,
      currency: 'EUR',
      minPrice: 12.00,
      maxPrice: 18.00,
      margin: 50.0,
      stock: 100,
      status: 'ACTIVE',
      featured: true,
      channel: 'online',
      categoryId: 'cat-1',
      brandId: 'brand-1',
      triggeredRule: 'price-drop',
      userId: 'user-1',
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Create a mock brand object for testing
   */
  static createMockBrand(overrides: any = {}) {
    return {
      id: 'brand-1',
      name: 'Test Brand',
      logo: 'https://example.com/logo.png',
      website: 'https://testbrand.com',
      description: 'A test brand',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Create a mock category object for testing
   */
  static createMockCategory(overrides: any = {}) {
    return {
      id: 'cat-1',
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category',
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Create a mock competitor object for testing
   */
  static createMockCompetitor(overrides: any = {}) {
    return {
      id: 'comp-1',
      productId: 'prod-1',
      name: 'Competitor Store',
      url: 'https://competitor.com/product',
      cheapest: 12.00,
      avg: 15.00,
      highest: 18.00,
      cheapestColor: 'green',
      lastChecked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }
  }

  /**
   * Wait for a specified amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Generate random string for testing
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Generate random email for testing
   */
  static randomEmail(): string {
    return `test-${this.randomString(8)}@example.com`
  }

  /**
   * Generate random SKU for testing
   */
  static randomSku(): string {
    return `TEST-${this.randomString(6).toUpperCase()}`
  }

  /**
   * Create pagination response for testing
   */
  static createPaginationResponse(data: any[], page: number = 1, limit: number = 10) {
    const total = data.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }
  }

  /**
   * Create error response for testing
   */
  static createErrorResponse(message: string, status: number = 400) {
    return {
      error: message,
      status,
    }
  }

  /**
   * Create success response for testing
   */
  static createSuccessResponse(data: any, message?: string) {
    return {
      data,
      message,
      success: true,
    }
  }
}
