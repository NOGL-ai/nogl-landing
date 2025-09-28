import { Metadata } from "next";
import SidebarLayout from "@/components/Sidebar/SidebarLayout";
import CatalogContent from "@/components/catalog/CatalogContent";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

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
      <GlassParticlePage
        className="min-h-screen"
        particlesProps={{
          quantity: 3000,
          color: "#4F46E5", // Indigo color
          size: 0.5,
          ease: 70,
          staticity: 40
        }}
      >
        <CatalogContent />
      </GlassParticlePage>
    </SidebarLayout>
  );
}
