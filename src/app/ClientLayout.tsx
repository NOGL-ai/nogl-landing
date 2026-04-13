// ClientLayout.tsx
"use client";

import React from "react";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingScreen from "@/components/molecules/LoadingScreen";
import { RouteProvider } from "@/components/atoms/RouteProvider";
import { useInitializeApp } from "@/hooks/useInitializeApp";

interface ClientLayoutProps {
	children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
	// Initialize app on first load (database checks, etc.)
	useInitializeApp();

	return (
		<RouteProvider>
			<LoadingProvider>
				<LoadingScreen />
				{children}
			</LoadingProvider>
		</RouteProvider>
	);
};

export default ClientLayout;
