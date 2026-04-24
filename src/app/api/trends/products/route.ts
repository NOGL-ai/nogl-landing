import { NextResponse } from "next/server";
import { getProductTrends } from "@/lib/trends/productTrends";

/**
 * GET /api/trends/products
 *
 * Returns an aggregated product-trends payload backed by the
 * `market_intelligence` ArangoDB database (hosted on CT 211).
 *
 * When `ARANGO_URL` / `ARANGO_PASSWORD` are not set, falls back to
 * deterministic mock data so the dashboard still renders.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const payload = await getProductTrends();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
