"use client";

import { useState } from "react";
import { SearchMd } from "@untitledui/icons";
import { Tabs } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { PersonalInfoTab } from "./settings/PersonalInfoTab";
import { PlaceholderTab } from "./settings/PlaceholderTab";

export default function AccountSettingsTemplate() {
	const [selectedTab, setSelectedTab] = useState("my-details");

	return (
		<div className="flex min-h-screen flex-col gap-8 bg-white px-0 pb-12 pt-8 dark:bg-gray-950">
			{/* Header Section */}
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-5 px-8">
					{/* Page Header */}
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap items-start gap-x-4 gap-y-5">
							<div className="flex min-w-[320px] flex-1 flex-col gap-1">
								<h1 className="text-display-xs font-semibold text-gray-900 dark:text-white">
									Settings
								</h1>
							</div>
							<div className="flex min-w-[200px] max-w-[320px] flex-1">
									<Input
										size="sm"
										icon={SearchMd}
										placeholder="Search"
										shortcut="⌘K"
										className="w-full"
									/>
							</div>
						</div>
					</div>

					{/* Horizontal Tabs */}
					<Tabs
						selectedKey={selectedTab}
						onSelectionChange={(key) => setSelectedTab(key as string)}
					>
						<Tabs.List
							size="sm"
							type="button-minimal"
							orientation="horizontal"
							items={[
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
							]}
							className="w-full rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-gray-900"
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
