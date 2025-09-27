"use client";
import Header from ".";
import { usePathname } from "next/navigation";

export const HeaderWrapper = () => {
	const pathname = usePathname() || '';

	// Routes that should have the header hidden (app routes with sidebar)
	const appRoutes = [
		'/dashboard',
		'/catalog', 
		'/competitors',
		'/repricing',
		'/reports',
		'/product-feed',
		'/settings',
		'/account',
		'/notifications',
		'/profile'
	];

	// Check if current path is an app route (has sidebar)
	const isAppRoute = appRoutes.some(route => pathname.includes(route));

	return (
		<>
			{!pathname.startsWith("/admin") && !pathname.startsWith("/user") && !isAppRoute && (
				<Header />
			)}
		</>
	);
};