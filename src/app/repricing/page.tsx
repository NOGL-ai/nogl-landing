import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Repricing | Nogl",
  description: "Automated repricing strategies and dynamic pricing optimization",
  keywords: ["repricing", "dynamic pricing", "pricing optimization", "automated pricing"],
  openGraph: {
    title: "Repricing | Nogl",
    description: "Automated repricing strategies and dynamic pricing optimization",
    type: "website",
  },
};

export default function RepricingPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Repricing
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Optimize your pricing strategy with intelligent repricing algorithms and market insights.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
