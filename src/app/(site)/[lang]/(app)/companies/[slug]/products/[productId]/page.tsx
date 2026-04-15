import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/companies/products/ProductDetailView";
import { getProductDetail } from "@/lib/companies/productHelpers";
import { resolveCompanyBySlug } from "@/lib/companies/helpers";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string; productId: string }>;
}) {
  const { slug, lang, productId } = await params;

  const [data, company] = await Promise.all([
    getProductDetail({ slug, productId }).catch(() => null),
    resolveCompanyBySlug(slug).catch(() => null),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <ProductDetailView
      data={data}
      slug={slug}
      lang={lang}
      companyName={company?.name ?? slug}
    />
  );
}
