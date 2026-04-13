#!/usr/bin/env node

/**
 * Apply Prisma migrations to self-hosted PostgreSQL database
 * This script applies pending migrations via Prisma
 */

const { execSync } = require('child_process');
const path = require('path');

// Ensure we're in the right directory
process.chdir(path.join(__dirname, '..'));

console.log('🚀 Starting database migration...');
console.log('📍 Database:', process.env.DATABASE_URL?.split('@')[1] || 'Not configured');

try {
  // Run Prisma migrations
  console.log('\n📋 Applying pending migrations...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✅ Migrations applied successfully!');
  
  // Generate Prisma client
  console.log('\n📦 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('\n✨ Setup complete! You can now run: npm run dev');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Verify DATABASE_URL and DIRECT_URL are correct in .env');
  console.error('2. Ensure PostgreSQL server at 10.10.10.213:5432 is running');
  console.error('3. Check that Tailscale connection is active');
  console.error('\nManual alternative: Run the SQL from prisma/migrations/0_sync_schema/migration.sql directly in your database');
  process.exit(1);
}
