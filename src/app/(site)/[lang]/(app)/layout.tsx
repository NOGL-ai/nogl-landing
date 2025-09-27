import React from 'react';
import SidebarLayout from '@/components/Sidebar/SidebarLayout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    name: 'Emon Pixels',
    email: 'emon683@pricefy.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <SidebarLayout user={user}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </SidebarLayout>
  );
}
