const { PrismaClient } = require('@prisma/client');

async function testDbCount() {
  const prisma = new PrismaClient();
  
  try {
    const count = await prisma.products.count();
    console.log('Total products in DB:', count);
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDbCount();
