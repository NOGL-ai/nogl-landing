import { NextRequest, NextResponse } from "next/server";

import { getCompanyOverviewResponse } from "@/lib/companies/helpers";
import { withRateLimit } from "@/middlewares/rateLimit";
import { withRequestLogging } from "@/middlewares/security";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

async function handleCompanyGet(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const response = await getCompanyOverviewResponse(slug);

    if (!response) {
      return NextResponse.json(
        { error: "not_found", message: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/companies/[slug]] GET failed:", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message: "Failed to load company",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const rateLimited = withRateLimit(100, 15 * 60 * 1000)(async (req: NextRequest) =>
    handleCompanyGet(req, context),
  );
  return withRequestLogging(rateLimited)(request);
}
