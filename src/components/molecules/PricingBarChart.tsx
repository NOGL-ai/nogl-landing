"use client";

import React, { useState, useEffect } from "react";
import { MoreVerticalIcon, PlusIcon } from "lucide-react";
import { calculateStackedMaxValue, calculateBarHeight } from "@/utils/chart-scaling";

interface BarChartDataPoint {
	month: string;
	comparable: number;
	competitive: number;
	premium: number;
}

interface PricingBarChartProps {
	dataByChannel: Record<string, BarChartDataPoint[]>;
}

export default function PricingBarChart({ dataByChannel }: PricingBarChartProps) {
	const [selectedTab, setSelectedTab] = useState("B2B");
	const [selectedPeriod, setSelectedPeriod] = useState("12 months");
	
	const tabs = ["B2B", "B2C", "D2C"];
	const periods = ["12 months", "30 days", "7 days"];

	// Select data based on active tab
	const currentData = dataByChannel[selectedTab] || dataByChannel.B2B || [];

	// ✅ NEW: Responsive breakpoints for smooth transitions
	const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

	useEffect(() => {
		const checkScreenSize = () => {
			const width = window.innerWidth;
			if (width < 640) {
				setScreenSize('mobile');
			} else if (width < 1280) {
				setScreenSize('tablet');
			} else {
				setScreenSize('desktop');
			}
		};
		
		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	// Responsive bar display: Mobile (7 bars) → Tablet (7 bars) → Desktop (12 bars)
	const displayData = screenSize === 'desktop'
		? currentData
		: currentData.filter((_, index) => index % 2 === 0 || index === currentData.length - 1);

	// Responsive sizing
	const chartConfig = {
		mobile: { barWidth: 'w-4', barPadding: 'px-3', labelPadding: 'px-2', height: 240 },
		tablet: { barWidth: 'w-6', barPadding: 'px-4', labelPadding: 'px-3', height: 220 },
		desktop: { barWidth: 'w-8', barPadding: 'px-5', labelPadding: 'px-6', height: 193 },
	};
	
	const config = chartConfig[screenSize];

	// ✅ FIXED: Calculate max from stacked TOTALS to prevent overflow
	// Uses utility function that sums all segments before finding max
	const maxValue = calculateStackedMaxValue(
		displayData as unknown as Record<string, unknown>[],
		['comparable', 'competitive', 'premium'],
		{ strategy: 'dynamic', padding: 1 }
	);

	return (
		<div className="flex min-w-0 flex-1 flex-col gap-5" role="region" aria-label="Pricing comparison chart">
			{/* Section Header */}
			<div className="flex flex-col gap-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
						<h2 className="text-base font-semibold leading-6 text-text-primary sm:text-lg sm:leading-7">
							How does your pricing look like?
						</h2>
					</div>
					<button 
						className="flex-shrink-0 text-fg-quaternary transition-colors hover:text-fg-quaternary-hover"
						aria-label="More options"
					>
						<MoreVerticalIcon className="h-5 w-5" strokeWidth={1.67} />
					</button>
				</div>
				<div className="h-px w-full bg-border-primary" />
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-1 rounded-[10px] border border-border-primary bg-bg-secondary p-1" role="tablist" aria-label="Business model">
				{tabs.map((tab) => (
					<button
						key={tab}
						onClick={() => setSelectedTab(tab)}
						role="tab"
						aria-selected={selectedTab === tab}
						aria-label={`${tab} pricing`}
						className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-semibold leading-5 transition-colors sm:px-3 ${
							selectedTab === tab
								? "bg-bg-primary text-text-secondary shadow-sm"
								: "text-text-tertiary hover:text-text-secondary"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			{/* Content */}
			<div className="flex flex-col gap-5">
				{/* Chart Container - Responsive */}
				<div className="relative flex-1">
					{/* Legend */}
					<div className="mb-5 flex flex-wrap items-start gap-x-4 gap-y-2 px-1">
						<ul className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:gap-x-4" role="list" aria-label="Chart legend">
							<li className="flex items-center gap-2">
								<span 
									className="h-2 w-2 rounded-full" 
									style={{ backgroundColor: 'var(--color-brand-200)' }}
									aria-hidden="true"
								/>
								<span className="text-sm leading-5 text-text-tertiary">Comparable pricing</span>
							</li>
							<li className="flex items-center gap-2">
								<span 
									className="h-2 w-2 rounded-full" 
									style={{ backgroundColor: 'var(--color-brand-500)' }}
									aria-hidden="true"
								/>
								<span className="text-sm leading-5 text-text-tertiary">Competitive pricing</span>
							</li>
							<li className="flex items-center gap-2">
								<span 
									className="h-2 w-2 rounded-full" 
									style={{ backgroundColor: 'var(--color-brand-700)' }}
									aria-hidden="true"
								/>
								<span className="text-sm leading-5 text-text-tertiary">Premium pricing</span>
							</li>
						</ul>
					</div>

					{/* Y-axis grid and bars */}
					<div className="relative" style={{ height: `${config.height}px` }}>
						{/* Y-axis grid lines */}
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="absolute left-0 right-0 border-t border-border-secondary"
								style={{ top: `${(i * 100) / 5}%` }}
								aria-hidden="true"
							/>
						))}

						{/* Bars - responsive width and padding */}
						<div className={`absolute inset-0 flex items-end justify-between ${config.barPadding}`}>
							{displayData.map((item, index) => (
								<div
									key={index}
									className={`flex flex-col items-center ${config.barWidth}`}
									role="group"
									aria-label={`${item.month}: ${item.comparable + item.competitive + item.premium} total`}
								>
									{/* Stacked bars - render TALLEST first (back), SHORTEST last (front) */}
									<div className="relative w-full" style={{ height: `${config.height - 26}px` }}>
										{/* Layer 3 (back): Total - Comparable color (lightest) */}
										<div
											className="absolute bottom-0 w-full rounded-t-md"
											style={{
												height: `${calculateBarHeight(item.premium + item.competitive + item.comparable, maxValue)}%`,
												backgroundColor: "var(--color-brand-200)",
												zIndex: 1,
											}}
											aria-label={`Comparable: ${item.comparable}`}
										/>
										{/* Layer 2 (middle): Premium + Competitive - Competitive color */}
										<div
											className="absolute bottom-0 w-full rounded-t-md"
											style={{
												height: `${calculateBarHeight(item.premium + item.competitive, maxValue)}%`,
												backgroundColor: "var(--color-brand-500)",
												zIndex: 2,
											}}
											aria-label={`Competitive: ${item.competitive}`}
										/>
										{/* Layer 1 (front): Premium only - Premium color (darkest) */}
										<div
											className="absolute bottom-0 w-full rounded-t-md"
											style={{
												height: `${calculateBarHeight(item.premium, maxValue)}%`,
												backgroundColor: "var(--color-brand-700)",
												zIndex: 3,
											}}
											aria-label={`Premium: ${item.premium}`}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* X-axis labels - responsive padding */}
					<div className={`flex justify-between pt-0 ${config.labelPadding}`} role="row" aria-label="Month labels">
						{displayData.map((item, index) => (
							<div
								key={index}
								className={`text-center text-xs leading-[18px] text-text-tertiary ${config.barWidth}`}
								role="columnheader"
							>
								{item.month}
							</div>
						))}
					</div>
				</div>

				{/* Bottom section - time periods */}
				<div className="flex flex-col gap-4">
					{/* Divider */}
					<div className="h-px w-full bg-border-primary" />
					
					{/* Actions row */}
					<div className="flex items-center justify-between gap-5">
						{/* Time period button group */}
						<div className="flex items-center overflow-hidden rounded-lg border border-border-primary shadow-sm">
							{periods.map((period, index) => (
								<button
									key={period}
									onClick={() => setSelectedPeriod(period)}
									className={`flex min-h-[40px] items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold leading-5 transition-colors ${
										index !== periods.length - 1 ? "border-r border-border-primary" : ""
									} ${
										selectedPeriod === period
											? "bg-bg-secondary text-text-primary"
											: "bg-bg-primary text-text-secondary hover:bg-bg-secondary"
									}`}
								>
									{period === '12 months' ? '12m' : period === '30 days' ? '30d' : period === '7 days' ? '7d' : period}
								</button>
							))}
							{/* Add custom period button */}
							<button 
								className="flex min-h-[40px] items-center justify-center px-3 py-2 text-text-quaternary transition-colors hover:text-text-tertiary"
								aria-label="Add custom time period"
							>
								<PlusIcon className="h-5 w-5" />
							</button>
						</div>
						
						{/* Calendar overview button */}
						<button className="flex items-center justify-center gap-1 rounded-lg border border-border-primary bg-bg-primary px-3.5 py-2.5 text-sm font-semibold leading-5 text-text-secondary shadow-sm transition-colors hover:bg-bg-secondary">
							Calendar overview
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
