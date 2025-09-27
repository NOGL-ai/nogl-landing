import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Settings | Nogl",
  description: "Configure your application preferences and account settings",
  keywords: ["settings", "preferences", "configuration", "account"],
  openGraph: {
    title: "Settings | Nogl",
    description: "Configure your application preferences and account settings",
    type: "website",
  },
};

export default function SettingsPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Customize your experience and manage your application preferences.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
