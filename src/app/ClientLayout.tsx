// ClientLayout.tsx
"use client";

import React from "react";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingScreen from "@/components/molecules/LoadingScreen";
import { RouteProvider } from "@/components/atoms/RouteProvider";

interface ClientLayoutProps {
	children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
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
