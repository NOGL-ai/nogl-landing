/**
 * Automatic Migration Runner
 * Attempts to apply pending migrations on first app startup
 * This is a convenience feature for development - not for production
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const MIGRATION_LOCK_FILE = path.join(
  process.cwd(),
  '.migration-attempted.lock'
);
const MAX_ATTEMPTS = 1;

/**
 * Attempt to auto-apply pending migrations
 * Runs only once per session
 */
export async function attemptAutoMigration(): Promise<boolean> {
  // Skip in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  // Skip if database URL is not set
  if (!process.env.DATABASE_URL) {
    return false;
  }

  // Skip if already attempted in this session
  if (fs.existsSync(MIGRATION_LOCK_FILE)) {
    return false;
  }

  try {
    // Create lock file to prevent multiple attempts
    fs.writeFileSync(MIGRATION_LOCK_FILE, Date.now().toString());

    console.log('🔄 Attempting automatic database migration...');

    // Try to apply migrations with timeout
    const startTime = Date.now();
    const timeoutMs = 45000; // 45 second timeout

    const migrationProcess = execSync('npx prisma migrate deploy', {
      timeout: timeoutMs,
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: '1', // Enable colors
      },
    });

    const duration = Date.now() - startTime;
    console.log(
      `✅ Automatic migration completed successfully (${duration}ms)`
    );
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Don't treat timeout or "nothing to migrate" as errors
    if (
      errorMsg.includes('timeout') ||
      errorMsg.includes('No pending migrations') ||
      errorMsg.includes('no migrations to apply')
    ) {
      console.log('ℹ️  Migration check: No migrations needed');
      return true;
    }

    console.warn('⚠️  Automatic migration failed:', errorMsg);
    console.log(
      'You can manually apply migrations later with: npx prisma migrate deploy'
    );
    return false;
  }
}

/**
 * Reset migration lock (for testing/debugging)
 */
export function resetMigrationLock(): void {
  try {
    if (fs.existsSync(MIGRATION_LOCK_FILE)) {
      fs.unlinkSync(MIGRATION_LOCK_FILE);
      console.log('🔄 Migration lock reset');
    }
  } catch (error) {
    console.warn('Could not reset migration lock:', error);
  }
}
