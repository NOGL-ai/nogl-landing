"use client";

import { useState, useMemo, useCallback } from "react";
import { cx } from "@/utils/cx";
import type { NavItemDividerType, NavItemType } from "../config";
import { NavItemBase } from "../base-components/nav-item";

interface SidebarNavigationSectionsSubheadingsProps {
    /** URL of the currently active item. */
    activeUrl?: string;
    /** Additional CSS classes to apply to the navigation. */
    className?: string;
    /** List of navigation sections with labels and items. */
    items: Array<{ label: string; items: (NavItemType | NavItemDividerType)[] }>;
    /** Theme for styling */
    theme?: 'light' | 'dark';
}

export const SidebarNavigationSectionsSubheadings = ({ 
    activeUrl, 
    items, 
    className,
    theme = 'dark'
}: SidebarNavigationSectionsSubheadingsProps) => {
    const [open, setOpen] = useState(false);
    
    // Memoize active item calculation
    const activeItem = useMemo(() => {
        return items
            .flatMap(section => section.items)
            .find((item) => item.href === activeUrl || item.items?.some((subItem) => subItem.href === activeUrl));
    }, [items, activeUrl]);
    
    const [currentItem, setCurrentItem] = useState(activeItem);

    // Memoize toggle handler
    const handleToggle = useCallback((e: React.SyntheticEvent<HTMLDetailsElement>) => {
        setOpen(e.currentTarget.open);
        setCurrentItem(activeItem);
    }, [activeItem]);

    return (
        <nav className={cx("flex flex-col", className)}>
            {items.map((section, sectionIndex) => (
                <div key={section.label} className={cx(sectionIndex > 0 && "mt-8")}>
                    {/* Section Label */}
                    <div className="px-5 mb-1">
                        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${
                            theme === 'dark' ? 'text-[#d5d7da]' : 'text-[#717680]'
                        }`}>
                            {section.label}
                        </h3>
                    </div>

                    {/* Section Items */}
                    <ul className="flex flex-col px-4">
                        {section.items.map((item, index) => {
                            if (item.divider) {
                                return (
                                    <li key={index} className="w-full px-0.5 py-2">
                                        <hr className="h-px w-full border-none bg-border-secondary" />
                                    </li>
                                );
                            }

                            if (item.items?.length) {
                                return (
                                    <details
                                        key={item.label}
                                        open={activeItem?.href === item.href}
                                        className="appearance-none py-0.5"
                                        onToggle={handleToggle}
                                    >
                                        <NavItemBase 
                                            href={item.href} 
                                            badge={item.badge} 
                                            icon={item.icon} 
                                            type="collapsible"
                                            theme={theme}
                                        >
                                            {item.label}
                                        </NavItemBase>

                                        <dd>
                                            <ul className="py-0.5">
                                                {item.items.map((childItem) => (
                                                    <li key={childItem.label} className="py-0.5">
                                                        <NavItemBase
                                                            href={childItem.href}
                                                            badge={childItem.badge}
                                                            type="collapsible-child"
                                                            current={activeUrl === childItem.href}
                                                            theme={theme}
                                                        >
                                                            {childItem.label}
                                                        </NavItemBase>
                                                    </li>
                                                ))}
                                            </ul>
                                        </dd>
                                    </details>
                                );
                            }

                            return (
                                <li key={item.label} className="py-0.5">
                                    <NavItemBase
                                        type="link"
                                        badge={item.badge}
                                        icon={item.icon}
                                        href={item.href}
                                        current={currentItem?.href === item.href || activeUrl === item.href}
                                        open={open && currentItem?.href === item.href}
                                        theme={theme}
                                    >
                                        {item.label}
                                    </NavItemBase>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );
};

