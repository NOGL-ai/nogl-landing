import { NextResponse, type NextRequest } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { signedGetUrl } from "@/lib/storage/r2";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
	const session = await getAuthSession();
	if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { key } = await ctx.params;
	try {
		const url = await signedGetUrl(decodeURIComponent(key), 3600);
		return NextResponse.redirect(url);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
