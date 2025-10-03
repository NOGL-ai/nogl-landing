"use client";

import React from "react";
import CollapsedSidebarV2 from "@/components/application/app-navigation/collapsed-sidebar-v2";

export default function SidebarTestPage() {
    const mockUser = {
        name: "Olivia Rhye",
        email: "olivia@untitledui.com",
        avatar: undefined, // Will show initials
    };

    const handleLogout = () => {
        console.log("Logout clicked");
    };

    const handleNavigate = (href: string) => {
        console.log("Navigate to:", href);
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
                        Two-Level Sidebar Test
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Hover over the icons in the sidebar to see the two-level navigation in action.
                    </p>
                    <div className="bg-white dark:bg-[#252b37] rounded-lg p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Test Instructions
                        </h2>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                            <li>1. Hover over the icons in the left sidebar</li>
                            <li>2. Icons with sub-items (like Dashboard, Products, Tasks) will show a submenu panel</li>
                            <li>3. Icons without sub-items (like Home, Support, Settings) will navigate directly</li>
                            <li>4. The avatar should appear at the bottom of the icon sidebar</li>
                            <li>5. Try keyboard navigation with Tab and Enter keys</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
