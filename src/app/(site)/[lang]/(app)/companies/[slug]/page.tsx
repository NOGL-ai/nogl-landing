import { notFound } from "next/navigation";

import { CompanyBreadcrumb } from "@/components/companies/CompanyBreadcrumb";
import { CompanyHeader } from "@/components/companies/CompanyHeader";
import { CompanyInfoBar } from "@/components/companies/CompanyInfoBar";
import { CompanyTabs } from "@/components/companies/CompanyTabs";
import { getBaseUrl } from "@/lib/competitors/utils";
import type { CompanyOverviewResponse } from "@/types/company";

async function getCompanyOverview(slug: string): Promise<{
  data: CompanyOverviewResponse | null;
  notFound: boolean;
  error: string | null;
}> {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/companies/${slug}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        data: null,
        notFound: true,
        error: null,
      };
    }

    if (!response.ok) {
      return {
        data: null,
        notFound: false,
        error: `Could not load company (${response.status}).`,
      };
    }

    return {
      data: (await response.json()) as CompanyOverviewResponse,
      notFound: false,
      error: null,
    };
  } catch (error) {
    console.error("[company-page] failed to load company:", error);
    return {
      data: null,
      notFound: false,
      error: "Could not load company details right now.",
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCompanyOverview(slug);

  if (result.notFound) {
    notFound();
  }

  if (!result.data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {result.error ?? "Could not load company details."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CompanyBreadcrumb companyName={result.data.company.name} />
      <CompanyHeader company={result.data.company} snapshot={result.data.snapshot} />
      <CompanyInfoBar company={result.data.company} snapshot={result.data.snapshot} />
      <CompanyTabs slug={slug} initialData={result.data} />
    </div>
  );
}
