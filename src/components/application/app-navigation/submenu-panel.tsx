"use client";

import React, { useMemo, useRef } from "react";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { IconMenuItem, isSubItemActive } from "@/data/navigationItemsV2";
import { LogOut01 } from "@untitledui/icons";
import { SimpleAccountCard } from "./simple-account-card";
import { UserProfile } from "@/types/navigation";

interface SubmenuPanelProps {
    item: IconMenuItem;
    activeUrl: string;
    position: { top: number; left?: number };
    onNavigate: (href: string) => void;
    onClose: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    theme?: 'light' | 'dark';
    user?: UserProfile;
    onLogout?: () => void;
    isAccountDropdownOpen?: boolean;
    setIsAccountDropdownOpen?: (open: boolean) => void;
    panelRef?: React.RefObject<HTMLDivElement>;
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
    onLogout,
    isAccountDropdownOpen = false,
    setIsAccountDropdownOpen,
    panelRef: externalPanelRef
}) => {
    const internalPanelRef = useRef<HTMLDivElement>(null);
    const panelRef = externalPanelRef ?? internalPanelRef;
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
            onMouseLeave={(e) => {
                // Don't close if clicking inside the submenu
                if (e.relatedTarget && panelRef.current?.contains(e.relatedTarget as Node)) {
                    return;
                }
                onMouseLeave?.();
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Inner container with border and rounded corners */}
            <div className="flex flex-col justify-between h-full border border-[#e9eaeb] dark:border-[#252b37] bg-white dark:bg-[#0a0d12] rounded-r-xl overflow-visible">
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

                {/* Account Section - Replaced with SimpleAccountCard */}
                {user && (
                <div className="flex flex-col items-start self-stretch px-4 pb-5">
                    <div className="flex items-start gap-2 self-stretch pt-5 border-t border-[#e9eaeb] dark:border-[#252b37]">
                        <SimpleAccountCard
                            user={user}
                            onLogout={onLogout}
                            isCollapsed={false}
                            isHovered={true}
                            theme={theme}
                            hideAvatar={true}
                            alwaysShowDropdown={true}
                            className="w-full"
                            externalDropdownState={isAccountDropdownOpen}
                            setExternalDropdownState={setIsAccountDropdownOpen}
                        />
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};
