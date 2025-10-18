import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
	try {
		const session = await getAuthSession();
		return NextResponse.json(session ?? null);
	} catch {
		return NextResponse.json(null, { status: 200 });
	}
}
