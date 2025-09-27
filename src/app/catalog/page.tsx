import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "My Catalog | Nogl",
  description: "Manage your fashion product catalog and inventory with advanced analytics",
  keywords: ["catalog", "inventory", "products", "fashion", "management"],
  openGraph: {
    title: "My Catalog | Nogl",
    description: "Manage your fashion product catalog and inventory with advanced analytics",
    type: "website",
  },
};

export default function CatalogPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              My Catalog
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Organize, manage, and optimize your fashion product catalog with intelligent insights.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-orange-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Product Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add, edit, and organize your fashion products with ease.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-pink-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2a1 1 0 0 0-2 0v2H8V2a1 1 0 0 0-2 0v2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h16v9z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Inventory Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor stock levels and manage inventory efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
