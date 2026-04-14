import { PivotTab } from "@/components/companies/tabs/PivotTab";

export default async function PivotPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PivotTab slug={slug} />;
}
