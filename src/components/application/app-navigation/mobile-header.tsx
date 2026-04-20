"use client";

import React from "react";
import { Menu02 } from "@untitledui/icons";
import Logo from "@/shared/Logo";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

interface MobileHeaderProps {
    onMenuClick: () => void;
    isMenuOpen?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    onMenuClick,
    isMenuOpen = false
}) => {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-between border-b border-[--color-gray-200] dark:border-[--color-gray-800] bg-white dark:bg-[--color-gray-950] px-4 py-3">
            {/* Logo Section */}
            <Logo size="sm" showText={true} variant="auto" />

            <div className="flex items-center gap-2">
                <NotificationsBell className="h-9 w-9" />

                {/* Menu Button */}
                <button
                    onClick={onMenuClick}
                    aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMenuOpen}
                    className="flex items-center justify-center p-2 rounded-lg bg-white dark:bg-[--color-gray-950] hover:bg-[--color-gray-50] dark:hover:bg-[--color-gray-800] transition-colors"
                >
                    <Menu02 className="w-6 h-6 text-[--color-gray-700] dark:text-[--color-gray-300]" strokeWidth={2} />
                </button>
            </div>
        </header>
    );
};
