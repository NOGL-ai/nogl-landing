import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "My Account | Nogl",
  description: "Manage your account information, billing, and subscription details",
  keywords: ["account", "profile", "billing", "subscription", "user management"],
  openGraph: {
    title: "My Account | Nogl",
    description: "Manage your account information, billing, and subscription details",
    type: "website",
  },
};

export default function AccountPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              My Account
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Manage your personal information, billing details, and account preferences.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
