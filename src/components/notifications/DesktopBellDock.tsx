"use client";

import React from "react";
import { NotificationsBell } from "./NotificationsBell";

/**
 * Fixed-position bell for desktop. The app doesn't have a shared
 * DashboardTopBar yet, so this sits in the top-right of the main
 * content area above the page. Hidden on mobile (the MobileHeader
 * already renders a bell there).
 */
export function DesktopBellDock() {
	return (
		<div className="pointer-events-none fixed right-6 top-4 z-30 hidden lg:block">
			<div className="pointer-events-auto">
				<NotificationsBell />
			</div>
		</div>
	);
}
