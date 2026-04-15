import { NextRequest, NextResponse } from "next/server";

import { getCompanyPricingResponse } from "@/lib/companies/helpers";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);
    const productType = searchParams.get("product_type")?.trim() || undefined;
    const minPrice = parseOptionalNumber(searchParams.get("min_price"));
    const maxPrice = parseOptionalNumber(searchParams.get("max_price"));
    const sort = (searchParams.get("sort") ?? "last_seen_desc") as
      | "price_asc"
      | "price_desc"
      | "discount_desc"
      | "last_seen_desc";

    const response = await getCompanyPricingResponse({
      slug,
      page,
      limit,
      sort,
      productType,
      minPrice,
      maxPrice,
    });

    if (!response) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/companies/[slug]/pricing] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load company pricing" },
      { status: 500 }
    );
  }
}
