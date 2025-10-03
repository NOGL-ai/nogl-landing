"use client";

import SidebarDemo from "@/components/application/app-navigation/sidebar-demo";

export default function TestSidebarPage() {
    return (
        <SidebarDemo>
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Test Instructions
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    <p>1. Hover over the icons in the left sidebar</p>
                    <p>2. Icons with sub-items (like Dashboard, Products, Tasks) will show a submenu panel</p>
                    <p>3. Icons without sub-items (like Home, Support, Settings) will navigate directly</p>
                    <p>4. The avatar should appear at the bottom of the icon sidebar</p>
                    <p>5. Try keyboard navigation with Tab and Enter keys</p>
                </div>
            </div>
        </SidebarDemo>
    );
}
