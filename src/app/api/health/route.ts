import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		ok: true,
		ts: new Date().toISOString(),
		nodeEnv: process.env.NODE_ENV ?? "unknown",
	});
}
