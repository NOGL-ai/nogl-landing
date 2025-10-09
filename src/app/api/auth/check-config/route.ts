import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check NextAuth configuration
 * Access at: /api/auth/check-config
 */
export async function GET() {
	const config = {
		hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
		hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
		nextAuthUrl: process.env.NEXTAUTH_URL,
		hasDatabaseUrl: !!process.env.DATABASE_URL,
		hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
		hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
		hasEmailConfig: {
			host: !!process.env.EMAIL_SERVER_HOST,
			port: !!process.env.EMAIL_SERVER_PORT,
			user: !!process.env.EMAIL_SERVER_USER,
			password: !!process.env.EMAIL_SERVER_PASSWORD,
			from: !!process.env.EMAIL_FROM,
		},
		nodeEnv: process.env.NODE_ENV,
	};

	const missingRequired = [];
	if (!config.hasNextAuthSecret) missingRequired.push("NEXTAUTH_SECRET");
	if (!config.hasNextAuthUrl) missingRequired.push("NEXTAUTH_URL");
	if (!config.hasDatabaseUrl) missingRequired.push("DATABASE_URL");

	return NextResponse.json({
		status: missingRequired.length === 0 ? "OK" : "MISSING_CONFIG",
		config,
		missingRequired,
		message:
			missingRequired.length === 0
				? "All required environment variables are set"
				: `Missing required variables: ${missingRequired.join(", ")}`,
	});
}

