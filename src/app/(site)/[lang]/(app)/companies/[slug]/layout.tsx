import type { ReactNode } from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { CompanyBreadcrumb } from "@/components/companies/CompanyBreadcrumb";
import { CompanyHeader } from "@/components/companies/CompanyHeader";
import { CompanyInfoBar } from "@/components/companies/CompanyInfoBar";
import { CompanyTabNav } from "@/components/companies/CompanyTabNav";
import { SkeletonCompanyHeader } from "@/components/companies/SkeletonCompanyHeader";
import { getCompanyOverviewResponse } from "@/lib/companies/helpers";
import type { CompanyOverviewResponse } from "@/types/company";

// Isolated async component — suspends while fetching, streams in when ready
async function CompanyShell({
  slug,
  lang,
}: {
  slug: string;
  lang: string;
}) {
  let result: CompanyOverviewResponse | null = null;
  try {
    result = await getCompanyOverviewResponse(slug);
  } catch {
    // handled below
  }

  if (!result) {
    notFound();
  }

  return (
    <>
      <CompanyBreadcrumb companyName={result.company.name} lang={lang} />
      <CompanyHeader company={result.company} snapshot={result.snapshot} />
      <CompanyInfoBar company={result.company} snapshot={result.snapshot} />
    </>
  );
}

export default async function CompanySlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;

  return (
    <div className="min-h-screen bg-background">
      {/* Suspense streams the header in — page shell + tabs render immediately */}
      <Suspense fallback={<SkeletonCompanyHeader />}>
        <CompanyShell slug={slug} lang={lang} />
      </Suspense>
      <CompanyTabNav slug={slug} lang={lang} />
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
