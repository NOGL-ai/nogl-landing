"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { navigationStructure, getActiveIconMenuItem, accountMenuItem } from "@/data/navigationItemsV2";
import type { IconMenuItem } from "@/data/navigationItemsV2";
import { SubmenuPanel } from "./submenu-panel";

interface CollapsedSidebarProps {
    user?: {
        name?: string;
        email?: string;
        avatar?: string;
    };
    onLogout?: () => void;
    onNavigate?: (href: string) => void;
    theme?: "light" | "dark";
}

// Hover timing constants for optimal UX
const HOVER_ENTER_DELAY = 150; // Delay before showing submenu (prevents accidental opens)
const HOVER_LEAVE_DELAY = 300; // Grace period before closing (allows mouse travel to submenu)
const ICON_SIDEBAR_WIDTH = 72;
const SUBMENU_OFFSET = 0; // No gap between panels per Figma design
const SUBMENU_MAX_HEIGHT_OFFSET = 40;
const ESTIMATED_SUBMENU_HEIGHT = 420;

const CollapsedSidebar: React.FC<CollapsedSidebarProps> = ({
    user,
    onLogout,
    onNavigate,
    theme = "light"
}) => {
    const pathname = usePathname();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState({ top: 20, left: ICON_SIDEBAR_WIDTH });
    const accountMenu = useMemo<IconMenuItem>(() => ({
        ...accountMenuItem,
        label: user?.name || accountMenuItem.label
    }), [user?.name]);
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();
    const closeTimeoutRef = useRef<NodeJS.Timeout>();
    const iconRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const clearHoverTimeout = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = undefined;
        }
    }, []);

    const clearCloseTimeout = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = undefined;
        }
    }, []);

    const scheduleClosePanel = useCallback(() => {
        clearCloseTimeout();
        closeTimeoutRef.current = setTimeout(() => {
            setHoveredItem(null);
        }, HOVER_LEAVE_DELAY);
    }, [clearCloseTimeout]);

    // Calculate submenu position
    const calculateSubmenuPosition = useCallback((iconElement: HTMLButtonElement) => {
        if (typeof window === "undefined") {
            return;
        }

        const iconRect = iconElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        let top = iconRect.top;

        const maxTop = viewportHeight - ESTIMATED_SUBMENU_HEIGHT - SUBMENU_MAX_HEIGHT_OFFSET;
        if (top > maxTop) {
            top = Math.max(20, maxTop);
        } else {
            top = Math.max(20, top);
        }

        // Position submenu directly adjacent to sidebar with no gap
        const left = ICON_SIDEBAR_WIDTH;

        setSubmenuPosition({ top, left });
    }, []);

    const openPanelForItem = useCallback((itemId: string) => {
        const iconElement = iconRefs.current[itemId];
        if (iconElement) {
            calculateSubmenuPosition(iconElement);
        }
        setHoveredItem((previous) => (previous === itemId ? previous : itemId));
    }, [calculateSubmenuPosition]);

    const handleIconMouseEnter = useCallback((itemId: string) => {
        clearHoverTimeout();
        clearCloseTimeout();

        if (hoveredItem === itemId) {
            openPanelForItem(itemId);
            return;
        }

        hoverTimeoutRef.current = setTimeout(() => {
            openPanelForItem(itemId);
            hoverTimeoutRef.current = undefined;
        }, HOVER_ENTER_DELAY);
    }, [clearCloseTimeout, clearHoverTimeout, openPanelForItem, hoveredItem]);

    const handleIconMouseLeave = useCallback(() => {
        clearHoverTimeout();
        scheduleClosePanel();
    }, [clearHoverTimeout, scheduleClosePanel]);

    const handleIconFocus = useCallback((itemId: string) => {
        clearHoverTimeout();
        clearCloseTimeout();
        openPanelForItem(itemId);
    }, [clearCloseTimeout, clearHoverTimeout, openPanelForItem]);

    // Get active icon menu item
    const activeIconItem = useMemo(() => {
        return getActiveIconMenuItem(pathname);
    }, [pathname]);

    // Handle navigation
    const handleNavigation = useCallback((href: string) => {
        if (onNavigate) {
            onNavigate(href);
        } else {
            window.location.href = href;
        }
    }, [onNavigate]);

    // Handle icon click to support touch devices and direct navigation
    const handleIconClick = useCallback((item: any) => {
        clearHoverTimeout();
        clearCloseTimeout();

        if (item.href && !item.subItems) {
            setHoveredItem(null);
            handleNavigation(item.href);
            return;
        }

        if (item.subItems) {
            if (hoveredItem === item.id) {
                setHoveredItem(null);
            } else {
                openPanelForItem(item.id);
            }
        }
    }, [clearCloseTimeout, clearHoverTimeout, handleNavigation, hoveredItem, openPanelForItem]);

    // Handle keyboard navigation
    const handleIconKeyDown = useCallback((item: any, event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleIconClick(item);
        } else if (event.key === "Escape" || event.key === "ArrowLeft") {
            scheduleClosePanel();
        } else if (event.key === "ArrowRight" && item.subItems) {
            clearCloseTimeout();
            openPanelForItem(item.id);
        }
    }, [clearCloseTimeout, handleIconClick, openPanelForItem, scheduleClosePanel]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    // Get current hovered item data
    const hoveredItemData = useMemo<IconMenuItem | null>(() => {
        if (!hoveredItem) return null;

        if (hoveredItem === accountMenu.id) {
            return accountMenu;
        }

        for (const section of navigationStructure) {
            const item = section.items.find(item => item.id === hoveredItem);
            if (item) {
                return item;
            }
        }
        return null;
    }, [hoveredItem, accountMenu]);

    return (
        <div
            className="fixed left-0 top-0 z-50 h-screen bg-white dark:bg-[#0a0d12] group"
            style={{ width: ICON_SIDEBAR_WIDTH, padding: "4px 0 4px 4px" }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClosePanel}
        >
            {/* Collapsed Sidebar Content Container */}
            <div className="flex flex-col h-full bg-white dark:bg-[#0a0d12] border border-[#e9eaeb] dark:border-[#252b37] rounded-xl">
                {/* Header with Logo */}
                <div className="flex items-center justify-center pt-5 px-4">
                    <div className="h-8 w-8 relative">
                        <div 
                            className="border-[0.2px] border-[rgba(10,13,18,0.12)] border-solid relative rounded-[8px] shrink-0 size-[32px]" 
                            style={{ 
                                backgroundImage: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(10, 13, 18, 0.2) 100%), linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)" 
                            }}
                        >
                            <div className="overflow-clip relative rounded-[inherit] size-[32px]">
                                <div className="absolute inset-0">
                                    <svg
                                        width='32'
                                        height='32'
                                        viewBox='0 0 30 30'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                        className="block max-w-none size-full"
                                    >
                                        <path
                                            d='M18.7422 19.5789C19.2754 19.5789 19.9931 18.9436 23.9712 14.9676C26.514 12.4263 28.6876 10.3564 28.7901 10.3564C28.9132 10.3564 29.1182 10.4383 29.2412 10.5203C29.3848 10.6023 29.6104 11.1762 29.7539 11.791C29.8974 12.4058 30 13.8814 30 15.0701C30 16.4227 29.8769 17.7139 29.6514 18.5542C29.4668 19.292 28.8926 20.7266 28.4005 21.7308C27.7648 23.022 27.0881 24.0262 26.1039 25.0919C25.3246 25.9117 24.0943 26.9979 23.3561 27.4897C22.6384 27.9611 21.4695 28.5965 20.7928 28.8834C20.1161 29.1498 18.7833 29.5392 17.8195 29.7441C16.5686 29.9901 15.5843 30.0515 14.231 29.9696C13.2262 29.9081 11.8318 29.7031 11.1551 29.5392C10.4784 29.3547 9.14549 28.8219 8.20222 28.3505C7.17693 27.8177 5.94658 26.9774 5.14685 26.2396C4.40864 25.5633 3.46537 24.5796 3.03474 24.0467C2.48109 23.3704 2.23502 22.858 2.23502 22.4071C2.23502 21.8128 2.68614 21.2799 6.50024 17.4884C9.78118 14.1888 10.868 13.2256 11.2576 13.2256C11.6472 13.2461 12.5905 14.0454 14.9487 16.4022C17.6349 19.0665 18.2296 19.5584 18.7422 19.5789Z'
                                            fill='#375DFB'
                                        />
                                        <path
                                            d='M10.5605 0.643081C11.1142 0.458631 12.1395 0.233187 12.8162 0.130715C13.4929 0.00774801 14.8257 -0.0332346 15.7895 0.0282489C16.7533 0.0692378 18.0862 0.253698 18.7629 0.417653C19.4396 0.602104 20.5469 0.991487 21.2236 1.2989C21.9003 1.62682 22.9051 2.20067 23.4792 2.56957C24.0329 2.95897 24.8736 3.59429 25.3042 4.00418C25.7554 4.39358 26.5141 5.27484 27.0062 5.95116C27.4984 6.62747 27.9085 7.38578 27.888 7.63171C27.888 7.93913 27.3343 8.67693 26.3911 9.64017C25.5913 10.5009 24.7506 11.1772 24.5455 11.1772C24.3405 11.1772 23.8893 10.6854 23.4587 9.98857C23.0486 9.35325 22.4744 8.55396 22.1668 8.22605C21.8798 7.89814 21.08 7.2833 20.4033 6.83242C19.7267 6.40203 18.5783 5.84869 17.8401 5.62325C17.0404 5.37732 15.9331 5.23386 15.0718 5.23386C14.2721 5.23386 13.1648 5.35683 12.6111 5.52078C12.0369 5.66425 11.0937 6.03313 10.499 6.32005C9.92484 6.62747 9.00208 7.2628 8.46893 7.73418C7.95628 8.22605 7.23857 9.06633 6.86947 9.64017C6.52087 10.1935 6.04923 11.0748 5.86468 11.5871C5.65962 12.0995 5.41355 13.2882 5.14697 15.9935L3.34246 17.797C2.35818 18.7807 1.37389 19.58 1.16883 19.58C0.984282 19.58 0.738211 19.4161 0.635682 19.2111C0.533153 19.0267 0.3486 18.2683 0.225565 17.5305C0.102529 16.7927 0 15.6246 0 14.9073C0 14.2104 0.143541 12.9193 0.328094 12.038C0.512647 11.1773 0.881753 9.90659 1.16883 9.23027C1.45592 8.55396 2.07109 7.40627 2.56323 6.66847C3.03487 5.93066 4.08067 4.74198 4.85989 4.00418C5.70063 3.2049 6.95149 2.32365 7.91527 1.83178C8.79702 1.36041 9.98636 0.827532 10.5605 0.643081Z'
                                            fill='#00C8F4'
                                        />
                                    </svg>
                                </div>
                                <div className="absolute backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0.2)] bottom-0 left-0 right-0 rounded-bl-[8px] rounded-br-[8px] top-1/2" />
                            </div>
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-0.5px_0.5px_0px_rgba(10,13,18,0.1)]" />
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="flex flex-col gap-4 pt-4">
                    {/* Main Navigation Icons - Figma: padding: 0 16px, gap: 2px */}
                    <div className="flex flex-col px-4 gap-0.5 items-center self-stretch">
                        {navigationStructure
                            .filter(section => section.section === 'main')
                            .map(section => 
                                section.items.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = activeIconItem?.id === item.id;
                                    const isHovered = hoveredItem === item.id;
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            ref={(el) => { iconRefs.current[item.id] = el; }}
                                            onClick={() => handleIconClick(item)}
                                            onMouseEnter={() => handleIconMouseEnter(item.id)}
                                            onMouseLeave={handleIconMouseLeave}
                                            onFocus={() => handleIconFocus(item.id)}
                                            onBlur={handleIconMouseLeave}
                                            onKeyDown={(e) => handleIconKeyDown(item, e)}
                                            className={`
                                                flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200
                                                ${isActive || isHovered
                                                    ? 'bg-[#fafafa] dark:bg-[#252b37]'
                                                    : 'hover:bg-[#fafafa] dark:hover:bg-[#252b37]/50'
                                                }
                                            `}
                                            title={item.label}
                                            aria-label={`${item.label} navigation`}
                                            aria-haspopup={item.subItems ? "menu" : undefined}
                                            aria-expanded={item.subItems ? hoveredItem === item.id : undefined}
                                            aria-controls={item.subItems ? `nav-panel-${item.id}` : undefined}
                                            type="button"
                                        >
                                            <IconComponent
                                                className={`w-5 h-5 ${
                                                    isActive || isHovered
                                                        ? 'text-[#717680] dark:text-[#a4a7ae]'
                                                        : 'text-[#a4a7ae] dark:text-[#717680]'
                                                }`}
                                            />
                                        </button>
                                    );
                                })
                            )
                        }
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Footer Section - Figma: padding: 0 16px 20px, gap: 16px */}
                <div className="flex flex-col gap-4 items-center pb-5 px-4 self-stretch">
                    {/* Footer Navigation Items - Figma: gap: 2px */}
                    <div className="flex flex-col gap-0.5 items-center">
                        {navigationStructure
                            .filter(section => section.section === 'footer')
                            .map(section => 
                                section.items.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = activeIconItem?.id === item.id;
                                    const isHovered = hoveredItem === item.id;
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            ref={(el) => { iconRefs.current[item.id] = el; }}
                                            onClick={() => handleIconClick(item)}
                                            onMouseEnter={() => handleIconMouseEnter(item.id)}
                                            onMouseLeave={handleIconMouseLeave}
                                            onFocus={() => handleIconFocus(item.id)}
                                            onBlur={handleIconMouseLeave}
                                            onKeyDown={(e) => handleIconKeyDown(item, e)}
                                            className={`
                                                flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200
                                                ${isActive || isHovered
                                                    ? 'bg-[#fafafa] dark:bg-[#252b37]'
                                                    : 'hover:bg-[#fafafa] dark:hover:bg-[#252b37]/50'
                                                }
                                            `}
                                            title={item.label}
                                            aria-label={`${item.label} navigation`}
                                            aria-haspopup={item.subItems ? "menu" : undefined}
                                            aria-expanded={item.subItems ? hoveredItem === item.id : undefined}
                                            aria-controls={item.subItems ? `nav-panel-${item.id}` : undefined}
                                            type="button"
                                        >
                                            <IconComponent
                                                className={`w-5 h-5 ${
                                                    isActive || isHovered
                                                        ? 'text-[#717680] dark:text-[#a4a7ae]'
                                                        : 'text-[#a4a7ae] dark:text-[#717680]'
                                                }`}
                                            />
                                        </button>
                                    );
                                })
                            )
                        }
                    </div>

                    {/* User Avatar */}
                    <div className="relative">
                        <button
                            ref={(el) => {
                                iconRefs.current[accountMenu.id] = el;
                            }}
                            type="button"
                            onClick={() => handleIconClick(accountMenu)}
                            onMouseEnter={() => handleIconMouseEnter(accountMenu.id)}
                            onMouseLeave={handleIconMouseLeave}
                            onFocus={() => handleIconFocus(accountMenu.id)}
                            onBlur={handleIconMouseLeave}
                            onKeyDown={(event) => handleIconKeyDown(accountMenu, event)}
                            className={`flex w-10 h-10 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.08)] overflow-hidden transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#375dfb]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0d12]
                                ${hoveredItem === accountMenu.id
                                    ? 'ring-2 ring-[#e9eaeb] dark:ring-[#252b37] ring-offset-2 ring-offset-white dark:ring-offset-[#0a0d12]'
                                    : 'hover:ring-2 hover:ring-[#e9eaeb] dark:hover:ring-[#252b37]'
                                }
                            `}
                            title={user?.name ? `${user.name} account` : 'Account menu'}
                            aria-label={user?.name ? `${user.name} account menu` : 'Account menu'}
                            aria-haspopup={accountMenu.subItems ? "menu" : undefined}
                            aria-expanded={hoveredItem === accountMenu.id}
                            aria-controls={`nav-panel-${accountMenu.id}`}
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Submenu Panel - Always visible showing active section */}
            {hoveredItemData && hoveredItemData.subItems && (
                <SubmenuPanel
                    item={hoveredItemData}
                    activeUrl={pathname}
                    position={submenuPosition}
                    onNavigate={handleNavigation}
                    onClose={() => setHoveredItem(null)}
                    onMouseEnter={clearCloseTimeout}
                    onMouseLeave={scheduleClosePanel}
                    theme={theme as "light" | "dark" | undefined}
                    user={user}
                    onLogout={onLogout}
                />
            )}
        </div>
    );
};

export default CollapsedSidebar;
