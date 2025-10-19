"use client";

import React from "react";

interface PieChartData {
	label: string;
	value: number;
	percentage: number;
	color: string;
}

interface PieChartProps {
	data: PieChartData[];
	centerValue: string;
	centerLabel: string;
	title: string;
	size?: number;
	className?: string;
}

const PieChart: React.FC<PieChartProps> = ({
	data,
	centerValue,
	centerLabel,
	title,
	size = 169,
	className = "",
}) => {
	// Calculate cumulative percentages for pie segments
	let cumulativePercentage = 0;
	const segments = data.map((item) => {
		const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
		cumulativePercentage += item.percentage;
		const endAngle = cumulativePercentage * 3.6;
		return {
			...item,
			startAngle,
			endAngle,
		};
	});

	// Generate SVG path for each segment
	const generatePath = (
		centerX: number,
		centerY: number,
		radius: number,
		startAngle: number,
		endAngle: number
	) => {
		const startAngleRad = (startAngle - 90) * (Math.PI / 180);
		const endAngleRad = (endAngle - 90) * (Math.PI / 180);

		// Round to 6 decimal places to ensure consistent precision between server and client
		const x1 = Math.round((centerX + radius * Math.cos(startAngleRad)) * 1000000) / 1000000;
		const y1 = Math.round((centerY + radius * Math.sin(startAngleRad)) * 1000000) / 1000000;
		const x2 = Math.round((centerX + radius * Math.cos(endAngleRad)) * 1000000) / 1000000;
		const y2 = Math.round((centerY + radius * Math.sin(endAngleRad)) * 1000000) / 1000000;

		const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

		return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
	};

	const centerX = Math.round((size / 2) * 1000000) / 1000000;
	const centerY = Math.round((size / 2) * 1000000) / 1000000;
	const radius = Math.round(((size - 20) / 2) * 1000000) / 1000000; // Leave some margin

	return (
		<div
			className={`rounded-lg border border-[#E2E4E9] bg-white p-5 dark:border-border dark:bg-secondary_bg ${className}`}
		>
			{/* Title */}
			<div className='mb-5 flex items-center justify-between'>
				<h3
					className='text-lg font-bold leading-6 text-[#111827] dark:text-white'
					style={{
						fontFamily: "Manrope",
						fontSize: "18px",
						lineHeight: "24px",
					}}
				>
					{title}
				</h3>
			</div>

			<div className='flex flex-col items-center gap-5'>
				{/* Pie Chart */}
				<div className='relative' style={{ width: size, height: size }}>
					<svg width={size} height={size} className='-rotate-90 transform'>
						{segments.map((segment, index) => (
							<path
								key={index}
								d={generatePath(
									centerX,
									centerY,
									radius,
									segment.startAngle,
									segment.endAngle
								)}
								fill={segment.color}
							/>
						))}
					</svg>

					{/* Center Label */}
					<div
						className='absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-[0_5px_40px_0_rgba(0,0,0,0.10)] dark:bg-secondary_bg dark:shadow-[0_5px_40px_0_rgba(0,0,0,0.3)]'
						style={{
							width: "98px",
							height: "98px",
							left: "36px",
							top: "36px",
						}}
					>
						<div className='text-center'>
							<div
								className='text-2xl font-bold leading-8 text-[#111827] dark:text-white'
								style={{
									fontFamily: "Manrope",
									fontSize: "24px",
									lineHeight: "130%",
								}}
							>
								{centerValue}
							</div>
							<div
								className='text-xs font-normal leading-5 text-[#A0AEC0] dark:text-tertiary'
								style={{
									fontFamily: "Manrope",
									fontSize: "12px",
									lineHeight: "160%",
								}}
							>
								{centerLabel}
							</div>
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className='flex w-full flex-col gap-1'>
					{data.map((item, index) => (
						<div
							key={index}
							className='flex items-center justify-between border-b border-[#E5E5E5] py-2 last:border-b-0 dark:border-border'
						>
							<div className='flex items-center gap-3'>
								<div
									className='h-[6.796px] w-[6.796px] rounded-full'
									style={{ backgroundColor: item.color }}
								/>
								<span
									className='text-xs font-medium leading-5 text-[#687588] dark:text-tertiary'
									style={{
										fontFamily: "Manrope",
										fontSize: "12px",
										lineHeight: "160%",
									}}
								>
									{item.label}
								</span>
							</div>
							<span
								className='text-sm font-bold leading-6 tracking-wide text-[#111827] dark:text-white'
								style={{
									fontFamily: "Manrope",
									fontSize: "14px",
									lineHeight: "160%",
									letterSpacing: "0.2px",
									opacity: 0.75,
								}}
							>
								{item.percentage.toFixed(2)}%
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PieChart;
