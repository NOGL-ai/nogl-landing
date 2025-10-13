"use client";

/**
 * CollapsedSidebar - Enhanced Two-Level Navigation Sidebar
 * 
 * Features improved theme handling with:
 * - Direct integration with next-themes useTheme hook
 * - No theme props needed - uses next-themes directly
 * - Theme change responsiveness through hook updates
 * - Consistent theme-aware styling utilities
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { navigationStructure, getActiveIconMenuItem, accountMenuItem } from "@/data/navigationItemsV2";
import type { IconMenuItem } from "@/data/navigationItemsV2";
// Removed unused Sun import - Magic UI component handles its own icons
import { SubmenuPanel } from "./submenu-panel";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import Logo from "@/shared/Logo";
import { CopilotToggleButton } from "./copilot-toggle-button";

interface CollapsedSidebarProps {
    user?: {
        name?: string;
        email?: string;
        avatar?: string;
    };
    onLogout?: () => void | Promise<void>;
    onNavigate?: (href: string) => void;
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
    onNavigate
}) => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Use next-themes directly - no prop needed
    // Always use 'light' during SSR to prevent hydration mismatch
    const currentTheme = useMemo(() => {
        if (!mounted) return "light";
        return theme || "light";
    }, [theme, mounted]);

    // Theme toggle is now handled by Magic UI AnimatedThemeToggler component
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [submenuPosition, setSubmenuPosition] = useState({ top: 20, left: ICON_SIDEBAR_WIDTH });
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const isAccountDropdownOpenRef = useRef(isAccountDropdownOpen);
    const previousThemeRef = useRef(currentTheme);
    const accountMenu = useMemo<IconMenuItem>(() => ({
        ...accountMenuItem,
        label: user?.name || accountMenuItem.label
    }), [user?.name]);
    const accountMenuId = accountMenu.id;
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();
    const closeTimeoutRef = useRef<NodeJS.Timeout>();
    const iconRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const submenuPanelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        isAccountDropdownOpenRef.current = isAccountDropdownOpen;
    }, [isAccountDropdownOpen]);

    // Enhanced theme change handling - close dropdowns when theme actually changes
    useEffect(() => {
        if (previousThemeRef.current !== currentTheme && isAccountDropdownOpen) {
            setIsAccountDropdownOpen(false);
        }
        previousThemeRef.current = currentTheme;
    }, [currentTheme, isAccountDropdownOpen]);

    // Theme change detection for better UX
    useEffect(() => {
        // Force re-render when theme changes to ensure proper styling
        // This helps with theme transitions and ensures all elements update correctly
        const timeoutId = setTimeout(() => {
            // Small delay to ensure theme classes are properly applied
        }, 0);
        
        return () => clearTimeout(timeoutId);
    }, [currentTheme]);

    // Theme-aware utility function for consistent styling
    const getThemeClasses = useCallback((baseClasses: string, lightClasses: string, darkClasses: string) => {
        return `${baseClasses} ${currentTheme === 'dark' ? darkClasses : lightClasses}`;
    }, [currentTheme]);

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

    useEffect(() => {
        if (isAccountDropdownOpen) {
            clearCloseTimeout();
        }
    }, [isAccountDropdownOpen, clearCloseTimeout]);

    const scheduleClosePanel = useCallback(() => {
        clearCloseTimeout();
        closeTimeoutRef.current = setTimeout(() => {
            setHoveredItem((current) => {
                if (current === accountMenuId && isAccountDropdownOpenRef.current) {
                    return current;
                }
                return null;
            });
        }, HOVER_LEAVE_DELAY);
    }, [clearCloseTimeout, accountMenuId, isAccountDropdownOpenRef]);

    // Prevent closing when clicking inside submenu
    const handleSubmenuClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        clearCloseTimeout();
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

    const handleIconBlur = useCallback((event: React.FocusEvent) => {
        const nextTarget = event.relatedTarget;

        if (
            nextTarget &&
            typeof Node !== "undefined" &&
            nextTarget instanceof Node &&
            (sidebarRef.current?.contains(nextTarget) || submenuPanelRef.current?.contains(nextTarget))
        ) {
            return;
        }

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

        // Skip theme toggle - handled by Magic UI AnimatedThemeToggler component
        if (item.id === 'theme-toggle') {
            return;
        }

        // Special handling for account menu
        if (item.id === accountMenuId) {
            if (isAccountDropdownOpen) {
                setIsAccountDropdownOpen(false);
                setHoveredItem(null);
            } else {
                setIsAccountDropdownOpen(true);
                openPanelForItem(item.id);
            }
            return;
        }

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
    }, [clearCloseTimeout, clearHoverTimeout, handleNavigation, hoveredItem, openPanelForItem, accountMenuId, isAccountDropdownOpen]);

    // Handle keyboard navigation
    const handleIconKeyDown = useCallback((item: any, event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleIconClick(item);
        } else if (event.key === "Escape" || event.key === "ArrowLeft") {
            if (item.id === accountMenuId && isAccountDropdownOpen) {
                setIsAccountDropdownOpen(false);
                setHoveredItem(null);
            } else {
                scheduleClosePanel();
            }
        } else if (event.key === "ArrowRight" && (item.subItems || item.id === accountMenuId)) {
            clearCloseTimeout();
            openPanelForItem(item.id);
        }
    }, [clearCloseTimeout, handleIconClick, openPanelForItem, scheduleClosePanel, accountMenuId, isAccountDropdownOpen]);

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

    useEffect(() => {
        if (hoveredItem !== accountMenuId && isAccountDropdownOpen) {
            setIsAccountDropdownOpen(false);
        }
    }, [hoveredItem, accountMenuId, isAccountDropdownOpen]);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (sidebarRef.current?.contains(target) || submenuPanelRef.current?.contains(target)) {
                return;
            }
            setHoveredItem(null);
            setIsAccountDropdownOpen(false);
        };

        document.addEventListener("mousedown", handleDocumentClick);
        return () => document.removeEventListener("mousedown", handleDocumentClick);
    }, []);

    return (
        <div
            ref={sidebarRef}
            className="fixed left-0 top-0 z-50 h-screen bg-white dark:bg-[#0a0d12] group"
            style={{ width: ICON_SIDEBAR_WIDTH, padding: "4px 0 4px 4px" }}
            onMouseEnter={clearCloseTimeout}
            onMouseLeave={scheduleClosePanel}
        >
            {/* Collapsed Sidebar Content Container */}
            <div className="flex flex-col h-full bg-white dark:bg-[#0a0d12] border border-[#e9eaeb] dark:border-[#252b37] rounded-xl">
                {/* Header with Logo */}
                <div className="flex items-center justify-center pt-5 px-4">
                    <Logo size="sm" showText={false} variant="auto" />
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
                                            onBlur={handleIconBlur}
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
                        {/* AI Copilot Button */}
                        <CopilotToggleButton />
                        
                        {navigationStructure
                            .filter(section => section.section === 'footer')
                            .map(section => 
                                section.items.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = activeIconItem?.id === item.id;
                                    const isHovered = hoveredItem === item.id;
                                    const isThemeToggle = item.id === 'theme-toggle';
                                    
                                    // Special handling for theme toggle - use Magic UI component
                                    if (isThemeToggle) {
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200 hover:bg-[#fafafa] dark:hover:bg-[#252b37]/50"
                                                title={`${item.label} (${currentTheme})`}
                                            >
                                                <AnimatedThemeToggler className="w-5 h-5 text-[#a4a7ae] dark:text-[#717680] hover:text-[#717680] dark:hover:text-[#a4a7ae] transition-colors duration-200" />
                                            </div>
                                        );
                                    }
                                    
                                    return (
                                        <button
                                            key={item.id}
                                            ref={(el) => { iconRefs.current[item.id] = el; }}
                                            onClick={() => handleIconClick(item)}
                                            onMouseEnter={() => handleIconMouseEnter(item.id)}
                                            onMouseLeave={handleIconMouseLeave}
                                            onFocus={() => handleIconFocus(item.id)}
                                            onBlur={handleIconBlur}
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
                <div onClick={handleSubmenuClick}>
                    <SubmenuPanel
                        item={hoveredItemData}
                        activeUrl={pathname}
                        position={submenuPosition}
                        onNavigate={handleNavigation}
                        onClose={() => setHoveredItem(null)}
                        onMouseEnter={clearCloseTimeout}
                        onMouseLeave={scheduleClosePanel}
                        theme={currentTheme as "light" | "dark" | undefined}
                        user={user}
                        onLogout={onLogout}
                        isAccountDropdownOpen={isAccountDropdownOpen}
                        setIsAccountDropdownOpen={setIsAccountDropdownOpen}
                        panelRef={submenuPanelRef}
                    />
                </div>
            )}
        </div>
    );
};

export default CollapsedSidebar;
