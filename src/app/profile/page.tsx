import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Profile | Nogl",
  description: "View and manage your personal profile information",
  keywords: ["profile", "user profile", "personal information", "account details"],
  openGraph: {
    title: "Profile | Nogl",
    description: "View and manage your personal profile information",
    type: "website",
  },
};

export default function ProfilePage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Profile
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              View and update your personal profile information and preferences.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
