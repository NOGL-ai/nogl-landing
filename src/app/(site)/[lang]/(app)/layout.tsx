import React from "react";
import SidebarLayout from "@/components/templates/SidebarLayout";
import Particles from "@/components/ui/particles";
import GlassmorphismBackground from "@/components/atoms/GlassmorphismBackground";
import { getAuthSession } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const session = await getAuthSession();
	
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
		<SidebarLayout user={user}>
			<div className='relative min-h-screen overflow-hidden'>
				<Particles
					className='absolute inset-0 -z-10'
					quantity={3000}
					ease={70}
					size={0.5}
					staticity={40}
					color='#4F46E5'
				/>
				<GlassmorphismBackground />
				<main className='relative z-10 flex-1'>{children}</main>
			</div>
		</SidebarLayout>
	);
}
