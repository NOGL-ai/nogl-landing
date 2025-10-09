"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/atoms/ThemeProvider";
import { Session } from "next-auth";

export function Providers({ 
	children,
	session 
}: { 
	children: React.ReactNode;
	session: Session | null;
}) {
	return (
		<ThemeProvider>
			<SessionProvider 
				session={session}
				refetchInterval={0}
				refetchOnWindowFocus={false}
			>
				{children}
			</SessionProvider>
		</ThemeProvider>
	);
}
