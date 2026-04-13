import { NextRequest, NextResponse } from "next/server";

import { getCompanyOverviewResponse } from "@/lib/companies/helpers";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const response = await getCompanyOverviewResponse(slug);

    if (!response) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/companies/[slug]/overview] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load company overview" },
      { status: 500 }
    );
  }
}
