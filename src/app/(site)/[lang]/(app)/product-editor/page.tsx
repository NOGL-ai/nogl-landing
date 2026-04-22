import type { Locale } from "@/i18n";
import { ProductEditorClient } from "@/components/product-editor/ProductEditorClient";

export const dynamic = "force-dynamic";

export const metadata = {
	title: "Product Editor | NOGL",
	description: "Bulk edit product types and product tags for competitor products",
};

export default async function ProductEditorPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	return <ProductEditorClient lang={lang} />;
}
