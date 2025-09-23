import { Metadata } from "next";
import type { Locale } from "@/i18n";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Price Intelligence | Nogl",
  description: "Advanced price intelligence and market analysis tools for fashion retailers",
  keywords: ["price intelligence", "market analysis", "fashion pricing", "competitive pricing"],
  openGraph: {
    title: "Price Intelligence | Nogl",
    description: "Advanced price intelligence and market analysis tools for fashion retailers",
    type: "website",
  },
};

export default async function PriceIntelligencePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Price Intelligence
            </h1>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
