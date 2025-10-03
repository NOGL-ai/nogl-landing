"use client";

import React from "react";
import CollapsedSidebarV2 from "./collapsed-sidebar-v2";

interface SidebarDemoProps {
    children: React.ReactNode;
}

const SidebarDemo: React.FC<SidebarDemoProps> = ({ children }) => {
    const mockUser = {
        name: "Olivia Rhye",
        email: "olivia@untitledui.com",
        avatar: undefined, // Will show initials
    };

    const handleLogout = () => {
        console.log("Logout clicked");
        // Add your logout logic here
    };

    const handleNavigate = (href: string) => {
        console.log("Navigate to:", href);
        // Add your navigation logic here
        // For demo purposes, we'll just log it
    };

    return (
        <div className="flex h-screen">
            <CollapsedSidebarV2
                user={mockUser}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
            />
            <main className="flex-1 ml-16 bg-gray-50 dark:bg-[#0a0d12] overflow-auto">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Two-Level Sidebar Demo
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Hover over the icons in the sidebar to see the two-level navigation in action.
                        Each icon with sub-items will show a contextual submenu panel.
                    </p>
                    <div className="bg-white dark:bg-[#252b37] rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Features Implemented
                        </h2>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                            <li>✅ Two-level navigation system</li>
                            <li>✅ Hover-based submenu display</li>
                            <li>✅ Smooth animations and transitions</li>
                            <li>✅ Keyboard navigation support</li>
                            <li>✅ Screen boundary detection</li>
                            <li>✅ ARIA accessibility features</li>
                            <li>✅ Dark mode support</li>
                            <li>✅ Responsive design</li>
                        </ul>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default SidebarDemo;
