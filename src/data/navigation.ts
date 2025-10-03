import { NavItemType } from "@/shared/Navigation/NavigationItem";
// import { Route } from "@/routers/types";

export const NAVIGATION_DEMO: NavItemType[] = [
	{
		id: "home",
		name: "Home",
		href: "/",
	},
	{
		id: "account",
		name: "Account",
		href: "#",
		children: [
			{
				id: "profile",
				name: "Profile Settings",
				href: "/user",
			},
		],
	},
	{
		id: "support",
		name: "Support",
		href: "/support",
	},
];

// Secondary navigation for footer or other areas
export const NAVIGATION_DEMO_2: NavItemType[] = [
	{
		id: "about",
		name: "About Us",
		href: "/about",
	},
	{
		id: "contact",
		name: "Contact",
		href: "/contact",
	},
	{
		id: "privacy",
		name: "Privacy Policy",
		href: "/privacy-policy",
	},
	{
		id: "privacy-de",
		name: "Datenschutzerklärung",
		href: "/datenschutz",
	},
	{
		id: "terms",
		name: "Terms of Service",
		href: "/tos",
	},
];
