import React from "react";
import SidebarLayout from "@/components/templates/SidebarLayout";
import HideFooterOnApp from "@/components/molecules/HideFooterOnApp";
import { getAuthSession } from "@/lib/auth";
import { AssistantSidebar } from "@/components/assistant-sidebar";
import { CopilotRuntimeProvider } from "@/components/application/slideout-menus/copilot-runtime-provider";
import { ScreenContextProvider } from "@/context/ScreenContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	let session = null;

	try {
		session = await getAuthSession();
	} catch (error) {
		console.error('Error fetching session:', error);
		session = null;
	}

	// Map session user to UserProfile type or use fallback
	const user = session?.user ? {
		name: session.user.name || undefined,
		email: session.user.email || undefined,
		avatar: session.user.image || undefined,
	} : {
		name: "Emon Pixels",
		email: "emon683@nogl.io",
		avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format",
	};

	return (
		<ScreenContextProvider>
			<CopilotRuntimeProvider>
				<AssistantSidebar>
					<SidebarLayout user={user}>
						<HideFooterOnApp />
						{children}
					</SidebarLayout>
				</AssistantSidebar>
			</CopilotRuntimeProvider>
		</ScreenContextProvider>
	);
}
