import { NavItemType } from "@/shared/Navigation/NavigationItem";
// import { Route } from "@/routers/types";

export const NAVIGATION_DEMO: NavItemType[] = [
	{
		id: "dashboard",
		name: "Dashboard",
		href: "/dashboard",
	},
	{
		id: "help",
		name: "Help Center",
		href: "/blog",
	},
	{
		id: "legal",
		name: "Legal",
		href: "#",
		children: [
			{
				id: "privacy",
				name: "Privacy Policy",
				href: "/privacy-policy",
			},
			{
				id: "terms",
				name: "Terms of Service",
				href: "/tos",
			},
			{
				id: "impressum",
				name: "Impressum",
				href: "/impressum",
			},
			{
				id: "datenschutz",
				name: "Datenschutz",
				href: "/datenschutz",
			},
			{
				id: "agb",
				name: "AGB",
				href: "/agb",
			},
		],
	},
];

// Secondary navigation for footer or other areas
export const NAVIGATION_DEMO_2: NavItemType[] = [
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
	{
		id: "impressum",
		name: "Impressum",
		href: "/impressum",
	},
	{
		id: "agb",
		name: "AGB",
		href: "/agb",
	},
	{
		id: "help",
		name: "Help Center",
		href: "/blog",
	},
];
