import { CompaniesIndexClient } from "@/components/companies/CompaniesIndexClient";
import { getBaseUrl } from "@/lib/competitors/utils";
import type { GetCompaniesResponse } from "@/types/company";

async function getCompanies(): Promise<{
  companies: GetCompaniesResponse["companies"];
  error: string | null;
}> {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/companies`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        companies: [],
        error: `Could not load companies (${response.status}).`,
      };
    }

    const data = (await response.json()) as GetCompaniesResponse;
    return {
      companies: data.companies,
      error: null,
    };
  } catch (error) {
    console.error("[companies-page] failed to load companies:", error);
    return {
      companies: [],
      error: "Could not load companies right now.",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { companies, error } = await getCompanies();

  return <CompaniesIndexClient companies={companies} error={error} lang={lang} />;
}
