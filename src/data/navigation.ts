import { NavItemType } from "@/shared/Navigation/NavigationItem";
import { Route } from "@/routers/types";

export const NAVIGATION_DEMO: NavItemType[] = [
	{
		id: "home",
		name: "Home",
		href: "/",
	},
	{
		id: "sessions",
		name: "Sessions",
		href: "/listing-session",
		children: [
			{
				id: "browse-sessions",
				name: "Browse Sessions",
				href: "/listing-session",
			},
			{
				id: "featured-experts",
				name: "Featured Experts (Coming Soon)",
				href: "/",
			},
			{
				id: "upcoming-sessions",
				name: "Upcoming Sessions (Coming Soon)",
				href: "/",
			}
		],
	},
	{
		id: "account",
		name: "Account",
		href: "#",
		children: [
			{
				id: "my-bookings",
				name: "My Bookings",
				href: "/account-bookings",
			},
			{
				id: "saved-sessions",
				name: "Saved Sessions",
				href: "/account-savelists",
			},
			{
				id: "profile",
				name: "Profile Settings",
				href: "/user",
			}
		],
	},
	{
		id: "support",
		name: "Support",
		href: "/support",
	}
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
		id: "terms",
		name: "Terms of Service",
		href: "/tos",
	}
];
