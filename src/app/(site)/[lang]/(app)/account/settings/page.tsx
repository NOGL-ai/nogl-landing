import { Metadata } from "next";
import AccountSettingsTemplate from "@/components/templates/AccountSettingsTemplate";

export const metadata: Metadata = {
	title: "Settings | Nogl",
	description: "Manage your account settings, profile, and preferences",
	keywords: [
		"settings",
		"account settings",
		"profile",
		"preferences",
		"user settings",
	],
	openGraph: {
		title: "Settings | Nogl",
		description: "Manage your account settings, profile, and preferences",
		type: "website",
	},
};

export default function SettingsPage() {
	return <AccountSettingsTemplate />;
}
