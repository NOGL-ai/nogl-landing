import { Metadata } from "next";

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Competitors
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Stay ahead of the competition with comprehensive market analysis and competitor insights.
          </p>
        </div>
        
        {/* Placeholder for competitors content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Competitor analysis features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
