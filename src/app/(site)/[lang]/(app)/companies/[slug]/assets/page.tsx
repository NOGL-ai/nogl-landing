import { AssetsTab } from "@/components/companies/tabs/AssetsTab";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AssetsTab slug={slug} />;
}
