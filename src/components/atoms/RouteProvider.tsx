"use client";

import type { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";

interface RouterContextType {
	navigate: (path: string, options?: any) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export const useRouterContext = () => {
	const context = useContext(RouterContext);
	if (!context) {
		throw new Error("useRouterContext must be used within a RouteProvider");
	}
	return context;
};

export const RouteProvider = ({ children }: PropsWithChildren) => {
	const router = useRouter();

	const navigate = (
		path: string,
		options?: Parameters<typeof router.push>[1]
	) => {
		router.push(path as any, options);
	};

	return (
		<RouterContext.Provider value={{ navigate }}>
			{children}
		</RouterContext.Provider>
	);
};
