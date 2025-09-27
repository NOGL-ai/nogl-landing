'use client';

import React from 'react';
import { SidebarLayout } from '@/components/Sidebar';

export default function HoverDemoPage() {
  const user = {
    name: 'Emon Pixels',
    email: 'emon683@pricefy.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
  };

  return (
    <SidebarLayout user={user}>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Sidebar Hover Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Experience the enhanced sidebar with hover-to-expand functionality and tooltips!
          </p>
        </div>

        <div className="grid gap-6">
          {/* Feature Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              ✨ Enhanced Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">🖱️ Hover to Expand</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  When sidebar is collapsed, hover over it to temporarily expand and see all navigation items.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">💡 Smart Tooltips</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  In collapsed mode, hover over icons to see tooltips with navigation labels.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">🎨 Visual Feedback</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Smooth animations and shadow effects provide clear visual feedback during interactions.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">💾 Persistent State</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your sidebar preference (expanded/collapsed) is saved and restored between sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📋 How to Test
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Collapse the sidebar:</strong> Click the collapse button (📱 icon) in the sidebar header
              </li>
              <li>
                <strong>Test hover expansion:</strong> Move your mouse over the collapsed sidebar to see it expand
              </li>
              <li>
                <strong>Try tooltips:</strong> In collapsed mode, hover over navigation icons to see tooltips
              </li>
              <li>
                <strong>Test profile dropdown:</strong> Both collapsed and expanded states support the profile menu
              </li>
              <li>
                <strong>Check persistence:</strong> Refresh the page to see if your collapsed/expanded preference is saved
              </li>
            </ol>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🔧 Technical Implementation
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Hover Detection</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Mouse enter/leave events on sidebar container</li>
                  <li>• State management with React hooks</li>
                  <li>• Smooth 300ms CSS transitions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">State Management</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• localStorage persistence</li>
                  <li>• Custom useSidebar hook</li>
                  <li>• Responsive behavior handling</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
              ✅ UX Best Practices Applied
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Fast Access</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Hover to quickly access navigation without clicking
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Intuitive</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Natural mouse interactions with clear visual feedback
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Responsive</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Works seamlessly across desktop and mobile devices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
