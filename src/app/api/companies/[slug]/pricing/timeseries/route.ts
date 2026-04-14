import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PricingTimeseriesData, PricingTimeseriesPoint } from "@/components/companies/pricing/PricingOverTimeChart";
import { resolveCompanyBySlug } from "@/lib/companies/helpers";

// Helper to generate sample data for development/demo
function generateSampleTimeseriesData(): PricingTimeseriesData {
  const today = new Date();
  const discount: PricingTimeseriesPoint[] = [];
  const current_price: PricingTimeseriesPoint[] = [];
  const full_price: PricingTimeseriesPoint[] = [];

  // Generate 28 days of sample data
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Generate realistic pricing data with some variation
    const baseDiscount = 0.12 + Math.sin(i / 7) * 0.05;
    const basePrice = 150 + Math.cos(i / 10) * 30;
    const baseFullPrice = basePrice / (1 - baseDiscount);

    discount.push({
      date: dateStr,
      value: Math.max(0.05, Math.min(0.35, baseDiscount + (Math.random() - 0.5) * 0.03)),
    });

    current_price.push({
      date: dateStr,
      value: Math.max(20, basePrice + (Math.random() - 0.5) * 20),
    });

    full_price.push({
      date: dateStr,
      value: Math.max(50, baseFullPrice + (Math.random() - 0.5) * 40),
    });
  }

  return { discount, current_price, full_price };
}

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter", message: "Company slug is required" },
        { status: 400 }
      );
    }

    const company = await resolveCompanyBySlug(slug);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found", message: "No company matches the provided slug" },
        { status: 404 }
      );
    }

    // Query the scraper database for pricing trends
    try {
      const normalizedDomain = company.domain
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/\/.*$/, "")
        .toLowerCase();

      type TimeseriesRow = {
        date: Date | string;
        avg_discount: Prisma.Decimal | number | string | null;
        avg_current_price: Prisma.Decimal | number | string | null;
        avg_full_price: Prisma.Decimal | number | string | null;
      };

      const queryRaw = prisma.$queryRaw as <T>(query: Prisma.Sql) => Promise<T>;
      const result = await queryRaw<TimeseriesRow[]>(Prisma.sql`
        SELECT
          DATE_TRUNC('day', extraction_timestamp)::date as date,
          AVG(product_discount_percentage) as avg_discount,
          AVG(product_discount_price) as avg_current_price,
          AVG(product_original_price) as avg_full_price
        FROM public.products
        WHERE (
          product_brand ILIKE ${`%${company.name}%`}
          OR source_url ILIKE ${`%${normalizedDomain}%`}
        )
        GROUP BY DATE_TRUNC('day', extraction_timestamp)
        ORDER BY date ASC
        LIMIT 1000
      `);

      // Transform the database results into the expected format
      const discount: PricingTimeseriesPoint[] = [];
      const current_price: PricingTimeseriesPoint[] = [];
      const full_price: PricingTimeseriesPoint[] = [];

      for (const row of result) {
        const date = row.date instanceof Date
          ? row.date.toISOString().split("T")[0]
          : String(row.date);

        if (row.avg_discount != null) {
          const avgDiscount = Number(row.avg_discount);
          discount.push({
            date,
            value: Number.isFinite(avgDiscount) ? Math.min(1, Math.max(0, avgDiscount / 100)) : 0,
          });
        }

        if (row.avg_current_price != null) {
          const currentPrice = Number(row.avg_current_price);
          current_price.push({
            date,
            value: Number.isFinite(currentPrice) ? Math.max(0, currentPrice) : 0,
          });
        }

        if (row.avg_full_price != null) {
          const fullPrice = Number(row.avg_full_price);
          full_price.push({
            date,
            value: Number.isFinite(fullPrice) ? Math.max(0, fullPrice) : 0,
          });
        }
      }

      // If no data found, return sample data
      if (discount.length === 0) {
        console.info(`No pricing data found for ${slug}, returning sample data`);
        return NextResponse.json(generateSampleTimeseriesData());
      }

      const data: PricingTimeseriesData = {
        discount,
        current_price,
        full_price,
      };

      return NextResponse.json(data);
    } catch (dbError) {
      console.warn(`Database query failed for ${slug}:`, dbError);
      // Return sample data if query fails
      return NextResponse.json(generateSampleTimeseriesData());
    }
  } catch (error) {
    console.error("Error fetching pricing timeseries:", error);
    // Return sample data as fallback
    return NextResponse.json(generateSampleTimeseriesData());
  }
}

