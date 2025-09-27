import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Account Settings | Nogl",
  description: "Configure your account settings, security, and privacy preferences",
  keywords: ["account settings", "security", "privacy", "preferences", "configuration"],
  openGraph: {
    title: "Account Settings | Nogl",
    description: "Configure your account settings, security, and privacy preferences",
    type: "website",
  },
};

export default function AccountSettingsPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Configure your account security, privacy settings, and personal preferences.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
