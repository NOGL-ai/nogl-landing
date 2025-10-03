import { Metadata } from "next";
import CatalogContent from "@/components/catalog/CatalogContent";

export const metadata: Metadata = {
	title: "My Catalog | NOGL",
	description:
		"Import and manage your products with competitive pricing insights",
	keywords: ["catalog", "products", "pricing", "competitors", "management"],
	openGraph: {
		title: "My Catalog | NOGL",
		description:
			"Import and manage your products with competitive pricing insights",
		type: "website",
	},
};

export default function CatalogPage() {
	return <CatalogContent />;
}
