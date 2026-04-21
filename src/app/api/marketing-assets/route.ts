import { NextResponse, type NextRequest } from "next/server";

import { listMarketingAssets } from "@/actions/marketing-assets";
import type { MarketingAssetListParams } from "@/types/marketing-asset";

export async function GET(req: NextRequest) {
	try {
		const sp = req.nextUrl.searchParams;
		const params: MarketingAssetListParams = {
			assetType: (sp.get("assetType") || sp.get("type") || undefined) as MarketingAssetListParams["assetType"],
			brandSlug: sp.get("brandSlug") || sp.get("brand") || undefined,
			search: sp.get("search") ?? undefined,
			from: sp.get("from") ?? undefined,
			to: sp.get("to") ?? undefined,
			hasDiscount: sp.get("hasDiscount") === "true" ? true : undefined,
			page: sp.get("page") ? Number(sp.get("page")) : undefined,
			pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined,
			sort: (sp.get("sort") as MarketingAssetListParams["sort"]) ?? undefined,
			preset: (sp.get("preset") as MarketingAssetListParams["preset"]) ?? undefined,
		};
		const result = await listMarketingAssets(params);
		return NextResponse.json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		const status = message === "Unauthorized" ? 401 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}
