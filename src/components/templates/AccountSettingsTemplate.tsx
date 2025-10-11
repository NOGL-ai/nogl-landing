"use client";

import { useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { PersonalInfoTab } from "./settings/PersonalInfoTab";
import { PlaceholderTab } from "./settings/PlaceholderTab";

// Tab items configuration for both dropdown and tabs
const tabItems = [
	{ id: "my-details", label: "My details" },
	{ id: "profile", label: "Profile" },
	{ id: "password", label: "Password" },
	{ id: "team", label: "Team" },
	{ id: "plan", label: "Plan" },
	{ id: "billing", label: "Billing" },
	{ id: "email", label: "Email" },
	{ id: "notifications", label: "Notifications", badge: 2 },
	{ id: "integrations", label: "Integrations" },
	{ id: "api", label: "API" },
];

export default function AccountSettingsTemplate() {
	const [selectedTab, setSelectedTab] = useState("my-details");

	return (
		<div className="flex min-h-screen flex-col gap-8 px-0 pb-12 pt-8">
			{/* Header Section */}
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-5 px-4 lg:px-8">
					{/* Page Header */}
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-4 lg:gap-y-5">
							<div className="flex flex-col gap-0.5 lg:min-w-[320px] lg:flex-1 lg:gap-1">
								<h1 className="text-[20px] leading-[30px] font-semibold text-gray-900 dark:text-white lg:text-display-xs lg:leading-[32px]">
									Settings
								</h1>
							</div>
						<div className="w-full lg:min-w-[200px] lg:max-w-[320px] lg:flex-1">
							<Input
								size="md"
								icon={SearchMd}
								placeholder="Search"
								className="w-full"
							/>
						</div>
						</div>
					</div>

					{/* Mobile: Dropdown Navigation */}
					<Select
						size="md"
						selectedKey={selectedTab}
						onSelectionChange={(key) => setSelectedTab(key as string)}
						items={tabItems}
						className="w-full lg:hidden"
					>
						{(item) => <Select.Item {...item}>{item.label}</Select.Item>}
					</Select>

					{/* Desktop: Horizontal Tabs */}
					<Tabs
						selectedKey={selectedTab}
						onSelectionChange={(key) => setSelectedTab(key as string)}
					>
						<Tabs.List
							size="sm"
							type="button-minimal"
							orientation="horizontal"
							items={tabItems}
							className="hidden lg:flex w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-900"
						>
							{(item) => (
								<Tabs.Item {...item}>{item.label}</Tabs.Item>
							)}
						</Tabs.List>

						<Tabs.Panel id="my-details">
							<PersonalInfoTab />
						</Tabs.Panel>

						<Tabs.Panel id="profile">
							<PlaceholderTab title="Profile" description="Configure your profile settings and preferences." />
						</Tabs.Panel>

						<Tabs.Panel id="password">
							<PlaceholderTab title="Password" description="Manage your password and security settings." />
						</Tabs.Panel>

						<Tabs.Panel id="team">
							<PlaceholderTab title="Team" description="Manage team members and permissions." />
						</Tabs.Panel>

						<Tabs.Panel id="plan">
							<PlaceholderTab title="Plan" description="View and manage your subscription plan." />
						</Tabs.Panel>

						<Tabs.Panel id="billing">
							<PlaceholderTab title="Billing" description="Manage billing information and payment methods." />
						</Tabs.Panel>

						<Tabs.Panel id="email">
							<PlaceholderTab title="Email" description="Configure email notifications and preferences." />
						</Tabs.Panel>

						<Tabs.Panel id="notifications">
							<PlaceholderTab title="Notifications" description="Manage notification settings across all channels." />
						</Tabs.Panel>

						<Tabs.Panel id="integrations">
							<PlaceholderTab title="Integrations" description="Connect and manage third-party integrations." />
						</Tabs.Panel>

						<Tabs.Panel id="api">
							<PlaceholderTab title="API" description="Manage API keys and developer settings." />
						</Tabs.Panel>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
