import { NextResponse, type NextRequest } from "next/server";

import { bulkUpdateProducts } from "@/actions/product-editor";
import type { ProductEditorBulkUpdatePayload } from "@/types/product-editor";

export async function POST(req: NextRequest) {
	try {
		const payload = (await req.json()) as ProductEditorBulkUpdatePayload;
		const result = await bulkUpdateProducts(payload);
		return NextResponse.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		const status = message === "Unauthorized" ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}
