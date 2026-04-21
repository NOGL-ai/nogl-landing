import { notFound, redirect } from "next/navigation";

import { OverviewTab } from "@/components/companies/tabs/OverviewTab";
import { getBaseUrl } from "@/lib/competitors/utils";
import type { CompanyOverviewResponse } from "@/types/company";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;

  let data: CompanyOverviewResponse;
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/companies/${slug}`, {
      cache: "no-store",
    });
    if (!response.ok) notFound();
    data = (await response.json()) as CompanyOverviewResponse;
  } catch {
    notFound();
  }

  // Redirect stale id-based URLs to the canonical slug URL — must be outside
  // try/catch because Next.js redirect() throws internally and catch would swallow it.
  if (data!.company.slug && data!.company.slug !== slug) {
    redirect(`/${lang}/companies/${data!.company.slug}/overview`);
  }

  return <OverviewTab data={data!} />;
}
