import React from "react";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n";
import { getAuthSession } from "@/lib/auth";
import AnalyticsDashboard from "@/components/organisms/AnalyticsDashboard";
import { mockWinningProductsData } from "@/data/winningProducts";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ lang: Locale }>;
}) {
	const { lang } = await params;
	const dict = await getDictionary(lang);
	const session = await getAuthSession();

	// Get user's first name from session
	const userName = session?.user?.name?.split(" ")[0] || "User";

	// Sample metrics data
	const metricsData = [
		{
			label: "Users",
			value: "20.8k",
			change: { value: "12%", trend: "positive" as const },
			compareText: "vs last month",
		},
		{
			label: "Sessions",
			value: "26.4k",
			change: { value: "2%", trend: "negative" as const },
			compareText: "vs last month",
		},
		{
			label: "Session duration",
			value: "3m 52s",
			change: { value: "2%", trend: "positive" as const },
			compareText: "vs last month",
		},
	];

	// Winning products data (from mock API)
	const winningProductsData = mockWinningProductsData;

	// Pricing data by channel (B2B, B2C, D2C)
	const pricingDataByChannel = {
		B2B: [
			{ month: "Jan", comparable: 48, competitive: 97, premium: 145 },
			{ month: "Feb", comparable: 57, competitive: 116, premium: 177 },
			{ month: "Mar", comparable: 39, competitive: 76, premium: 113 },
			{ month: "Apr", comparable: 50, competitive: 101, premium: 153 },
			{ month: "May", comparable: 39, competitive: 76, premium: 113 },
			{ month: "Jun", comparable: 55, competitive: 111, premium: 169 },
			{ month: "Jul", comparable: 48, competitive: 96, premium: 145 },
			{ month: "Aug", comparable: 50, competitive: 101, premium: 153 },
			{ month: "Sep", comparable: 48, competitive: 96, premium: 145 },
			{ month: "Oct", comparable: 53, competitive: 106, premium: 161 },
			{ month: "Nov", comparable: 57, competitive: 116, premium: 177 },
			{ month: "Dec", comparable: 46, competitive: 91, premium: 137 },
		],
		B2C: [
			{ month: "Jan", comparable: 35, competitive: 80, premium: 120 },
			{ month: "Feb", comparable: 42, competitive: 95, premium: 140 },
			{ month: "Mar", comparable: 28, competitive: 65, premium: 95 },
			{ month: "Apr", comparable: 38, competitive: 85, premium: 125 },
			{ month: "May", comparable: 30, competitive: 68, premium: 100 },
			{ month: "Jun", comparable: 45, competitive: 98, premium: 145 },
			{ month: "Jul", comparable: 36, competitive: 82, premium: 122 },
			{ month: "Aug", comparable: 40, competitive: 88, premium: 130 },
			{ month: "Sep", comparable: 38, competitive: 84, premium: 126 },
			{ month: "Oct", comparable: 42, competitive: 92, premium: 138 },
			{ month: "Nov", comparable: 48, competitive: 102, premium: 152 },
			{ month: "Dec", comparable: 38, competitive: 80, premium: 118 },
		],
		D2C: [
			{ month: "Jan", comparable: 40, competitive: 88, premium: 130 },
			{ month: "Feb", comparable: 48, competitive: 105, premium: 155 },
			{ month: "Mar", comparable: 32, competitive: 70, premium: 105 },
			{ month: "Apr", comparable: 44, competitive: 92, premium: 138 },
			{ month: "May", comparable: 34, competitive: 72, premium: 108 },
			{ month: "Jun", comparable: 50, competitive: 105, premium: 158 },
			{ month: "Jul", comparable: 42, competitive: 90, premium: 135 },
			{ month: "Aug", comparable: 45, competitive: 95, premium: 142 },
			{ month: "Sep", comparable: 42, competitive: 92, premium: 138 },
			{ month: "Oct", comparable: 48, competitive: 100, premium: 150 },
			{ month: "Nov", comparable: 52, competitive: 110, premium: 165 },
			{ month: "Dec", comparable: 42, competitive: 88, premium: 128 },
		],
	};

	// Pricing overview pie chart data - Only 3 pricing tiers
	const pricingOverviewData = [
		{ label: "Premium pricing", value: 40, colorVar: "--color-brand-700" },
		{ label: "Competitive pricing", value: 35, colorVar: "--color-brand-500" },
		{ label: "Comparable pricing", value: 25, colorVar: "--color-brand-200" },
	];

	return (
		<AnalyticsDashboard
			userName={userName}
			metrics={metricsData}
			winningProductsData={winningProductsData}
			pricingBarChartData={pricingDataByChannel}
			pricingOverviewData={pricingOverviewData}
		/>
	);
}
