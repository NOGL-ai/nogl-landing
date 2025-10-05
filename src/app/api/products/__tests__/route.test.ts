import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { prismaMock } from '@/__mocks__/prisma'

// Mock the auth middleware
jest.mock('../../../middlewares/auth', () => ({
  withAuth: (request: any, handler: any) => handler(request, { user: { id: 'user-1', email: 'test@example.com', role: 'USER' } }),
}))

// Mock the validation middleware
jest.mock('../../../middlewares/validation', () => ({
  withQueryValidation: (schema: any, handler: any) => (request: any, query: any) => handler(request, query),
  withValidation: (schema: any, handler: any) => (request: any, data: any) => handler(request, data),
}))

// Mock security middleware
jest.mock('../../../middlewares/security', () => ({
  withRequestLogging: (handler: any) => handler,
  withSecurityHeaders: (response: any) => response,
}))

// Mock rate limiting
jest.mock('../../../middlewares/rateLimit', () => ({
  withRateLimit: () => (handler: any) => handler,
}))

describe('/api/products', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'USER',
  }

  const mockRequest = (overrides = {}) => ({
    user: mockUser,
    ...overrides,
  } as any)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product 1',
          sku: 'TEST-001',
          price: 15.00,
          cost: 10.00,
          status: 'ACTIVE',
          featured: true,
          brand: { id: 'brand-1', name: 'Test Brand', logo: null },
          category: { id: 'cat-1', name: 'Test Category', slug: 'test-category' },
          competitors: [],
          _count: { competitors: 0 },
        },
        {
          id: 'prod-2',
          name: 'Test Product 2',
          sku: 'TEST-002',
          price: 25.00,
          cost: 20.00,
          status: 'ACTIVE',
          featured: false,
          brand: { id: 'brand-1', name: 'Test Brand', logo: null },
          category: { id: 'cat-1', name: 'Test Category', slug: 'test-category' },
          competitors: [],
          _count: { competitors: 0 },
        },
      ]

      prismaMock.product.findMany.mockResolvedValue(mockProducts)
      prismaMock.product.count.mockResolvedValue(2)

      const request = mockRequest()
      const response = await GET(request, {
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        featured: undefined,
        channel: undefined,
        categoryId: undefined,
        brandId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.products).toHaveLength(2)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      })
    })

    it('should filter products by search term', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Test Product',
          sku: 'TEST-001',
          price: 15.00,
          cost: 10.00,
          status: 'ACTIVE',
          featured: true,
          brand: { id: 'brand-1', name: 'Test Brand', logo: null },
          category: { id: 'cat-1', name: 'Test Category', slug: 'test-category' },
          competitors: [],
          _count: { competitors: 0 },
        },
      ]

      prismaMock.product.findMany.mockResolvedValue(mockProducts)
      prismaMock.product.count.mockResolvedValue(1)

      const request = mockRequest()
      const response = await GET(request, {
        page: 1,
        limit: 10,
        search: 'Test',
        status: undefined,
        featured: undefined,
        channel: undefined,
        categoryId: undefined,
        brandId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            OR: [
              { name: { contains: 'Test', mode: 'insensitive' } },
              { sku: { contains: 'Test', mode: 'insensitive' } },
              { description: { contains: 'Test', mode: 'insensitive' } },
            ],
          }),
        })
      )
    })

    it('should filter products by status', async () => {
      prismaMock.product.findMany.mockResolvedValue([])
      prismaMock.product.count.mockResolvedValue(0)

      const request = mockRequest()
      const response = await GET(request, {
        page: 1,
        limit: 10,
        search: undefined,
        status: 'ACTIVE',
        featured: undefined,
        channel: undefined,
        categoryId: undefined,
        brandId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            status: 'ACTIVE',
          }),
        })
      )
    })

    it('should handle database errors', async () => {
      prismaMock.product.findMany.mockRejectedValue(new Error('Database error'))

      const request = mockRequest()
      const response = await GET(request, {
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        featured: undefined,
        channel: undefined,
        categoryId: undefined,
        brandId: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        sku: 'NEW-001',
        description: 'A new product',
        cost: 10.00,
        price: 15.00,
        currency: 'EUR',
        status: 'ACTIVE',
        featured: false,
      }

      const createdProduct = {
        id: 'prod-new',
        ...newProduct,
        userId: 'user-1',
        margin: 50.0,
        lastUpdated: new Date(),
        brand: null,
        category: null,
        competitors: [],
        _count: { competitors: 0 },
      }

      prismaMock.product.findUnique.mockResolvedValue(null) // SKU doesn't exist
      prismaMock.product.create.mockResolvedValue(createdProduct)

      const request = mockRequest()
      const response = await POST(request, newProduct)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.name).toBe('New Product')
      expect(data.sku).toBe('NEW-001')
      expect(data.margin).toBe(50.0)
    })

    it('should reject duplicate SKU', async () => {
      const newProduct = {
        name: 'New Product',
        sku: 'EXISTING-001',
        description: 'A new product',
        cost: 10.00,
        price: 15.00,
        currency: 'EUR',
        status: 'ACTIVE',
        featured: false,
      }

      prismaMock.product.findUnique.mockResolvedValue({
        id: 'existing-prod',
        sku: 'EXISTING-001',
      })

      const request = mockRequest()
      const response = await POST(request, newProduct)

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toBe('Product with this SKU already exists')
    })

    it('should calculate margin automatically', async () => {
      const newProduct = {
        name: 'New Product',
        sku: 'NEW-002',
        description: 'A new product',
        cost: 20.00,
        price: 30.00,
        currency: 'EUR',
        status: 'ACTIVE',
        featured: false,
      }

      const createdProduct = {
        id: 'prod-new-2',
        ...newProduct,
        userId: 'user-1',
        margin: 50.0,
        lastUpdated: new Date(),
        brand: null,
        category: null,
        competitors: [],
        _count: { competitors: 0 },
      }

      prismaMock.product.findUnique.mockResolvedValue(null)
      prismaMock.product.create.mockResolvedValue(createdProduct)

      const request = mockRequest()
      const response = await POST(request, newProduct)

      expect(prismaMock.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            margin: 50.0, // (30 - 20) / 20 * 100
          }),
        })
      )
    })

    it('should handle database errors during creation', async () => {
      const newProduct = {
        name: 'New Product',
        sku: 'NEW-003',
        description: 'A new product',
        cost: 10.00,
        price: 15.00,
        currency: 'EUR',
        status: 'ACTIVE',
        featured: false,
      }

      prismaMock.product.findUnique.mockResolvedValue(null)
      prismaMock.product.create.mockRejectedValue(new Error('Database error'))

      const request = mockRequest()
      const response = await POST(request, newProduct)

      expect(response.status).toBe(500)
    })
  })
})
