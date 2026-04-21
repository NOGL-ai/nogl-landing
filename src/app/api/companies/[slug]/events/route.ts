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

function parseIsoDate(value: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 50), 100);
    const eventTypesParam = searchParams.get("eventTypes");
    const eventTypes = eventTypesParam
      ? eventTypesParam.split(",").map((v) => v.trim()).filter(Boolean)
      : undefined;
    const fromDate = parseIsoDate(searchParams.get("from"));
    const toDate = parseIsoDate(searchParams.get("to"));

    const response = await getCompanyEventsResponse({
      slug,
      page,
      limit,
      eventTypes,
      fromDate,
      toDate,
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
