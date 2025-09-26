"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/utils/useThemeMode";

const ClientCommons = () => {
	const [mounted, setMounted] = useState(false);
	useThemeMode();

	const pathname = usePathname();
	
	//  CUSTOM THEME STYLE
	useEffect(() => {
		setMounted(true);
		
		// Only access document on client-side
		if (typeof window !== 'undefined' && typeof document !== 'undefined') {
			const $body = document.querySelector("body");
			if (!$body) return;

			let newBodyClass = "";

			if (pathname === "/home-3") {
				newBodyClass = "theme-purple-blueGrey";
			}
			if (pathname === "/home-2") {
				newBodyClass = "theme-cyan-blueGrey";
			}

			newBodyClass && $body.classList.add(newBodyClass);
			return () => {
				newBodyClass && $body.classList.remove(newBodyClass);
			};
		}
	}, [pathname]);

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return <></>;
	}

	return <></>;
};

export default ClientCommons;
