"use client";

import React, { useEffect, useState } from "react";
import { MoreVerticalIcon } from "lucide-react";

interface PieChartDataPoint {
	label: string;
	value: number;
	colorVar: string; // CSS variable name like '--color-brand-700'
}

interface PricingOverviewChartProps {
	data: PieChartDataPoint[];
}

export default function PricingOverviewChart({ data }: PricingOverviewChartProps) {
	const [colors, setColors] = useState<string[]>([]);
	const [bgColor, setBgColor] = useState<string>('#FFFFFF'); // ✅ NEW: Track background color

	// Get computed colors from CSS variables on mount and when theme changes
	useEffect(() => {
		const getComputedColors = () => {
			const computedColors = data.map((item) => {
				const color = getComputedStyle(document.documentElement)
					.getPropertyValue(item.colorVar)
					.trim();
				return color || '#9E77ED'; // Fallback
			});
			setColors(computedColors);
			
			// ✅ FIXED: Force re-computation by waiting for next frame
			requestAnimationFrame(() => {
				const bg = getComputedStyle(document.documentElement)
					.getPropertyValue('--color-bg-primary')
					.trim();
				setBgColor(bg || '#FFFFFF');
			});
		};

		getComputedColors();
		
		// Listen for theme changes
		const observer = new MutationObserver(() => {
			// ✅ FIXED: Delay to ensure CSS has updated
			setTimeout(getComputedColors, 50);
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	}, [data]);

	const total = data.reduce((sum, item) => sum + item.value, 0);

	// Calculate pie chart segments
	let currentAngle = -90; // Start from top
	const segments = data.map((item, index) => {
		const percentage = (item.value / total) * 100;
		const angle = (percentage / 100) * 360;
		const segment = {
			...item,
			color: colors[index] || '#9E77ED',
			percentage,
			startAngle: currentAngle,
			endAngle: currentAngle + angle,
		};
		currentAngle += angle;
		return segment;
	});

	// Create SVG path for each segment (donut chart)
	const createArc = (
		startAngle: number,
		endAngle: number,
		innerRadius: number,
		outerRadius: number
	) => {
		const start = polarToCartesian(140, 140, outerRadius, endAngle);
		const end = polarToCartesian(140, 140, outerRadius, startAngle);
		const innerStart = polarToCartesian(140, 140, innerRadius, endAngle);
		const innerEnd = polarToCartesian(140, 140, innerRadius, startAngle);

		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		return [
			`M ${start.x} ${start.y}`,
			`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
			`L ${innerEnd.x} ${innerEnd.y}`,
			`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
			"Z",
		].join(" ");
	};

	const polarToCartesian = (
		centerX: number,
		centerY: number,
		radius: number,
		angleInDegrees: number
	) => {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	};

	return (
		<div className="flex w-full flex-col gap-5 lg:w-[392px]" role="region" aria-label="Pricing overview chart">
			{/* Section Header */}
			<div className="flex flex-col gap-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex flex-1 flex-col justify-center gap-0.5">
						<h2 className="text-lg font-semibold leading-7 text-text-primary">
							Pricing Overview
						</h2>
					</div>
					<button 
						className="text-fg-quaternary transition-colors hover:text-fg-quaternary-hover"
						aria-label="More options"
					>
						<MoreVerticalIcon className="h-5 w-5" strokeWidth={1.67} />
					</button>
				</div>
				<div className="h-px w-full bg-border-primary" />
			</div>

			{/* Pie Chart and Legend */}
			<div className="flex items-start gap-4">
				{/* Pie Chart */}
				<svg 
					width="280" 
					height="280" 
					viewBox="0 0 280 280" 
					className="flex-shrink-0"
					role="img"
					aria-labelledby="pie-chart-title"
					aria-describedby="pie-chart-legend"
				>
					<title id="pie-chart-title">Pricing distribution donut chart</title>
					{/* Background circle */}
					<circle
						cx="140"
						cy="140"
						r="122.5"
						fill="none"
						stroke="var(--color-border-primary)"
						strokeWidth="35"
					/>

					{/* Segments */}
					{segments.map((segment, index) => (
						<path
							key={index}
							d={createArc(segment.startAngle, segment.endAngle, 105, 140)}
							fill={segment.color}
							aria-label={`${segment.label}: ${segment.value}%`}
						/>
					))}

				{/* Inner circle - theme aware */}
				<circle cx="140" cy="140" r="105" fill={bgColor} />
				</svg>

				{/* Legend - Only show items with labels */}
				<div className="flex flex-col gap-1 py-4" id="pie-chart-legend" role="list" aria-label="Chart legend">
					{data
						.map((item, index) => ({ ...item, originalIndex: index }))
						.filter((item) => item.label && item.label.trim() !== '')
						.map((item) => (
							<div key={item.originalIndex} className="flex items-start gap-2" role="listitem">
								<div className="flex items-center gap-2 pt-1.5">
									<div
										className="h-2 w-2 rounded-full"
										style={{ 
											backgroundColor: colors[item.originalIndex] || 'var(--color-brand-500)',
											border: '1px solid rgba(0, 0, 0, 0.1)'
										}}
										aria-hidden="true"
									/>
								</div>
								<div className="text-sm leading-5 text-text-tertiary">
									{item.label}
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
