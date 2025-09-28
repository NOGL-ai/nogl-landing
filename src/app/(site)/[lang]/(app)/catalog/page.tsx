import { Metadata } from "next";
import SidebarLayout from "@/components/Sidebar/SidebarLayout";
import CatalogContent from "@/components/catalog/CatalogContent";

export const metadata: Metadata = {
  title: "My Catalog | Pricefy",
  description: "Import and manage your products with competitive pricing insights",
  keywords: ["catalog", "products", "pricing", "competitors", "management"],
  openGraph: {
    title: "My Catalog | Pricefy",
    description: "Import and manage your products with competitive pricing insights",
    type: "website",
  },
};

export default function CatalogPage() {
      return (
        <SidebarLayout>
          <CatalogContent />
        </SidebarLayout>
      );
}
