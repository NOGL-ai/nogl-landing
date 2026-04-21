import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  CAMERA_QUICK_FILTERS,
  isMatrixDimension,
  parseSlugList,
  type MatrixDimension,
} from "@/lib/analytics/product-matrix-helpers";

/** Keep aligned with `multi-company-summary` route. */
const TRACKED = [
  { slug: "calumet", name: "Calumet Photographic", domain: "calumet.de" },
  { slug: "teltec", name: "Teltec", domain: "teltec.de" },
  { slug: "foto-erhardt", name: "Foto Erhardt", domain: "foto-erhardt.de" },
  { slug: "foto-leistenschneider", name: "Foto Leistenschneider", domain: "foto-leistenschneider.de" },
  { slug: "fotokoch", name: "Fotokoch", domain: "fotokoch.de" },
  { slug: "kamera-express", name: "Kamera Express", domain: "kamera-express.de" },
] as const;

const EFFECTIVE_PRICE = Prisma.sql`COALESCE(product_discount_price, product_original_price)`;

const HAS_PRICE = Prisma.sql`COALESCE(product_discount_price, product_original_price) IS NOT NULL
    AND COALESCE(product_discount_price, product_original_price) > 0`;

const ALL_DOMAINS = Prisma.sql`(
  source_url ILIKE '%calumet.de%' OR
  source_url ILIKE '%teltec.de%' OR
  source_url ILIKE '%foto-erhardt.de%' OR
  source_url ILIKE '%foto-leistenschneider.de%' OR
  source_url ILIKE '%fotokoch.de%' OR
  source_url ILIKE '%kamera-express.de%'
)`;

function companySlugSql(): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN source_url ILIKE '%calumet.de%' THEN 'calumet'
      WHEN source_url ILIKE '%teltec.de%' THEN 'teltec'
      WHEN source_url ILIKE '%foto-erhardt.de%' THEN 'foto-erhardt'
      WHEN source_url ILIKE '%foto-leistenschneider.de%' THEN 'foto-leistenschneider'
      WHEN source_url ILIKE '%fotokoch.de%' THEN 'fotokoch'
      WHEN source_url ILIKE '%kamera-express.de%' THEN 'kamera-express'
      ELSE 'unknown'
    END
  `;
}

function priceBucketSql(): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN ${EFFECTIVE_PRICE} < 100 THEN '€0–100'
      WHEN ${EFFECTIVE_PRICE} < 250 THEN '€100–250'
      WHEN ${EFFECTIVE_PRICE} < 500 THEN '€250–500'
      WHEN ${EFFECTIVE_PRICE} < 1000 THEN '€500–1000'
      WHEN ${EFFECTIVE_PRICE} < 2000 THEN '€1000–2000'
      ELSE '€2000+'
    END
  `;
}

function discountTierSql(): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN product_discount_percentage IS NULL OR product_discount_percentage = 0 THEN 'No discount'
      WHEN product_discount_percentage < 10 THEN '1–10%'
      WHEN product_discount_percentage < 25 THEN '10–25%'
      WHEN product_discount_percentage < 50 THEN '25–50%'
      ELSE '50%+'
    END
  `;
}

function dimensionExpr(dim: MatrixDimension): Prisma.Sql {
  switch (dim) {
    case "company":
      return companySlugSql();
    case "category":
      return Prisma.sql`COALESCE(NULLIF(TRIM(product_category), ''), 'Unknown')`;
    case "brand":
      return Prisma.sql`COALESCE(NULLIF(TRIM(product_brand), ''), 'Unknown')`;
    case "price_bucket":
      return priceBucketSql();
    case "discount_tier":
      return discountTierSql();
    default:
      return Prisma.sql`'Unknown'`;
  }
}

function buildCompanyFilter(slugs: string[]): Prisma.Sql | null {
  if (slugs.length === 0) return null;
  const domains = TRACKED.filter((t) => slugs.includes(t.slug)).map((t) => t.domain);
  if (domains.length === 0) return Prisma.sql`FALSE`;
  const parts = domains.map((d) => Prisma.sql`source_url ILIKE ${"%" + d + "%"}`);
  return Prisma.join(parts, " OR ");
}

function buildCameraOrClause(ids: string[]): Prisma.Sql | null {
  if (ids.length === 0) return null;
  const clauses: Prisma.Sql[] = [];
  for (const id of ids) {
    const def = CAMERA_QUICK_FILTERS.find((f) => f.id === id);
    if (!def) continue;
    const ors = def.terms.map(
      (t) =>
        Prisma.sql`(product_title ILIKE ${"%" + t + "%"} OR product_category ILIKE ${"%" + t + "%"} OR COALESCE(product_material,'') ILIKE ${"%" + t + "%"} OR COALESCE(product_brand,'') ILIKE ${"%" + t + "%"})`
    );
    if (ors.length) clauses.push(Prisma.join(ors, " OR "));
  }
  if (clauses.length === 0) return null;
  return Prisma.join(clauses, " OR ");
}

type CellRow = { row_key: string; col_key: string; n: bigint };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const row = searchParams.get("row") ?? "company";
    const col = searchParams.get("col") ?? "category";
    if (!isMatrixDimension(row) || !isMatrixDimension(col)) {
      return NextResponse.json({ error: "Invalid row or col dimension" }, { status: 400 });
    }
    if (row === col) {
      return NextResponse.json({ error: "Row and column dimensions must differ" }, { status: 400 });
    }

    const depth = Math.min(5, Math.max(1, Number(searchParams.get("depth") ?? "3") || 3));
    const keyword = (searchParams.get("keyword") ?? "").trim().slice(0, 200);
    const material = (searchParams.get("material") ?? "").trim().slice(0, 120);
    const color = (searchParams.get("color") ?? "").trim().slice(0, 120);
    const gender = (searchParams.get("gender") ?? "").trim().toLowerCase();
    const avgDiscount = searchParams.get("avgDiscount");
    const companySlugs = parseSlugList(searchParams.get("companies"));
    const cameraIds = parseSlugList(searchParams.get("camera"), 12);

    const filters: Prisma.Sql[] = [ALL_DOMAINS, HAS_PRICE];

    const companyWhere = buildCompanyFilter(companySlugs);
    if (companyWhere) filters.push(companyWhere);

    if (keyword) {
      filters.push(
        Prisma.sql`(product_title ILIKE ${"%" + keyword + "%"} OR product_sku ILIKE ${"%" + keyword + "%"} OR COALESCE(ean,'') ILIKE ${"%" + keyword + "%"})`
      );
    }
    if (material) {
      filters.push(Prisma.sql`COALESCE(product_material,'') ILIKE ${"%" + material + "%"}`);
    }
    if (color) {
      filters.push(Prisma.sql`COALESCE(product_color,'') ILIKE ${"%" + color + "%"}`);
    }
    if (gender && ["male", "female", "unisex"].includes(gender)) {
      filters.push(Prisma.sql`LOWER(COALESCE(product_gender,'')) = ${gender}`);
    }
    if (avgDiscount && avgDiscount !== "any") {
      const n = Number(avgDiscount);
      if (!Number.isNaN(n) && n > 0) {
        filters.push(Prisma.sql`COALESCE(product_discount_percentage, 0) >= ${n}`);
      }
    }

    const cameraOr = buildCameraOrClause(cameraIds);
    if (cameraOr) filters.push(Prisma.sql`(${cameraOr})`);

    /** Taxonomy depth: only products whose category path has at least `depth` segments. */
    filters.push(
      Prisma.sql`(
        COALESCE(
          array_length(
            string_to_array(regexp_replace(COALESCE(product_category, ''), E'\\\\s*[/|>]\\\\s*', '>', 'g'), '>'),
            1
          ),
          CASE WHEN product_category IS NULL OR TRIM(product_category) = '' THEN 0 ELSE 1 END
        ) >= ${depth}
      )`
    );

    const rowExpr = dimensionExpr(row);
    const colExpr = dimensionExpr(col);
    const whereSql = Prisma.join(filters, " AND ");

    const raw = (await prisma.$queryRaw(Prisma.sql`
      SELECT
        CAST(${rowExpr} AS text) AS row_key,
        CAST(${colExpr} AS text) AS col_key,
        COUNT(*)::bigint AS n
      FROM public.products
      WHERE ${whereSql}
      GROUP BY 1, 2
      ORDER BY n DESC
      LIMIT 2500
    `)) as CellRow[];

    const cells = raw.map((r) => ({
      row_key: r.row_key,
      col_key: r.col_key,
      n: Number(r.n),
    }));

    const rowTotals = new Map<string, number>();
    const colTotals = new Map<string, number>();
    for (const c of cells) {
      rowTotals.set(c.row_key, (rowTotals.get(c.row_key) ?? 0) + c.n);
      colTotals.set(c.col_key, (colTotals.get(c.col_key) ?? 0) + c.n);
    }

    const maxRows = 40;
    const maxCols = 28;
    const topRows = [...rowTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxRows).map(([k]) => k);
    const topCols = [...colTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxCols).map(([k]) => k);
    const rowSet = new Set(topRows);
    const colSet = new Set(topCols);

    const filtered = cells.filter((c) => rowSet.has(c.row_key) && colSet.has(c.col_key));
    const maxCell = filtered.reduce((m, c) => Math.max(m, c.n), 0);

    return NextResponse.json(
      {
        meta: {
          row,
          col,
          depth,
          companies: companySlugs.length ? companySlugs : TRACKED.map((t) => t.slug),
          tracked_companies: TRACKED.map((t) => ({ slug: t.slug, name: t.name })),
          row_keys: topRows,
          col_keys: topCols,
          max_cell: maxCell,
          camera_filters: CAMERA_QUICK_FILTERS.map((f) => ({ id: f.id, label: f.label })),
        },
        cells: filtered,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("[product-matrix]", error);
    return NextResponse.json({ error: "Failed to load matrix" }, { status: 500 });
  }
}
