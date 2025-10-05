import {
  productSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  brandSchema,
  categorySchema,
  competitorSchema,
} from '../product'

describe('Product Validation Schemas', () => {
  describe('productSchema', () => {
    const validProduct = {
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
      categoryId: 'cat-123',
      brandId: 'brand-123',
      triggeredRule: 'price-drop',
    }

    it('should validate valid product data', async () => {
      await expect(productSchema.validate(validProduct)).resolves.toEqual(validProduct)
    })

    it('should reject missing required fields', async () => {
      const invalidProduct = { ...validProduct }
      delete invalidProduct.name

      await expect(productSchema.validate(invalidProduct)).rejects.toThrow('Product name is required')
    })

    it('should reject invalid email format', async () => {
      const invalidProduct = { ...validProduct, image: 'not-a-url' }

      await expect(productSchema.validate(invalidProduct)).rejects.toThrow('Invalid image URL')
    })

    it('should reject negative prices', async () => {
      const invalidProduct = { ...validProduct, price: -10 }

      await expect(productSchema.validate(invalidProduct)).rejects.toThrow('Price must be positive')
    })

    it('should reject invalid status', async () => {
      const invalidProduct = { ...validProduct, status: 'INVALID' }

      await expect(productSchema.validate(invalidProduct)).rejects.toThrow('status must be one of')
    })

    it('should reject margin over 100%', async () => {
      const invalidProduct = { ...validProduct, margin: 150 }

      await expect(productSchema.validate(invalidProduct)).rejects.toThrow('Margin cannot exceed 100%')
    })
  })

  describe('createProductSchema', () => {
    it('should be same as productSchema', () => {
      expect(createProductSchema).toBe(productSchema)
    })
  })

  describe('updateProductSchema', () => {
    it('should allow partial updates', async () => {
      const partialUpdate = {
        id: 'prod-123',
        name: 'Updated Product',
        price: 20.00,
      }

      const result = await updateProductSchema.validate(partialUpdate)
      expect(result.id).toBe('prod-123')
      expect(result.name).toBe('Updated Product')
      expect(result.price).toBe(20.00)
    })

    it('should require id field', async () => {
      const updateWithoutId = {
        name: 'Updated Product',
      }

      await expect(updateProductSchema.validate(updateWithoutId)).rejects.toThrow('Product ID is required')
    })
  })

  describe('productQuerySchema', () => {
    it('should validate valid query parameters', async () => {
      const validQuery = {
        page: 2,
        limit: 20,
        search: 'test',
        status: 'ACTIVE',
        featured: true,
        channel: 'online',
        categoryId: 'cat-123',
        brandId: 'brand-123',
        minPrice: 10.00,
        maxPrice: 50.00,
        sortBy: 'name',
        sortOrder: 'asc',
      }

      await expect(productQuerySchema.validate(validQuery)).resolves.toEqual(validQuery)
    })

    it('should use default values', async () => {
      const minimalQuery = {}

      const result = await productQuerySchema.validate(minimalQuery)
      expect(result).toEqual({
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
    })

    it('should reject invalid page number', async () => {
      const invalidQuery = { page: 0 }

      await expect(productQuerySchema.validate(invalidQuery)).rejects.toThrow('page must be greater than or equal to 1')
    })

    it('should reject limit over 100', async () => {
      const invalidQuery = { limit: 200 }

      await expect(productQuerySchema.validate(invalidQuery)).rejects.toThrow('limit must be less than or equal to 100')
    })
  })

  describe('bulkUpdateSchema', () => {
    it('should validate valid bulk update', async () => {
      const validBulkUpdate = {
        productIds: ['prod-1', 'prod-2', 'prod-3'],
        updates: {
          status: 'ACTIVE',
          featured: true,
        },
      }

      await expect(bulkUpdateSchema.validate(validBulkUpdate)).resolves.toEqual(validBulkUpdate)
    })

    it('should reject empty product IDs array', async () => {
      const invalidBulkUpdate = {
        productIds: [],
        updates: { status: 'ACTIVE' },
      }

      await expect(bulkUpdateSchema.validate(invalidBulkUpdate)).rejects.toThrow('At least one product ID required')
    })

    it('should reject empty updates object', async () => {
      const invalidBulkUpdate = {
        productIds: ['prod-1'],
        updates: {},
      }

      await expect(bulkUpdateSchema.validate(invalidBulkUpdate)).rejects.toThrow('At least one field to update required')
    })
  })

  describe('bulkDeleteSchema', () => {
    it('should validate valid bulk delete', async () => {
      const validBulkDelete = {
        productIds: ['prod-1', 'prod-2', 'prod-3'],
      }

      await expect(bulkDeleteSchema.validate(validBulkDelete)).resolves.toEqual(validBulkDelete)
    })

    it('should reject empty product IDs array', async () => {
      const invalidBulkDelete = {
        productIds: [],
      }

      await expect(bulkDeleteSchema.validate(invalidBulkDelete)).rejects.toThrow('At least one product ID required')
    })
  })

  describe('brandSchema', () => {
    it('should validate valid brand data', async () => {
      const validBrand = {
        name: 'Test Brand',
        logo: 'https://example.com/logo.png',
        website: 'https://testbrand.com',
        description: 'A test brand',
      }

      await expect(brandSchema.validate(validBrand)).resolves.toEqual(validBrand)
    })

    it('should reject missing name', async () => {
      const invalidBrand = {
        logo: 'https://example.com/logo.png',
      }

      await expect(brandSchema.validate(invalidBrand)).rejects.toThrow('Brand name is required')
    })
  })

  describe('categorySchema', () => {
    it('should validate valid category data', async () => {
      const validCategory = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
        parentId: 'parent-123',
      }

      await expect(categorySchema.validate(validCategory)).resolves.toEqual(validCategory)
    })

    it('should reject missing name', async () => {
      const invalidCategory = {
        slug: 'test-category',
      }

      await expect(categorySchema.validate(invalidCategory)).rejects.toThrow('Category name is required')
    })

    it('should reject missing slug', async () => {
      const invalidCategory = {
        name: 'Test Category',
      }

      await expect(categorySchema.validate(invalidCategory)).rejects.toThrow('Category slug is required')
    })
  })

  describe('competitorSchema', () => {
    it('should validate valid competitor data', async () => {
      const validCompetitor = {
        productId: 'prod-123',
        name: 'Competitor Store',
        url: 'https://competitor.com/product',
        cheapest: 12.00,
        avg: 15.00,
        highest: 18.00,
        cheapestColor: 'green',
      }

      await expect(competitorSchema.validate(validCompetitor)).resolves.toEqual(validCompetitor)
    })

    it('should reject negative prices', async () => {
      const invalidCompetitor = {
        productId: 'prod-123',
        name: 'Competitor Store',
        cheapest: -10.00,
        avg: 15.00,
        highest: 18.00,
      }

      await expect(competitorSchema.validate(invalidCompetitor)).rejects.toThrow('Cheapest price must be positive')
    })
  })
})
