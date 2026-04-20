// Shared Prisma mock for tests
export const prisma = {
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  docFeedback: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};
