import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Reports | Nogl",
  description: "Comprehensive business reports and analytics for data-driven decisions",
  keywords: ["reports", "analytics", "business intelligence", "data visualization"],
  openGraph: {
    title: "Reports | Nogl",
    description: "Comprehensive business reports and analytics for data-driven decisions",
    type: "website",
  },
};

export default function ReportsPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Reports
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Generate detailed reports and analytics to drive informed business decisions.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
