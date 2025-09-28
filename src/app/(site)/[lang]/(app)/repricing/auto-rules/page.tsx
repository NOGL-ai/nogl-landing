import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Repricing Rules | Nogl",
  description: "Configure and manage your automated repricing rules",
  keywords: ["auto repricing", "pricing rules", "automated pricing", "dynamic pricing"],
  openGraph: {
    title: "Auto Repricing Rules | Nogl",
    description: "Configure and manage your automated repricing rules",
    type: "website",
  },
};

export default function AutoRepricingRulesPage() {
  return (
    <div className="min-h-screen bg-gray-3 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-[#F2F2F2] p-6 mb-6">
          <h1 className="text-2xl font-bold text-text-main-900 mb-1 leading-8 tracking-[-0.336px]">
            Auto Repricing Rules
          </h1>
          <p className="text-sm text-text-sub-500 leading-5 tracking-[-0.07px]">
            Configure and manage your automated repricing rules to optimize your pricing strategy.
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-[#DEE0E3] p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="mx-auto w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Repricing Rules</h3>
            <p className="text-gray-600 mb-4">
              This feature is coming soon. You'll be able to create and manage automated repricing rules to optimize your pricing strategy.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
