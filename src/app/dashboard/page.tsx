import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Dashboard | Nogl",
  description: "Your main dashboard for fashion trend forecasting and business analytics",
  keywords: ["dashboard", "analytics", "fashion trends", "business intelligence"],
  openGraph: {
    title: "Dashboard | Nogl",
    description: "Your main dashboard for fashion trend forecasting and business analytics",
    type: "website",
  },
};

export default function DashboardPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Your comprehensive overview of fashion trends, sales analytics, and business performance metrics.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 13h2v6H7v-6zm4-6h2v12h-2V7zm4 3h2v9h-2v-9z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analytics Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time insights into your business performance and trends.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-green-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Key Metrics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your most important KPIs and performance indicators.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Recent Activity
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay updated with the latest changes and notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
