import { NextRequest } from 'next/server'
import { withAuth } from '../auth'
import { getServerSession } from 'next-auth'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma — withAuth uses a dynamic import (`await import("@/lib/prismaDb")`)
// so we mock the path it actually imports from.
jest.mock('@/lib/prismaDb', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Auth Middleware', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV
  let mockRequest: NextRequest
  let mockHandler: jest.Mock

  beforeEach(() => {
    // Force production branch so the `NODE_ENV === 'development'` bypass does
    // not short-circuit our assertions.
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'test'
    mockRequest = new NextRequest('http://localhost:3000/api/test')
    mockHandler = jest.fn().mockResolvedValue(new Response('OK'))
  })

  afterEach(() => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = ORIGINAL_NODE_ENV
    jest.clearAllMocks()
  })

  it('should allow authenticated user', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any)

    const { prisma } = require('@/lib/prismaDb')
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
    })

    // withAuth(handler) returns a wrapped request handler.
    const wrapped = withAuth(mockHandler as any)
    const response = await wrapped(mockRequest)

    expect(response).toBeDefined()
    expect(mockHandler).toHaveBeenCalledTimes(1)
    const calledWith = mockHandler.mock.calls[0][0]
    expect(calledWith.user).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
    })
  })

  it('should reject unauthenticated request', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const wrapped = withAuth(mockHandler as any)
    const response = await wrapped(mockRequest)

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should reject request with invalid user', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any)

    const { prisma } = require('@/lib/prismaDb')
    prisma.user.findUnique.mockResolvedValue(null)

    const wrapped = withAuth(mockHandler as any)
    const response = await wrapped(mockRequest)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'User not found' })
    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should handle database errors', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any)

    const { prisma } = require('@/lib/prismaDb')
    prisma.user.findUnique.mockRejectedValue(new Error('Database error'))

    const wrapped = withAuth(mockHandler as any)
    const response = await wrapped(mockRequest)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
    expect(mockHandler).not.toHaveBeenCalled()
  })
})
