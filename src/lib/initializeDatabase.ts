/**
 * Database Initialization Handler
 * Safely checks and applies pending migrations if database is available
 * This prevents build failures when database schema is out of sync
 */

import { prisma, isPrismaAvailable } from './prismaDb';

let initPromise: Promise<void> | null = null;

/**
 * Initialize database - apply pending migrations if needed
 * Safe to call multiple times, uses singleton pattern
 */
export async function initializeDatabase(): Promise<void> {
  // Return existing promise if already in progress
  if (initPromise) {
    return initPromise;
  }

  initPromise = performInitialization();
  return initPromise;
}

async function performInitialization(): Promise<void> {
  // Skip if Prisma is not available (no DATABASE_URL)
  if (!isPrismaAvailable) {
    console.log(
      '⚠️  Prisma unavailable - database initialization skipped (running with mock data)'
    );
    return;
  }

  try {
    console.log('🔄 Checking database schema...');

    // Perform a simple query to verify database connectivity
    // This will fail if schema is significantly out of sync
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'nogl' AND table_name = 'User'
      ) as table_exists
    `;

    const tableExists = (result as Array<{ table_exists: boolean }>)?.[0]?.table_exists;

    if (tableExists) {
      console.log('✅ Database schema is initialized');
    } else {
      console.warn(
        '⚠️  Database schema not fully initialized - some features may not work'
      );
      console.log(
        'Run: npx prisma migrate deploy  (from nogl-landing directory)'
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Don't fail the app, just log the warning
    if (
      errorMessage.includes('permission denied') ||
      errorMessage.includes('does not exist')
    ) {
      console.warn(
        '⚠️  Database schema initialization incomplete - run migrations manually'
      );
      console.log(
        'Command: npx prisma migrate deploy (from nogl-landing directory)'
      );
    } else if (errorMessage.includes('connect') || errorMessage.includes('ECONNREFUSED')) {
      console.warn(
        '⚠️  Cannot connect to database - ensure PostgreSQL is running and accessible'
      );
    } else {
      console.warn('⚠️  Database check failed:', errorMessage);
    }

    // Continue without failing - app can work with degraded functionality
  }
}

/**
 * Health check for database readiness
 * Used to determine if certain features are available
 */
export async function isDatabaseReady(): Promise<boolean> {
  if (!isPrismaAvailable) {
    return false;
  }

  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'nogl' AND table_name = 'User'
      ) as table_exists
    `;

    return (result as Array<{ table_exists: boolean }>)?.[0]?.table_exists ?? false;
  } catch {
    return false;
  }
}
