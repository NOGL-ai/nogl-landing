import { NextRequest, NextResponse } from "next/server";

import { getCompanyEventsResponse } from "@/lib/companies/helpers";

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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);

    const response = await getCompanyEventsResponse({
      slug,
      page,
      limit,
    });

    if (!response) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/companies/[slug]/events] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load company events" },
      { status: 500 }
    );
  }
}
