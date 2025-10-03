"use client";

import { useState, useCallback, useEffect } from "react";

interface UseSidebarOptions {
	defaultCollapsed?: boolean;
	persistState?: boolean;
	storageKey?: string;
}

interface UseSidebarReturn {
	isCollapsed: boolean;
	isMobileOpen: boolean;
	isHovered: boolean;
	toggleCollapse: () => void;
	openMobile: () => void;
	closeMobile: () => void;
	toggleMobile: () => void;
	setHovered: (hovered: boolean) => void;
}

export const useSidebar = (
	options: UseSidebarOptions = {}
): UseSidebarReturn => {
	const {
		defaultCollapsed = false,
		persistState = true,
		storageKey = "sidebar-collapsed",
	} = options;

	// Initialize collapsed state with default value to prevent hydration mismatch
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	// Mobile sidebar state
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Hover state for desktop sidebar
	const [isHovered, setIsHovered] = useState(false);

	// Load saved state from localStorage after hydration
	useEffect(() => {
		if (persistState && typeof window !== "undefined") {
			const saved = localStorage.getItem(storageKey);
			if (saved !== null) {
				setIsCollapsed(JSON.parse(saved));
			}
		}
	}, [persistState, storageKey]);

	// Persist collapsed state to localStorage
	useEffect(() => {
		if (persistState && typeof window !== "undefined") {
			localStorage.setItem(storageKey, JSON.stringify(isCollapsed));
		}
	}, [isCollapsed, persistState, storageKey]);

	// Toggle collapsed state
	const toggleCollapse = useCallback(() => {
		setIsCollapsed((prev: boolean) => !prev);
	}, []);

	// Mobile sidebar controls
	const openMobile = useCallback(() => {
		setIsMobileOpen(true);
	}, []);

	const closeMobile = useCallback(() => {
		setIsMobileOpen(false);
	}, []);

	const toggleMobile = useCallback(() => {
		setIsMobileOpen((prev) => !prev);
	}, []);

	// Hover controls
	const setHovered = useCallback((hovered: boolean) => {
		setIsHovered(hovered);
	}, []);

	// Close mobile sidebar on route change (to be used with Next.js router)
	useEffect(() => {
		const handleRouteChange = () => {
			setIsMobileOpen(false);
		};

		// Listen to route changes if router is available
		if (typeof window !== "undefined") {
			window.addEventListener("popstate", handleRouteChange);
			return () => window.removeEventListener("popstate", handleRouteChange);
		}
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Alt + S to toggle sidebar
			if (e.altKey && e.key === 's') {
				e.preventDefault();
				toggleCollapse();
			}
			// Escape to close mobile sidebar
			if (e.key === 'Escape' && isMobileOpen) {
				setIsMobileOpen(false);
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}
	}, [toggleCollapse, isMobileOpen]);

	return {
		isCollapsed,
		isMobileOpen,
		isHovered,
		toggleCollapse,
		openMobile,
		closeMobile,
		toggleMobile,
		setHovered,
	};
};
