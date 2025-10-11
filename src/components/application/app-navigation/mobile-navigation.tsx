"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { navigationStructure, isSubItemActive, getActiveIconMenuItem } from "@/data/navigationItemsV2";
import { ChevronDown, ChevronUp } from "@untitledui/icons";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

interface MobileNavigationProps {
    activeUrl: string;
    onNavigate?: (href: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
    activeUrl,
    onNavigate
}) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Use next-themes directly
    const currentTheme = useMemo(() => {
        if (!mounted) return "light";
        return theme || "light";
    }, [theme, mounted]);
    // Auto-expand the active item on mount
    const getInitialExpandedItems = () => {
        const activeItem = getActiveIconMenuItem(activeUrl);
        if (activeItem && activeItem.subItems) {
            return new Set([activeItem.id]);
        }
        return new Set<string>();
    };

    const [expandedItems, setExpandedItems] = useState<Set<string>>(getInitialExpandedItems);

    const toggleItem = (itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleNavigation = (href: string) => {
        if (onNavigate) {
            onNavigate(href);
        } else {
            window.location.href = href;
        }
    };

    // Check if an item or its subitems are active
    const isItemActive = (item: any) => {
        if (item.href === activeUrl) return true;
        if (item.subItems) {
            return item.subItems.some((subItem: any) => subItem.href === activeUrl);
        }
        return false;
    };

    return (
        <div className="flex flex-col gap-0">
            {navigationStructure.map((section) => (
                <div key={section.section} className={`flex flex-col ${section.section === 'footer' ? 'mt-4' : ''}`}>
                    {section.items.map((item) => {
                        const isExpanded = expandedItems.has(item.id);
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isActive = isItemActive(item);
                        const isThemeToggle = item.id === 'theme-toggle';

                        // Special handling for theme toggle
                        if (isThemeToggle) {
                            return (
                                <div key={item.id} className="flex items-center py-[2px]">
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-md w-full">
                                        <div className="flex items-center gap-3 w-full">
                                            <AnimatedThemeToggler className="w-5 h-5 text-[#a4a7ae] dark:text-[#717680] pointer-events-auto" />
                                            <span className="flex-1 text-left font-semibold text-base text-[#414651] dark:text-[#d5d7da] pointer-events-none">
                                                {item.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={item.id} className="flex flex-col">
                                {/* Main nav item */}
                                <div className="flex items-center py-[2px]">
                                    <button
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors ${
                                            isActive 
                                                ? 'bg-[#fafafa] dark:bg-[#252b37]' 
                                                : 'bg-white dark:bg-[#0a0d12] hover:bg-[#fafafa] dark:hover:bg-[#252b37]'
                                        }`}
                                        onClick={() => {
                                            if (hasSubItems) {
                                                toggleItem(item.id);
                                            } else if (item.href) {
                                                handleNavigation(item.href);
                                            }
                                        }}
                                    >
                                        <item.icon 
                                            className={`w-5 h-5 ${
                                                isActive 
                                                    ? 'text-[#a4a7ae]' 
                                                    : 'text-[#a4a7ae]'
                                            }`} 
                                        />
                                        <span className={`flex-1 text-left font-semibold text-base ${
                                            isActive 
                                                ? 'text-[#252b37] dark:text-[#fafafa]' 
                                                : 'text-[#414651] dark:text-[#d5d7da]'
                                        }`}>
                                            {item.label}
                                        </span>
                                        {hasSubItems && (
                                            isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-[#a4a7ae]" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-[#a4a7ae]" />
                                            )
                                        )}
                                    </button>
                                </div>

                                {/* Submenu items */}
                                {hasSubItems && isExpanded && (
                                    <div className="flex flex-col pb-1">
                                        {item.subItems!.map((subItem) => {
                                            const isSubActive = isSubItemActive(subItem, activeUrl);

                                            return (
                                                <NavItemBase
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    icon={subItem.icon}
                                                    badge={subItem.badge}
                                                    type="collapsible-child"
                                                    current={isSubActive}
                                                    onClick={() => handleNavigation(subItem.href)}
                                                    theme={currentTheme}
                                                >
                                                    {subItem.label}
                                                </NavItemBase>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};
