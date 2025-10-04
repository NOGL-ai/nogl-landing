"use client";

import React, { useMemo, useRef } from "react";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { IconMenuItem, isSubItemActive } from "@/data/navigationItemsV2";
import { LogOut01 } from "@untitledui/icons";

interface SubmenuPanelProps {
    item: IconMenuItem;
    activeUrl: string;
    position: { top: number; left?: number };
    onNavigate: (href: string) => void;
    onClose: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    theme?: 'light' | 'dark';
    user?: {
        name?: string;
        email?: string;
        avatar?: string;
    };
    onLogout?: () => void;
}

export const SubmenuPanel: React.FC<SubmenuPanelProps> = ({
    item,
    activeUrl,
    position,
    onNavigate,
    onClose,
    onMouseEnter,
    onMouseLeave,
    theme = 'light',
    user,
    onLogout
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const panelStyle = useMemo<React.CSSProperties>(() => {
        const normalizedLeft = position.left ?? 0;

        return {
            top: 0,
            left: `${normalizedLeft}px`,
            width: "268px",
            padding: "4px 4px 4px 0",
            height: "100vh"
        };
    }, [position.left]);

    if (!item.subItems || item.subItems.length === 0) {
        return null;
    }

    return (
        <div
            ref={panelRef}
            className="fixed z-40 animate-in fade-in slide-in-from-left-2 duration-200"
            style={panelStyle}
            role="navigation"
            aria-label={`${item.label} navigation`}
            id={`nav-panel-${item.id}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Inner container with border and rounded corners */}
            <div className="flex flex-col justify-between h-full border border-[#e9eaeb] dark:border-[#252b37] bg-white dark:bg-[#0a0d12] rounded-r-xl overflow-hidden">
                {/* Content Section - Figma: padding: 24px 16px 0 16px */}
                <div className="flex flex-col items-start gap-2 self-stretch px-4 pt-6 flex-1 overflow-hidden">
                {/* Subheading - Dark theme: #D5D7DA, Light: #6941C6 */}
                <h2 className="self-stretch text-[#6941c6] dark:text-[#d5d7da] font-semibold text-[14px] leading-5">
                    {item.label}
                </h2>

                {/* Navigation Items */}
                <nav className="flex flex-col items-start self-stretch gap-1 overflow-y-auto pr-1">
                    {item.subItems.map((subItem, index) => {
                        const isActive = isSubItemActive(subItem, activeUrl);

                        return (
                            <div key={subItem.label} className="flex py-[2px] items-center self-stretch">
                                <NavItemBase
                                    href={subItem.href}
                                    icon={subItem.icon}
                                    badge={subItem.badge}
                                    type="link"
                                    current={isActive}
                                    onClick={() => {
                                        onNavigate(subItem.href);
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

                {/* Account Section - Dark theme with border-top */}
                {user && (
                <div className="flex flex-col items-start self-stretch px-4 pb-5">
                    <div className="flex items-start gap-2 self-stretch pt-5 border-t border-[#e9eaeb] dark:border-[#252b37]">
                        <div className="flex flex-col items-start flex-1">
                            {/* Title - Dark: #FAFAFA, Light: #181D27 */}
                            <div className="self-stretch text-[#181d27] dark:text-[#fafafa] font-semibold text-[14px] leading-5">
                                {user.name || 'User'}
                            </div>
                            {/* Supporting text - Dark: #A4A7AE, Light: #535862 */}
                            <div className="self-stretch text-[#535862] dark:text-[#a4a7ae] font-normal text-[14px] leading-5 truncate">
                                {user.email || ''}
                            </div>
                        </div>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="flex p-[6px] justify-center items-center rounded-lg hover:bg-gray-50 dark:hover:bg-[#252b37]/50 transition-colors"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <LogOut01 className="w-4 h-4 text-[#a4a7ae] dark:text-[#717680]" />
                            </button>
                        )}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};
