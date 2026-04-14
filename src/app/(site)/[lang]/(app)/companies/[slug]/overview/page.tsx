import { notFound } from "next/navigation";

import { OverviewTab } from "@/components/companies/tabs/OverviewTab";
import { getBaseUrl } from "@/lib/competitors/utils";
import type { CompanyOverviewResponse } from "@/types/company";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/companies/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const data = (await response.json()) as CompanyOverviewResponse;
    return <OverviewTab data={data} />;
  } catch {
    notFound();
  }
}
