'use client';

import React from 'react';

// Minimal sidebar for debugging
function DebugSidebar() {
  return (
    <div className="w-72 h-screen bg-[#111729] text-white p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-500 rounded"></div>
        <span className="font-semibold">NOGL</span>
      </div>
      
      <div className="space-y-2">
        <div className="text-gray-400 text-xs uppercase mb-2">MAIN</div>
        <div className="flex items-center gap-3 p-2 bg-blue-600 rounded">
          <div className="w-5 h-5 bg-white rounded"></div>
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
          <div className="w-5 h-5 bg-gray-400 rounded"></div>
          <span>My Catalog</span>
        </div>
      </div>
    </div>
  );
}

export default function DebugSidebarPage() {
  return (
    <div className="flex h-screen">
      <DebugSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold">Debug Sidebar Test</h1>
        <p className="mt-4">
          This is a minimal sidebar. If you can see this dark sidebar on the left, 
          then the issue is with the complex components. If not, there's a fundamental CSS/layout issue.
        </p>
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <strong>What to check:</strong>
          <ol className="list-decimal list-inside mt-2">
            <li>Do you see a dark sidebar on the left?</li>
            <li>Open browser dev tools (F12) and check for any console errors</li>
            <li>Check if Tailwind CSS is working (colors should appear)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
