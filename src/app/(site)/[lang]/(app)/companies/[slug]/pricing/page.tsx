import { PricingTab } from "@/components/companies/tabs/PricingTab";
import { getBaseUrl } from "@/lib/competitors/utils";
import type { CompanyOverviewResponse, CompanySnapshotDTO } from "@/types/company";

async function getSnapshot(slug: string): Promise<CompanySnapshotDTO | null> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/companies/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as CompanyOverviewResponse;
    return data.snapshot ?? null;
  } catch {
    return null;
  }
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const snapshot = await getSnapshot(slug);
  return <PricingTab slug={slug} snapshot={snapshot} />;
}
