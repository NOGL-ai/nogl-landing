import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaDb';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if models are available
    const checks = {
      database: '✅ Connected',
      competitor: typeof prisma.competitor !== 'undefined' ? '✅ Available' : '❌ Missing',
      user: typeof prisma.user !== 'undefined' ? '✅ Available' : '❌ Missing',
      account: typeof prisma.account !== 'undefined' ? '✅ Available' : '❌ Missing',
      session: typeof prisma.session !== 'undefined' ? '✅ Available' : '❌ Missing',
    };
    
    const allHealthy = Object.values(checks).every(v => v.includes('✅'));
    
    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    }, { status: allHealthy ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}