"use client";

import React, { useState } from "react";
import ChartDropdown from "../atoms/ChartDropdown";

interface StackedBarData {
	month: string;
	overpriced: number;
	samePrice: number;
	competitive: number;
}

interface StackedBarChartProps {
	data: StackedBarData[];
	title: string;
	maxValue?: number;
	className?: string;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
	data,
	title,
	maxValue = 20000,
	className = "",
}) => {
	const [timePeriod, setTimePeriod] = useState("last-year");

	const yAxisLabels = ["20k", "15k", "10k", "0"];
	const chartHeight = 242;

	const legends = [
		{ label: "Overpriced product", color: "#FB3748" },
		{ label: "Same price product", color: "#CACFD8" },
		{ label: "Competitive product", color: "#1FC16B" },
	];

	return (
		<div
			className={`rounded-lg border border-[#E2E4E9] bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}
		>
			{/* Header */}
			<div className='mb-5 flex items-center justify-between'>
				<div className='flex items-start gap-2'>
					<span
						className='text-base font-medium leading-6 text-[#111827] dark:text-white'
						style={{
							fontFamily: "Inter",
							fontSize: "16px",
							lineHeight: "24px",
							letterSpacing: "-0.176px",
						}}
					>
						{title}
					</span>
				</div>
				<ChartDropdown value={timePeriod} onChange={setTimePeriod} />
			</div>

			{/* Chart */}
			<div className='flex items-start gap-6'>
				{/* Y-axis labels */}
				<div className='flex h-[242px] w-6 flex-col justify-between'>
					{yAxisLabels.map((label, index) => (
						<span
							key={index}
							className='text-xs leading-4 text-[#525866] dark:text-gray-400'
							style={{
								fontFamily: "Inter",
								fontSize: "12px",
								lineHeight: "16px",
							}}
						>
							{label}
						</span>
					))}
				</div>

				{/* Chart Content */}
				<div className='flex-1 pr-2'>
					<div className='flex items-start gap-6'>
						{/* Bars Container */}
						<div className='flex flex-1 gap-6'>
							{data.map((item, index) => {
								const total =
									item.overpriced + item.samePrice + item.competitive;
								const overpricedHeight = Math.max(
									16,
									(item.overpriced / maxValue) * chartHeight
								);
								const samePriceHeight = Math.max(
									0,
									(item.samePrice / maxValue) * chartHeight
								);
								const competitiveHeight = Math.max(
									0,
									(item.competitive / maxValue) * chartHeight
								);
								const usedHeight =
									overpricedHeight + samePriceHeight + competitiveHeight;
								const emptyHeight = Math.max(0, chartHeight - usedHeight);

								return (
									<div
										key={index}
										className='flex flex-1 flex-col items-center gap-3'
									>
										{/* Bar */}
										<div
											className='flex flex-1 flex-col items-center justify-end gap-0.5'
											style={{ height: chartHeight }}
										>
											{/* Empty space */}
											<div
												className='w-full bg-[#F5F7FA]'
												style={{ height: `${emptyHeight}px` }}
											/>
											{/* Stacked segments */}
											{competitiveHeight > 0 && (
												<div
													className='w-full bg-[#1FC16B]'
													style={{ height: `${competitiveHeight}px` }}
												/>
											)}
											{samePriceHeight > 0 && (
												<div
													className='w-full bg-[#CACFD8]'
													style={{ height: `${samePriceHeight}px` }}
												/>
											)}
											<div
												className='w-full bg-[#FB3748]'
												style={{ height: `${overpricedHeight}px` }}
											/>
										</div>

										{/* Month label */}
										<span
											className='text-center text-xs leading-4 text-[#525866] dark:text-gray-400'
											style={{
												fontFamily: "Inter",
												fontSize: "12px",
												lineHeight: "16px",
											}}
										>
											{item.month}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Legend */}
			<div className='mt-5 flex gap-0 rounded-[10px]'>
				{legends.map((legend, index) => (
					<div
						key={index}
						className='flex flex-1 flex-col items-start gap-2 p-4'
					>
						<div className='flex items-center gap-1.5'>
							<div
								className='h-2.5 w-2.5 rounded-full'
								style={{ backgroundColor: legend.color }}
							/>
							<span
								className='text-sm leading-5 text-[#0F1324] opacity-60 dark:text-gray-300'
								style={{
									fontFamily: "Inter",
									fontSize: "14px",
									lineHeight: "20px",
									letterSpacing: "-0.07px",
								}}
							>
								{legend.label}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default StackedBarChart;
