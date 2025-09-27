import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Product Feed | Nogl",
  description: "Manage and optimize your product feeds for better market reach",
  keywords: ["product feed", "feed management", "product distribution", "e-commerce"],
  openGraph: {
    title: "Product Feed | Nogl",
    description: "Manage and optimize your product feeds for better market reach",
    type: "website",
  },
};

export default function ProductFeedPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Product Feed
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Streamline your product distribution with optimized feeds and automated management.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
