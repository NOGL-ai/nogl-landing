'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/hooks/useSidebar';

export default function SimpleTestPage() {
  const { isCollapsed, toggleCollapse } = useSidebar();

  const user = {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        user={user}
        onLogout={() => console.log('Logout')}
      />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold">Enhanced Sidebar Test</h1>
        <p className="mt-4">
          You should see a dark sidebar on the left with hover-to-expand functionality!
        </p>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            ✨ New Hover Features:
          </h2>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li><strong>Hover to expand:</strong> When collapsed, hover over the sidebar to temporarily expand it</li>
            <li><strong>Smooth transitions:</strong> 300ms ease-in-out animations</li>
            <li><strong>Visual feedback:</strong> Shadow appears when hovering over collapsed sidebar</li>
            <li><strong>Persistent state:</strong> Your collapse preference is saved in localStorage</li>
          </ul>
        </div>

        <button
          onClick={toggleCollapse}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isCollapsed ? 'Expand' : 'Collapse'} Sidebar
        </button>

        <div className="mt-4 text-sm text-gray-600">
          Current state: <strong>{isCollapsed ? 'Collapsed' : 'Expanded'}</strong>
        </div>
      </div>
    </div>
  );
}
