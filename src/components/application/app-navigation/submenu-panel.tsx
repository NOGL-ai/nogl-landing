"use client";

import React, { useEffect, useRef } from "react";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { IconMenuItem, isSubItemActive } from "@/data/navigationItemsV2";

interface SubmenuPanelProps {
    item: IconMenuItem;
    activeUrl: string;
    position: { top: number; left?: number };
    onNavigate: (href: string) => void;
    onClose: () => void;
    theme?: 'light' | 'dark';
}

export const SubmenuPanel: React.FC<SubmenuPanelProps> = ({
    item,
    activeUrl,
    position,
    onNavigate,
    onClose,
    theme = 'light'
}) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside the panel to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Add a small delay to prevent immediate closing when moving from icon to panel
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!item.subItems || item.subItems.length === 0) {
        return null;
    }

    return (
        <div
            ref={panelRef}
            className="submenu-panel fixed left-16 top-0 z-50 w-64 bg-white dark:bg-[#0a0d12] border-r border-[#e9eaeb] dark:border-[#252b37] shadow-xl rounded-r-lg"
            style={{
                top: `${position.top}px`,
                left: `${position.left || 64}px`,
                height: 'fit-content',
                maxHeight: 'calc(100vh - 40px)',
            }}
            role="menu"
            aria-label={`${item.label} submenu`}
            aria-hidden={false}
            id={`submenu-${item.id}`}
            onMouseEnter={() => {
                // Keep panel open when hovering over it
            }}
            onMouseLeave={() => {
                // Close panel when mouse leaves
                onClose();
            }}
        >
            <div className="flex flex-col h-full">
                {/* Header with Section Title */}
                <div className="px-4 py-6 border-b border-[#e9eaeb] dark:border-[#252b37]">
                    <h2 className="text-sm font-semibold text-[#6941c6] dark:text-[#6941c6] leading-5">
                        {item.label}
                    </h2>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-4">
                    <nav className="space-y-1">
                        {item.subItems.map((subItem, index) => {
                            const isActive = isSubItemActive(subItem, activeUrl);
                            
                            return (
                                <div key={subItem.label} className="submenu-item px-2">
                                    <NavItemBase
                                        href={subItem.href}
                                        icon={subItem.icon}
                                        badge={subItem.badge}
                                        type="link"
                                        current={isActive}
                                        onClick={() => {
                                            onNavigate(subItem.href);
                                            onClose();
                                        }}
                                        theme={theme}
                                    >
                                        {subItem.label}
                                    </NavItemBase>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
};
