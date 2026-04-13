import { initializeDatabase, isDatabaseReady } from '@/lib/initializeDatabase';
import { NextResponse } from 'next/server';

// Note: auto-migration is handled via the safe build wrapper
// This endpoint just verifies database state

export async function POST() {
  try {
    // Initialize database (check schema, etc.)
    await initializeDatabase();

    // Check if database is ready
    const isReady = await isDatabaseReady();

    return NextResponse.json(
      {
        status: isReady ? 'ok' : 'degraded',
        databaseReady: isReady,
        message: isReady
          ? 'Database ready'
          : 'Database schema not fully initialized - migrations may be needed',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('Health check error:', errorMessage);

    return NextResponse.json(
      {
        status: 'degraded',
        message: 'Database check failed - app running with limited functionality',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    ); // Return 200 even on failure so app doesn't break
  }
}

export async function GET() {
  try {
    const isReady = await isDatabaseReady();

    return NextResponse.json(
      {
        status: isReady ? 'ok' : 'degraded',
        databaseReady: isReady,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
