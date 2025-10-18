"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import DashboardPageClient from "./DashboardPageClient";
import { useScreenContext } from "@/context/ScreenContext";

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
	const screenContext = useScreenContext();
	const [mounted, setMounted] = useState(false);

	// Prevent hydration mismatch - standard Next.js SSR pattern
	// eslint-disable-next-line
	useEffect(() => {
		setMounted(true);
	}, []);
	
	// ✅ Pass visible data to ScreenContext for AI Copilot
	// This is the correct pattern for updating context based on page data
	// eslint-disable-next-line
	useEffect(() => {
		if (mounted && props.priceChangesData && props.competitorData) {
			screenContext.setData("pricing", {
				priceChanges: props.priceChangesData,
				pieChart: props.pieChartData,
				summary: {
					overpriced: props.pieChartData.find(d => d.label.includes("overpriced") || d.label.includes("Überbewertet"))?.value || 0,
					competitive: props.pieChartData.find(d => d.label.includes("competitive") || d.label.includes("Wettbewerbsfähig"))?.value || 0,
					samePrice: props.pieChartData.find(d => d.label.includes("same") || d.label.includes("Gleicher"))?.value || 0,
				},
				currency: "USD",
				visibleAt: new Date().toISOString(),
			});
			
			screenContext.setData("competitors", {
				recentChanges: props.competitorData.map(item => ({
					product: item.product.name,
					brand: item.product.brand,
					competitor: item.competitor.name,
					priceChange: {
						from: item.change.from,
						to: item.change.to,
						direction: parseFloat(item.change.to) < parseFloat(item.change.from) ? "decreased" : "increased",
					},
					time: item.time,
				})),
				stockChanges: props.stockData?.map(item => ({
					product: item.product.name,
					competitor: item.competitor.name,
					stockChange: item.stockChange,
					time: item.time,
				})) || [],
				visibleAt: new Date().toISOString(),
			});
		}
		// ✅ FIX: Removed screenContext from deps to prevent infinite loop
		// The setData calls don't need to re-trigger when context changes
	}, [mounted, props.priceChangesData, props.pieChartData, props.competitorData, props.stockData]);
	
	return <DashboardPageClient {...props as any} theme={mounted ? (theme as 'light' | 'dark') : 'light'} />;
}
