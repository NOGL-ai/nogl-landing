import { NextResponse, type NextRequest } from "next/server";

import { listProductEditorItems } from "@/actions/product-editor";
import type { ProductEditorListParams } from "@/types/product-editor";

export async function GET(req: NextRequest) {
	try {
		const sp = req.nextUrl.searchParams;
		const params: ProductEditorListParams = {
			page: sp.get("page") ? Number(sp.get("page")) : undefined,
			pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
			company: sp.get("company") || undefined,
			productType: sp.get("productType") || undefined,
			title: sp.get("title") || undefined,
		};
		const result = await listProductEditorItems(params);
		return NextResponse.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		const status = message === "Unauthorized" ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}
