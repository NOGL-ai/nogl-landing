import { NextRequest } from 'next/server'
import { withValidation, withQueryValidation } from '../validation'
import * as yup from 'yup'

describe('Validation Middleware', () => {
  let mockRequest: NextRequest
  let mockHandler: jest.Mock

  beforeEach(() => {
    mockHandler = jest.fn().mockResolvedValue(new Response('OK'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('withValidation', () => {
    const testSchema = yup.object({
      name: yup.string().required('Name is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      age: yup.number().positive('Age must be positive').required('Age is required'),
    })

    it('should validate valid request body', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      }

      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify(validData),
        headers: { 'Content-Type': 'application/json' },
      })

      const wrappedHandler = withValidation(testSchema, mockHandler)
      const response = await wrappedHandler(mockRequest)

      expect(response).toBeDefined()
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, validData)
    })

    it('should reject invalid request body', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        age: -5,
      }

      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const wrappedHandler = withValidation(testSchema, mockHandler)
      const response = await wrappedHandler(mockRequest)

      expect(response.status).toBe(400)
      const errorData = await response.json()
      expect(errorData.error).toBe('Validation failed')
      expect(errorData.details).toHaveLength(3)
      expect(mockHandler).not.toHaveBeenCalled()
    })

    it('should handle malformed JSON', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const wrappedHandler = withValidation(testSchema, mockHandler)
      const response = await wrappedHandler(mockRequest)

      expect(response.status).toBe(400)
      const errorData = await response.json()
      expect(errorData.error).toBe('Invalid request body')
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })

  describe('withQueryValidation', () => {
    const querySchema = yup.object({
      page: yup.number().integer().min(1).default(1),
      limit: yup.number().integer().min(1).max(100).default(20),
      search: yup.string().optional(),
      featured: yup.boolean().optional(),
    })

    it('should validate valid query parameters', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test?page=2&limit=20&search=test&featured=true')

      const wrappedHandler = withQueryValidation(querySchema, mockHandler)
      const response = await wrappedHandler(mockRequest)

      expect(response).toBeDefined()
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        page: 2,
        limit: 20,
        search: 'test',
        featured: true,
      })
    })

    it('should use default values for missing parameters', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test')

      const wrappedHandler = withQueryValidation(querySchema, mockHandler)
      const response = await wrappedHandler(mockRequest)

      expect(response).toBeDefined()
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
        page: 1,
        limit: 10,
        search: undefined,
        featured: undefined,
      })
    })

    it('should reject invalid query parameters', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test?page=0&limit=200&featured=invalid')

      const wrappedHandler = withQueryValidation(querySchema, mockHandler)
      const response = await wrappedHandler(mockRequest)

      expect(response.status).toBe(400)
      const errorData = await response.json()
      expect(errorData.error).toBe('Query validation failed')
      expect(errorData.details).toHaveLength(3)
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })
})
