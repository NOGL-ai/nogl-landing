"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import DashboardPageClient from "./DashboardPageClient";

interface DashboardThemeWrapperProps {
	dict: unknown;
	priceChangesData: any[];
	pieChartData: any[];
	competitorColumns: any[];
	competitorData: any[];
	stockColumns: any[];
	stockData: any[];
}

export default function DashboardThemeWrapper(props: DashboardThemeWrapperProps) {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);
	
	return <DashboardPageClient {...props} theme={mounted ? (theme as 'light' | 'dark') : 'light'} />;
}
