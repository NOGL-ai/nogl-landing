import { CompaniesIndexClient } from "@/components/companies/CompaniesIndexClient";
import { getBaseUrl } from "@/lib/competitors/utils";
import type { GetCompaniesResponse } from "@/types/company";

async function getCompanies(params: {
  search?: string;
  page?: number;
  countryCode?: string;
  trackingStatus?: string;
  sortBy?: string;
  sortDir?: string;
}): Promise<{
  companies: GetCompaniesResponse["companies"];
  pagination: GetCompaniesResponse["pagination"];
  error: string | null;
}> {
  try {
    const baseUrl = await getBaseUrl();
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.page && params.page > 1) qs.set("page", String(params.page));
    if (params.countryCode) qs.set("country_code", params.countryCode);
    if (params.trackingStatus) qs.set("tracking_status", params.trackingStatus);
    if (params.sortBy) qs.set("sort_by", params.sortBy);
    if (params.sortDir) qs.set("sort_dir", params.sortDir);

    const response = await fetch(`${baseUrl}/api/companies?${qs.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        companies: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
        error: `Could not load companies (${response.status}).`,
      };
    }

    const data = (await response.json()) as GetCompaniesResponse;
    return {
      companies: data.companies,
      pagination: data.pagination,
      error: null,
    };
  } catch (error) {
    console.error("[companies-page] failed to load companies:", error);
    return {
      companies: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      error: "Could not load companies right now.",
    };
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { lang } = await params;
  const sp = await searchParams;

  const { companies, pagination, error } = await getCompanies({
    search: sp.search,
    page: Number(sp.page) || 1,
    countryCode: sp.country,
    trackingStatus: sp.status,
    sortBy: sp.sort,
    sortDir: sp.sort_dir,
  });

  return (
    <CompaniesIndexClient
      companies={companies}
      pagination={pagination}
      error={error}
      lang={lang}
    />
  );
}
