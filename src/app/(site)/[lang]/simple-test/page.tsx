'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function SimpleTestPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        user={user}
        onLogout={() => console.log('Logout')}
      />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold">Simple Sidebar Test</h1>
        <p className="mt-4">
          You should see a dark sidebar on the left. If not, check the browser console for errors.
        </p>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle Sidebar: {isCollapsed ? 'Collapsed' : 'Expanded'}
        </button>
      </div>
    </div>
  );
}
