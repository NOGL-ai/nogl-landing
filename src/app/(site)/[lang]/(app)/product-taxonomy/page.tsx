import type { Locale } from "@/i18n";
import { ProductTaxonomyClient } from "@/components/product-taxonomy/ProductTaxonomyClient";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Product Type Taxonomy | NOGL",
	description: "Explore the product type hierarchy used for categorization and comparisons",
};

export default async function ProductTaxonomyPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	return <ProductTaxonomyClient lang={lang} />;
}
