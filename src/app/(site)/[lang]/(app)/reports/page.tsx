import { Metadata } from "next";

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
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6 transition-all duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Reports
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate detailed reports and analytics to drive informed business decisions.
          </p>
        </div>
      </div>
      
      {/* Content will go here */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 lg:p-8">
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Reports functionality coming soon...
        </p>
      </div>
    </div>
  );
}
