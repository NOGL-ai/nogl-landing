"use client";

import React from "react";
import {
	QueryClient,
	QueryClientProvider as TanStackQueryClientProvider,
} from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

interface QueryClientProviderProps {
	children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
	return (
		<TanStackQueryClientProvider client={queryClient}>
			{children}
		</TanStackQueryClientProvider>
	);
}
