import { Metadata } from "next";

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
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6 transition-all duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 lg:p-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Customize your experience and manage your application preferences.
          </p>
        </div>
      </div>
      
      {/* Content will go here */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#F2F2F2] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 lg:p-8">
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Settings functionality coming soon...
        </p>
      </div>
    </div>
  );
}
