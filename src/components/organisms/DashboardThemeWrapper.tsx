"use client";

import { useTheme } from "next-themes";
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
	
	return <DashboardPageClient {...props} theme={theme as 'light' | 'dark'} />;
}
