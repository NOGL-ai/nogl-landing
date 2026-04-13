import { NextRequest, NextResponse } from "next/server";
import { listCompanies } from "@/lib/companies";
import { FEATURES } from "@/lib/featureFlags";
import { withRateLimit } from "@/middlewares/rateLimit";
import { withRequestLogging, withSecurityHeaders } from "@/middlewares/security";

type DataType = "products" | "pricing" | "reviews" | "web";
type SignatureStatus = "all" | "normal" | "signature";
type SortField = "relevance" | "keyword_rank" | "name" | "data_since";
type SortOrder = "asc" | "desc";

const VERTICALS = [
  "Electronics",
  "Luggage & Bags",
  "Baby & Toddler",
  "Apparel & Accessories",
  "Home & Living",
] as const;

const PRODUCT_TYPES = [
  "Leggings",
  "Camera",
  "Backpack",
  "Shoes",
  "Baby Monitor",
  "Desk Lamp",
] as const;

interface AdvancedCompanyRow {
  id: string;
  name: string;
  domain: string;
  logoUrl: string;
  vertical: string;
  dataTypes: DataType[];
  status: "Normal" | "Signature";
  popularityScore: number;
  dataSince: string | null;
  productType: string;
  trackedCompetitorId: string | null;
}

interface AdvancedSearchResponse {
  total: number;
  pageOffset: number;
  pageSize: number;
  filters: {
    search: string;
    companyVertical: string;
    productType: string;
    dataAvailable: string;
    signatureStatus: SignatureStatus;
  };
  sort: {
    field: SortField;
    order: SortOrder;
  };
  results: AdvancedCompanyRow[];
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildDataTypes(seed: number, tracked: boolean): DataType[] {
  if (!tracked) {
    return [];
  }

  const allTypes: DataType[] = ["products", "pricing", "reviews", "web"];
  return allTypes.filter((_, index) => ((seed >> index) & 1) === 1).length > 0
    ? allTypes.filter((_, index) => ((seed >> index) & 1) === 1)
    : ["products"];
}

function toAdvancedRow(record: Awaited<ReturnType<typeof listCompanies>>[number]): AdvancedCompanyRow {
  const seed = hashString(record.domain);
  const vertical = VERTICALS[seed % VERTICALS.length];
  const productType = PRODUCT_TYPES[seed % PRODUCT_TYPES.length];
  const status = seed % 6 === 0 ? "Signature" : "Normal";
  const dataTypes = buildDataTypes(seed, Boolean(record.trackedCompetitorId));
  const popularityScore = Math.max(8, Math.min(100, Math.round(Math.log10(record.productCount + 10) * 35)));

  return {
    id: record.key,
    name: record.name,
    domain: record.domain,
    logoUrl: `https://img.logo.dev/${record.domain}?format=png&size=128`,
    vertical,
    dataTypes,
    status,
    popularityScore,
    dataSince: record.lastSeenAt,
    productType,
    trackedCompetitorId: record.trackedCompetitorId,
  };
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? fallback : parsed;
}

function sortRows(rows: AdvancedCompanyRow[], field: SortField, order: SortOrder): AdvancedCompanyRow[] {
  const sign = order === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (field === "name") {
      return left.name.localeCompare(right.name) * sign;
    }
    if (field === "data_since") {
      const leftTime = left.dataSince ? new Date(left.dataSince).getTime() : 0;
      const rightTime = right.dataSince ? new Date(right.dataSince).getTime() : 0;
      return (leftTime - rightTime) * sign;
    }

    const leftScore = left.popularityScore;
    const rightScore = right.popularityScore;
    return (leftScore - rightScore) * sign;
  });
}

export const GET = withRequestLogging(
  withRateLimit(100, 15 * 60 * 1000)(async (request: NextRequest) => {
    if (!FEATURES.COMPETITOR_API) {
      return NextResponse.json(
        { error: "Advanced company search is disabled", message: "Feature flag is off" },
        { status: 503 }
      );
    }

    try {
      const { searchParams } = new URL(request.url);
      const search = (searchParams.get("search") ?? "").trim();
      const companyVertical = (searchParams.get("companyVertical") ?? "all").trim();
      const productType = (searchParams.get("productType") ?? "").trim();
      const dataAvailable = (searchParams.get("dataAvailable") ?? "").trim();
      const signatureStatus = ((searchParams.get("signatureStatus") ?? "all").toLowerCase() ||
        "all") as SignatureStatus;
      const pageSize = Math.min(parsePositiveInt(searchParams.get("pageSize"), 25) || 25, 100);
      const pageOffset = parsePositiveInt(searchParams.get("pageOffset"), 0);
      const sortField = ((searchParams.get("sortField") ?? "relevance").toLowerCase() ||
        "relevance") as SortField;
      const sortOrder = ((searchParams.get("sortOrder") ?? "desc").toLowerCase() ||
        "desc") as SortOrder;

      const companies = await listCompanies(search);
      let filtered = companies.map(toAdvancedRow);

      if (companyVertical && companyVertical !== "all") {
        filtered = filtered.filter((row) => row.vertical.toLowerCase() === companyVertical.toLowerCase());
      }
      if (productType) {
        filtered = filtered.filter((row) => row.productType.toLowerCase().includes(productType.toLowerCase()));
      }
      if (dataAvailable) {
        filtered = filtered.filter((row) => row.dataTypes.includes(dataAvailable as DataType));
      }
      if (signatureStatus === "signature") {
        filtered = filtered.filter((row) => row.status === "Signature");
      }
      if (signatureStatus === "normal") {
        filtered = filtered.filter((row) => row.status === "Normal");
      }

      const sorted = sortRows(filtered, sortField, sortOrder);
      const paginated = sorted.slice(pageOffset, pageOffset + pageSize);

      const payload: AdvancedSearchResponse = {
        total: sorted.length,
        pageOffset,
        pageSize,
        filters: {
          search,
          companyVertical,
          productType,
          dataAvailable,
          signatureStatus,
        },
        sort: {
          field: sortField,
          order: sortOrder,
        },
        results: paginated,
      };

      return withSecurityHeaders(NextResponse.json(payload));
    } catch (error) {
      console.error("[companies/advanced-search] GET failed:", error);
      return NextResponse.json(
        {
          error: "Failed to load advanced search results",
          message: error instanceof Error ? error.message : "Unexpected server error",
        },
        { status: 500 }
      );
    }
  })
);
