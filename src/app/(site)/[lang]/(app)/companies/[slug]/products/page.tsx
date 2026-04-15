import { ProductsTab } from "@/components/companies/tabs/ProductsTab";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const { slug, lang } = await params;
  return <ProductsTab slug={slug} lang={lang} />;
}
