"use client";
import Header from "../organisms/Header";
import { usePathname } from "next/navigation";
import { getProtectedPaths } from "@/config/routes.config";

export const HeaderWrapper = () => {
	const pathname = usePathname() || "";

	// Routes that should have the header hidden (app routes with sidebar)
	const appRoutes = getProtectedPaths();

	// Check if current path is an app route (has sidebar)
	const isAppRoute = appRoutes.some((route) => pathname.includes(route));

	// Check if current path is an auth route
	const isAuthRoute = pathname.includes("/auth/");

	return (
		<>
			{!pathname.startsWith("/admin") &&
				!pathname.startsWith("/user") &&
				!isAppRoute &&
				!isAuthRoute && <Header />}
		</>
	);
};
