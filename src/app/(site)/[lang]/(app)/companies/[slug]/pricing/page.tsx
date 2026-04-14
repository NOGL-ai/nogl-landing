import { PricingTab } from "@/components/companies/tabs/PricingTab";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PricingTab slug={slug} />;
}
