import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Competitors | Nogl",
  description: "Analyze competitor trends, pricing strategies, and market positioning",
  keywords: ["competitors", "market analysis", "competitive intelligence", "pricing"],
  openGraph: {
    title: "Competitors | Nogl",
    description: "Analyze competitor trends, pricing strategies, and market positioning",
    type: "website",
  },
};

export default function CompetitorsPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Competitors
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Stay ahead of the competition with comprehensive market analysis and competitor insights.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
