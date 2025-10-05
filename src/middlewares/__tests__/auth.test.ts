import { NextRequest } from 'next/server'
import { withAuth } from '../auth'
import { getServerSession } from 'next-auth'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('../../lib/prismaDb', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Auth Middleware', () => {
  let mockRequest: NextRequest
  let mockHandler: jest.Mock

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/test')
    mockHandler = jest.fn().mockResolvedValue(new Response('OK'))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should allow authenticated user', async () => {
    // Mock authenticated session
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock user found in database
    const { prisma } = require('../../lib/prismaDb')
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
    })

    const response = await withAuth(mockRequest, mockHandler)

    expect(response).toBeDefined()
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      })
    )
  })

  it('should reject unauthenticated request', async () => {
    // Mock no session
    mockGetServerSession.mockResolvedValue(null)

    const response = await withAuth(mockRequest, mockHandler)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should reject request with invalid user', async () => {
    // Mock session but user not found in database
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    const { prisma } = require('../../lib/prismaDb')
    prisma.user.findUnique.mockResolvedValue(null)

    const response = await withAuth(mockRequest, mockHandler)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'User not found' })
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    // Mock session
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Mock database error
    const { prisma } = require('../../lib/prismaDb')
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'))

    const response = await withAuth(mockRequest, mockHandler)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
    expect(mockHandler).not.toHaveBeenCalled()
  })
})
