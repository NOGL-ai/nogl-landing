import { NextRequest, NextResponse } from "next/server";
import { getScrapedProducts } from "@/lib/scrapedProducts";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "20");
    const items = await getScrapedProducts(limitParam);
    return NextResponse.json({ ok: true, total: items.length, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to load scraped products", message },
      { status: 500 },
    );
  }
}
