'use client';

import React from 'react';
import SidebarLayout from '@/components/Sidebar/SidebarLayout';

export default function TestSidebarPage() {
  const user = {
    name: 'Emon Pixels',
    email: 'emon683@pricefy.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <SidebarLayout user={user} onLogout={handleLogout}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Sidebar Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          If you can see this content with a sidebar on the left, the sidebar is working correctly!
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Test Instructions:
          </h2>
          <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
            <li>Desktop: You should see a collapsible sidebar on the left</li>
            <li>Mobile: Tap the hamburger menu to open the sidebar drawer</li>
            <li>Try clicking the collapse toggle in the sidebar header</li>
            <li>Navigate between different sidebar items</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
}
