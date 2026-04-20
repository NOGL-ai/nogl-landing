import { NextResponse, type NextRequest } from "next/server";

import { getAssetDetail } from "@/actions/marketing-assets";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		const detail = await getAssetDetail(id);
		if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json(detail);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		const status = message === "Unauthorized" ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}
