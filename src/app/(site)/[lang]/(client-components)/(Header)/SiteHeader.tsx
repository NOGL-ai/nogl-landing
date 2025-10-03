"use client";

import React, { useEffect, useState, useCallback } from "react";
import Header3 from "./Header3";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/utils/useThemeMode";
import _ from "lodash";

export type SiteHeaders = "Header 1" | "Header 2" | "Header 3";

// Pages where we want to hide the header border
const PAGES_WITH_HIDDEN_BORDER = [
	"/listing-session-detail",
	// Add other base paths where you want to hide header border
];

const SiteHeader = () => {
	const [shouldShowHeader, setShouldShowHeader] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const pathname = usePathname();

	useThemeMode();

	// Handle scroll events
	const handleScroll = useCallback(() => {
		const currentScrollY = window.scrollY;

		if (currentScrollY < 50) {
			// Always show header when at the top
			setShouldShowHeader(true);
		} else if (currentScrollY > lastScrollY) {
			// Scrolling down
			setShouldShowHeader(false);
		} else if (currentScrollY < lastScrollY) {
			// Scrolling up
			setShouldShowHeader(true);
		}

		setLastScrollY(currentScrollY);
	}, [lastScrollY]);

	// Add scroll event listener
	useEffect(() => {
		const throttledHandleScroll = _.throttle(handleScroll, 100);
		window.addEventListener("scroll", throttledHandleScroll);

		return () => {
			window.removeEventListener("scroll", throttledHandleScroll);
			throttledHandleScroll.cancel();
		};
	}, [handleScroll]);

	// Check if current path should hide border
	const shouldHideHeaderBorder = useCallback(() => {
		return PAGES_WITH_HIDDEN_BORDER.some((path) => pathname?.startsWith(path));
	}, [pathname]);

	// Determine header class names
	const headerClassName = `fixed w-full transition-transform duration-300 ${
		shouldShowHeader ? "translate-y-0" : "-translate-y-full"
	} ${
		!shouldHideHeaderBorder()
			? "bg-white/90 backdrop-blur-sm shadow-sm dark:bg-neutral-900/90 dark:border-b dark:border-neutral-700"
			: ""
	}`;

	return (
		<>
			<Header3 className={headerClassName} />
			{/* To prevent content shift when header hides */}
			<div style={{ height: "80px" }}></div>
		</>
	);
};

export default SiteHeader;
