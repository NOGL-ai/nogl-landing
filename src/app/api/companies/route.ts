import { NextRequest, NextResponse } from "next/server";

import { listCompanies } from "@/lib/companies";
import { withRateLimit } from "@/middlewares/rateLimit";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";

export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search") || undefined;
      const companies = await listCompanies(search);

      const response = withSecurityHeaders(
        NextResponse.json({
          companies,
          filters: { search: search ?? "" },
        })
      );
      response.headers.set("X-Api-Resource", "companies");
      return response;
    } catch (error) {
      console.error("[companies] GET failed:", error);
      return NextResponse.json(
        { error: "Failed to load companies" },
        { status: 500 }
      );
    }
  })
);
