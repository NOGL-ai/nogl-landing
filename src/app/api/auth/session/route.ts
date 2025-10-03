import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		return NextResponse.json(session ?? null);
	} catch {
		return NextResponse.json(null, { status: 200 });
	}
}
