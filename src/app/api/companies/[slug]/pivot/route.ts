import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveCompanyBySlug } from "@/lib/companies/helpers";
import { CompanyPivotResponse } from "@/types/company";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

type PivotRowDimension = "category" | "brand" | "price_range" | "discount_tier";
type PivotColDimension = "month" | "week" | "price_range" | "discount_tier";
type PivotMetric = "count" | "avg_price" | "avg_discount" | "total_value";

type PivotQueryRow = {
  row: string | null;
  col: string | null;
  value: number | string | Prisma.Decimal | null;
};

const PRICE_RANGE_ORDER = ["0-50", "50-100", "100-250", "250-500", "500-1000", "1000+"];
const DISCOUNT_TIER_ORDER = ["No Discount", "1-10%", "10-25%", "25-50%", "50%+"];

function parseRowDimension(value: string | null): PivotRowDimension {
  if (value === "brand" || value === "price_range" || value === "discount_tier") {
    return value;
  }

  return "category";
}

function parseColDimension(value: string | null): PivotColDimension {
  if (value === "week" || value === "price_range" || value === "discount_tier") {
    return value;
  }

  return "month";
}

function parseMetric(value: string | null): PivotMetric {
  if (value === "avg_price" || value === "avg_discount" || value === "total_value") {
    return value;
  }

  return "count";
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function buildPriceRangeSql(): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN COALESCE(product_original_price, 0) < 50 THEN '0-50'
      WHEN COALESCE(product_original_price, 0) < 100 THEN '50-100'
      WHEN COALESCE(product_original_price, 0) < 250 THEN '100-250'
      WHEN COALESCE(product_original_price, 0) < 500 THEN '250-500'
      WHEN COALESCE(product_original_price, 0) < 1000 THEN '500-1000'
      ELSE '1000+'
    END
  `;
}

function buildDiscountTierSql(): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN COALESCE(product_discount_percentage, 0) <= 0 THEN 'No Discount'
      WHEN product_discount_percentage <= 10 THEN '1-10%'
      WHEN product_discount_percentage <= 25 THEN '10-25%'
      WHEN product_discount_percentage <= 50 THEN '25-50%'
      ELSE '50%+'
    END
  `;
}

function buildDimensionSql(dimension: PivotRowDimension | PivotColDimension): Prisma.Sql {
  switch (dimension) {
    case "brand":
      return Prisma.sql`COALESCE(NULLIF(product_brand, ''), 'Unknown')`;
    case "price_range":
      return buildPriceRangeSql();
    case "discount_tier":
      return buildDiscountTierSql();
    case "week":
      return Prisma.sql`TO_CHAR(extraction_timestamp AT TIME ZONE 'UTC', 'IYYY-"W"IW')`;
    case "month":
      return Prisma.sql`TO_CHAR(extraction_timestamp AT TIME ZONE 'UTC', 'YYYY-MM')`;
    case "category":
    default:
      return Prisma.sql`COALESCE(NULLIF(product_category, ''), 'Uncategorized')`;
  }
}

function buildMetricSql(metric: PivotMetric): Prisma.Sql {
  switch (metric) {
    case "avg_price":
      return Prisma.sql`COALESCE(AVG(product_original_price), 0)::double precision`;
    case "avg_discount":
      return Prisma.sql`COALESCE(AVG(product_discount_percentage), 0)::double precision`;
    case "total_value":
      return Prisma.sql`COALESCE(SUM(product_original_price), 0)::double precision`;
    case "count":
    default:
      return Prisma.sql`COUNT(*)::double precision`;
  }
}

function toNumber(value: PivotQueryRow["value"]): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }

  return 0;
}

function compareBucketValue(
  valueA: string,
  valueB: string,
  orderedValues: string[]
): number {
  return orderedValues.indexOf(valueA) - orderedValues.indexOf(valueB);
}

function compareDimensionValue(
  dimension: PivotRowDimension | PivotColDimension,
  valueA: string,
  valueB: string
): number {
  if (dimension === "price_range") {
    return compareBucketValue(valueA, valueB, PRICE_RANGE_ORDER);
  }

  if (dimension === "discount_tier") {
    return compareBucketValue(valueA, valueB, DISCOUNT_TIER_ORDER);
  }

  return valueA.localeCompare(valueB);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const company = await resolveCompanyBySlug(slug);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rowDimension = parseRowDimension(searchParams.get("rowDimension"));
    const colDimension = parseColDimension(searchParams.get("colDimension"));
    const metric = parseMetric(searchParams.get("metric"));
    const fromDate = parseIsoDate(searchParams.get("from"));
    const toDate = parseIsoDate(searchParams.get("to"));

    if (searchParams.get("from") && !fromDate) {
      return NextResponse.json({ error: "Invalid from date" }, { status: 400 });
    }

    if (searchParams.get("to") && !toDate) {
      return NextResponse.json({ error: "Invalid to date" }, { status: 400 });
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`(
        product_brand ILIKE ${`%${company.name}%`}
        OR source_url ILIKE ${`%${normalizeDomain(company.domain)}%`}
      )`,
    ];

    if (fromDate) {
      conditions.push(Prisma.sql`extraction_timestamp >= ${fromDate}`);
    }

    if (toDate) {
      conditions.push(Prisma.sql`extraction_timestamp <= ${toDate}`);
    }

    const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
    const rowSql = buildDimensionSql(rowDimension);
    const colSql = buildDimensionSql(colDimension);
    const metricSql = buildMetricSql(metric);

    const pivotRows = await prisma.$queryRaw<PivotQueryRow[]>(Prisma.sql`
      SELECT
        ${rowSql} AS row,
        ${colSql} AS col,
        ${metricSql} AS value
      FROM public.products
      ${whereSql}
      GROUP BY 1, 2
    `);

    const cells = pivotRows.map((row) => ({
      row: row.row ?? "Unknown",
      col: row.col ?? "Unknown",
      value: toNumber(row.value),
    }));

    const rows = Array.from(new Set(cells.map((cell) => cell.row))).sort((valueA, valueB) =>
      compareDimensionValue(rowDimension, valueA, valueB)
    );
    const cols = Array.from(new Set(cells.map((cell) => cell.col))).sort((valueA, valueB) =>
      compareDimensionValue(colDimension, valueA, valueB)
    );

    const response: CompanyPivotResponse = {
      rows,
      cols,
      cells,
      meta: {
        rowDimension,
        colDimension,
        metric,
        total_cells: cells.length,
        from: fromDate ? fromDate.toISOString() : null,
        to: toDate ? toDate.toISOString() : null,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/companies/[slug]/pivot] GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load company pivot data" },
      { status: 500 }
    );
  }
}
