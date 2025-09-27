import { Metadata } from "next";
import SidebarLayout from "@/components/Sidebar/SidebarLayout";
import DatafeedSettings from "@/components/ProductFeed/DatafeedSettings";

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
  const user = {
    name: 'John Doe',
    email: 'john@pricefy.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <SidebarLayout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DatafeedSettings />
      </div>
    </SidebarLayout>
  );
}
