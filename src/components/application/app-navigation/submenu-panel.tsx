"use client";
import { ChevronDown } from '@untitledui/icons';


import React, { useMemo, useRef, useState } from "react";

import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { IconMenuItem, SubMenuItem, isSubItemActive } from "@/data/navigationItemsV2";
import { SimpleAccountCard } from "./simple-account-card";
import { UserProfile } from "@/types/navigation";

// ── Active-descendant check (recursive) ───────────────────────────────────

function groupHasActiveDescendant(group: SubMenuItem, activeUrl: string): boolean {
    if (!group.groupItems) return false;
    return group.groupItems.some((item) => {
        if (item.href && (item.href === activeUrl || activeUrl.startsWith(item.href + "/"))) return true;
        if (item.isAccordionGroup) return groupHasActiveDescendant(item, activeUrl);
        return false;
    });
}

// ── Accordion group component (recursive) ─────────────────────────────────

interface AccordionGroupProps {
    group: SubMenuItem;
    activeUrl: string;
    onNavigate: (href: string) => void;
    theme: "light" | "dark";
    depth?: number;
}

function AccordionGroup({ group, activeUrl, onNavigate, theme, depth = 0 }: AccordionGroupProps) {
    const hasActive = groupHasActiveDescendant(group, activeUrl);
    const [isOpen, setIsOpen] = useState(hasActive);
    const Icon = group.icon;

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={[
                    "flex items-center justify-between w-full rounded-md text-sm text-left transition-colors duration-150",
                    depth === 0 ? "px-3 py-1.5" : "px-2 py-1",
                    hasActive
                        ? "text-[--color-gray-900] dark:text-white font-medium"
                        : "text-(--color-gray-700) dark:text-(--color-gray-400) hover:bg-(--color-gray-100) dark:hover:bg-[--color-gray-900]",
                ].join(" ")}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {Icon && <Icon className="w-4 h-4 shrink-0 text-(--color-gray-500) dark:text-(--color-gray-400)" />}
                    <span className="truncate">{group.label}</span>
                    {group.badge && <span className="ml-1 shrink-0">{group.badge}</span>}
                </div>
                <ChevronDown
                    className={[
                        "w-3.5 h-3.5 shrink-0 text-(--color-gray-500) dark:text-(--color-gray-400) transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                    ].join(" ")}
                />
            </button>

            {isOpen && group.groupItems && (
                <div
                    className={[
                        "mt-0.5 border-l",
                        depth === 0
                            ? "ml-3 pl-2 border-(--color-gray-200) dark:border-(--color-gray-800)"
                            : "ml-2 pl-1.5 border-(--color-gray-200)/60 dark:border-(--color-gray-800)/60",
                    ].join(" ")}
                >
                    {group.groupItems.map((item) => {
                        if (item.isAccordionGroup) {
                            return (
                                <AccordionGroup
                                    key={item.label}
                                    group={item}
                                    activeUrl={activeUrl}
                                    onNavigate={onNavigate}
                                    theme={theme}
                                    depth={depth + 1}
                                />
                            );
                        }

                        const isActive = item.href
                            ? item.href === activeUrl || activeUrl.startsWith(item.href + "/")
                            : false;

                        return (
                            <div key={item.label} className="flex py-[2px] items-center w-full">
                                <NavItemBase
                                    href={item.href ?? "#"}
                                    icon={item.icon}
                                    badge={item.badge}
                                    type="link"
                                    current={isActive}
                                    onClick={() => item.href && onNavigate(item.href)}
                                    theme={theme}
                                >
                                    {item.label}
                                </NavItemBase>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── SubmenuPanel ────────────────────────────────────────────────────────────

interface SubmenuPanelProps {
    item: IconMenuItem;
    activeUrl: string;
    position: { top: number; left?: number };
    onNavigate: (href: string) => void;
    onClose: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    theme?: "light" | "dark";
    user?: UserProfile;
    onLogout?: () => void | Promise<void>;
    isAccountDropdownOpen?: boolean;
    setIsAccountDropdownOpen?: (open: boolean) => void;
    panelRef?: React.RefObject<HTMLDivElement>;
}

export const SubmenuPanel: React.FC<SubmenuPanelProps> = ({
    item,
    activeUrl,
    position,
    onNavigate,
    onMouseEnter,
    onMouseLeave,
    theme = "light",
    user,
    onLogout,
    isAccountDropdownOpen = false,
    setIsAccountDropdownOpen,
    panelRef: externalPanelRef,
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
            height: "100vh",
        };
    }, [position.left]);

    if (!item.subItems || item.subItems.length === 0) return null;

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
                const nextTarget = e.relatedTarget;
                if (
                    panelRef.current &&
                    nextTarget &&
                    typeof Node !== "undefined" &&
                    nextTarget instanceof Node &&
                    panelRef.current.contains(nextTarget)
                ) {
                    return;
                }
                onMouseLeave?.();
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex flex-col justify-between h-full border border-(--color-gray-200) dark:border-(--color-gray-800) bg-white dark:bg-(--color-gray-950) rounded-r-xl overflow-hidden">
                <div className="flex flex-col items-start gap-2 self-stretch px-4 pt-6 flex-1 min-h-0">
                    <h2 className="self-stretch text-(--color-brand-700) dark:text-(--color-gray-300) font-semibold text-[14px] leading-5 shrink-0">
                        {item.label}
                    </h2>

                    <nav className="flex flex-col items-start self-stretch gap-1 overflow-y-auto pr-1 flex-1">
                        {item.subItems.map((subItem, index) => {
                            if (subItem.isAccordionGroup) {
                                return (
                                    <AccordionGroup
                                        key={subItem.label}
                                        group={subItem}
                                        activeUrl={activeUrl}
                                        onNavigate={onNavigate}
                                        theme={theme}
                                        depth={0}
                                    />
                                );
                            }

                            if (subItem.isSubHeading) {
                                return (
                                    <div
                                        key={subItem.label}
                                        className="flex flex-col items-start self-stretch mt-4 mb-2"
                                    >
                                        <div className="flex items-center gap-2 w-full px-3">
                                            {subItem.icon && (
                                                <subItem.icon
                                                    aria-hidden="true"
                                                    className="size-4 text-(--color-gray-500) dark:text-(--color-gray-400)"
                                                />
                                            )}
                                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-(--color-gray-500) dark:text-(--color-gray-400) leading-4">
                                                {subItem.label}
                                            </h3>
                                        </div>
                                    </div>
                                );
                            }

                            const isActive = subItem.href ? isSubItemActive(subItem, activeUrl) : false;
                            const hasSubHeadingBefore = item.subItems
                                ?.slice(0, index)
                                .some((s) => s.isSubHeading);

                            return (
                                <div
                                    key={subItem.label}
                                    className={`flex py-[2px] items-center self-stretch ${hasSubHeadingBefore ? "ml-2" : ""}`}
                                >
                                    <NavItemBase
                                        href={subItem.href ?? "#"}
                                        icon={subItem.icon}
                                        badge={subItem.badge}
                                        type="link"
                                        current={isActive}
                                        onClick={() => subItem.href && onNavigate(subItem.href)}
                                        theme={theme}
                                    >
                                        {subItem.label}
                                    </NavItemBase>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {user && (
                    <div className="flex flex-col items-start self-stretch px-4 pb-5 shrink-0">
                        <div className="flex items-start gap-2 self-stretch pt-5 border-t border-(--color-gray-200) dark:border-(--color-gray-800)">
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