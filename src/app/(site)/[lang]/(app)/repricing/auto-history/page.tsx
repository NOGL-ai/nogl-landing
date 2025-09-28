import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Repricing History | Nogl",
  description: "View the history of your automated repricing actions and their results",
  keywords: ["auto repricing", "pricing history", "repricing log", "pricing analytics"],
  openGraph: {
    title: "Auto Repricing History | Nogl",
    description: "View the history of your automated repricing actions and their results",
    type: "website",
  },
};

export default function AutoRepricingHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-3 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-[#F2F2F2] p-6 mb-6">
          <h1 className="text-2xl font-bold text-text-main-900 mb-1 leading-8 tracking-[-0.336px]">
            Auto Repricing History
          </h1>
          <p className="text-sm text-text-sub-500 leading-5 tracking-[-0.07px]">
            View the history of your automated repricing actions and track their performance impact.
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-[#DEE0E3] p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="mx-auto w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Repricing History</h3>
            <p className="text-gray-600 mb-4">
              This feature is coming soon. You'll be able to view detailed history and analytics of your automated repricing actions.
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
