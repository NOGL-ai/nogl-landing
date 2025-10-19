"use client";

import React from "react";
import { calculateStackedMaxValue, calculateBarHeight } from "@/utils/chart-scaling";

interface BarChartDataPoint {
	month: string;
	value1: number;
	value2: number;
	value3: number;
}

interface BarChartCardProps {
	data: BarChartDataPoint[];
}

export default function BarChartCard({ data }: BarChartCardProps) {
	// ✅ FIXED: Calculate max from stacked TOTALS to prevent overflow
	const maxValue = calculateStackedMaxValue(
		data as unknown as Record<string, unknown>[],
		['value1', 'value2', 'value3'],
		{ strategy: 'dynamic', padding: 1 }
	);

	return (
		<div className="w-full flex-1 rounded-xl border border-border-primary bg-bg-primary shadow-sm">
			<div className="flex flex-col gap-5 p-6">
				{/* Section Header */}
				<div className="flex flex-col gap-5">
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-1 flex-col justify-center gap-0.5">
							<h2 className="text-lg font-semibold leading-7 text-text-primary">
								When are you winning?
							</h2>
						</div>
						<button className="flex items-center justify-center gap-1 rounded-lg border border-border-primary bg-bg-primary px-3.5 py-2.5 shadow-sm transition-colors hover:bg-bg-secondary">
							<span className="px-0.5 text-sm font-semibold leading-5 text-text-secondary">
								Temporal performance
							</span>
						</button>
					</div>
					<div className="h-px w-full bg-border-primary" />
				</div>

				{/* Chart */}
				<div className="flex h-[240px] w-full flex-col gap-4">
					{/* Chart Grid */}
					<div className="relative flex-1">
						{/* Y-axis grid lines */}
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="absolute left-0 right-0 border-t border-border-secondary"
								style={{ top: `${(i * 100) / 5}%` }}
							/>
						))}

						{/* Bars */}
						<div className="absolute inset-0 flex items-end justify-between px-5">
							{data.map((item, index) => (
								<div
									key={index}
									className="flex w-8 flex-col items-center gap-1"
								>
									{/* Stacked bars */}
									<div className="relative w-full" style={{ height: "213px" }}>
										{/* Base bar (value3) - Premium/Dark */}
										<div
											className="absolute bottom-0 w-full rounded-t-md"
											style={{
												height: `${calculateBarHeight(item.value3, maxValue)}%`,
												backgroundColor: "var(--color-brand-700)",
											}}
										/>
										{/* Middle bar (value2 + value3) - Competitive */}
										<div
											className="absolute bottom-0 w-full rounded-t-md"
											style={{
												height: `${calculateBarHeight(item.value2 + item.value3, maxValue)}%`,
												backgroundColor: "var(--color-brand-500)",
											}}
										/>
										{/* Top bar (value1 + value2 + value3) - Comparable */}
										<div
											className="absolute bottom-0 w-full rounded-t-md"
											style={{
												height: `${calculateBarHeight(item.value1 + item.value2 + item.value3, maxValue)}%`,
												backgroundColor: "var(--color-brand-200)",
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* X-axis labels */}
					<div className="flex justify-between px-6">
						{data.map((item, index) => (
							<div
								key={index}
								className="text-center text-xs leading-[18px] text-text-tertiary"
							>
								{item.month}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
