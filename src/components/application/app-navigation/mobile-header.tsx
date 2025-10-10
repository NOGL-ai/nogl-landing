"use client";

import React from "react";
import { Menu02 } from "@untitledui/icons";
import Logo from "@/shared/Logo";

interface MobileHeaderProps {
    onMenuClick: () => void;
    isMenuOpen?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    onMenuClick,
    isMenuOpen = false
}) => {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#e9eaeb] dark:border-[#252b37] bg-white dark:bg-[#0a0d12] px-4 py-3">
            {/* Logo Section */}
            <Logo size="sm" showText={true} variant="auto" />

            {/* Menu Button */}
            <button
                onClick={onMenuClick}
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                className="flex items-center justify-center p-2 rounded-lg bg-white dark:bg-[#0a0d12] hover:bg-[#fafafa] dark:hover:bg-[#252b37] transition-colors"
            >
                <Menu02 className="w-6 h-6 text-[#414651] dark:text-[#d5d7da]" strokeWidth={2} />
            </button>
        </header>
    );
};
