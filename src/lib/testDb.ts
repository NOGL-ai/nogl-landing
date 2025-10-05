import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const testPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = testPrisma

// Test database utilities
export class TestDatabase {
  static async clean() {
    const tablenames = await testPrisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ')

    try {
      await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
    } catch (error) {
      console.log({ error })
    }
  }

  static async seed() {
    // Create test user
    const testUser = await testPrisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    })

    // Create test brand
    const testBrand = await testPrisma.brand.upsert({
      where: { name: 'Test Brand' },
      update: {},
      create: {
        name: 'Test Brand',
        logo: 'https://example.com/logo.png',
        website: 'https://testbrand.com',
      },
    })

    // Create test category
    const testCategory = await testPrisma.category.upsert({
      where: { name: 'Test Category' },
      update: {},
      create: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
      },
    })

    // Create test products
    const testProducts = await Promise.all([
      testPrisma.product.upsert({
        where: { sku: 'TEST-001' },
        update: {},
        create: {
          name: 'Test Product 1',
          sku: 'TEST-001',
          description: 'A test product',
          cost: 10.00,
          price: 15.00,
          currency: 'EUR',
          status: 'ACTIVE',
          featured: true,
          userId: testUser.id,
          brandId: testBrand.id,
          categoryId: testCategory.id,
        },
      }),
      testPrisma.product.upsert({
        where: { sku: 'TEST-002' },
        update: {},
        create: {
          name: 'Test Product 2',
          sku: 'TEST-002',
          description: 'Another test product',
          cost: 20.00,
          price: 30.00,
          currency: 'EUR',
          status: 'ACTIVE',
          featured: false,
          userId: testUser.id,
          brandId: testBrand.id,
          categoryId: testCategory.id,
        },
      }),
    ])

    return {
      user: testUser,
      brand: testBrand,
      category: testCategory,
      products: testProducts,
    }
  }

  static async disconnect() {
    await testPrisma.$disconnect()
  }
}
