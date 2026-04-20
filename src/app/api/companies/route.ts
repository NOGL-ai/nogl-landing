import { NextRequest, NextResponse } from "next/server";

import { getCompaniesResponse } from "@/lib/companies/helpers";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || undefined;
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);
    const countryCode = searchParams.get("country_code")?.trim() || undefined;
    const trackingStatus = searchParams.get("tracking_status")?.trim() || undefined;
    const sortByRaw = searchParams.get("sort_by")?.trim();
    const sortBy = (["name", "total_products", "last_scraped_at"].includes(sortByRaw ?? "")
      ? sortByRaw
      : "name") as "name" | "total_products" | "last_scraped_at";
    const sortDirRaw = searchParams.get("sort_dir")?.trim();
    const sortDir = (["asc", "desc"].includes(sortDirRaw ?? "") ? sortDirRaw : "asc") as "asc" | "desc";

    const response = await getCompaniesResponse({
      search,
      page,
      limit,
      countryCode,
      trackingStatus,
      sortBy,
      sortDir,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/companies] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load companies" },
      { status: 500 }
    );
  }
}
