import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Docker health checks and monitoring systems
 */
export async function GET() {
	try {
		// Basic health check - just return 200 if the server is responding
		return NextResponse.json(
			{
				status: 'healthy',
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				status: 'unhealthy',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 503 }
		);
	}
}

