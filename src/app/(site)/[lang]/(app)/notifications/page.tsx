import { Metadata } from "next";
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

export const metadata: Metadata = {
  title: "Notifications | Nogl",
  description: "Manage your notifications and stay updated with the latest alerts",
  keywords: ["notifications", "alerts", "updates", "messages", "communication"],
  openGraph: {
    title: "Notifications | Nogl",
    description: "Manage your notifications and stay updated with the latest alerts",
    type: "website",
  },
};

export default function NotificationsPage() {
  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Notifications
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Stay informed with personalized notifications and manage your alert preferences.
            </p>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
