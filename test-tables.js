const { PrismaClient } = require('@prisma/client');

async function listTables() {
  const prisma = new PrismaClient();
  
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%product%'
    `;
    
    console.log('Product-related tables:');
    tables.forEach(t => console.log('- ' + t.table_name));
    
    // Also check for any table with a large row count
    const allTables = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as row_count
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_tup_ins DESC
      LIMIT 10
    `;
    
    console.log('\nTables with most rows:');
    allTables.forEach(t => console.log(`- ${t.tablename}: ${t.row_count} rows`));
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listTables();
