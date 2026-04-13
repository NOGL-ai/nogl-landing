"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export function Providers({ 
	children,
	session 
}: { 
	children: React.ReactNode;
	session: Session | null;
}) {
	return (
		<SessionProvider 
			session={session}
			refetchInterval={0}
			refetchOnWindowFocus={false}
		>
			{children}
		</SessionProvider>
	);
}
