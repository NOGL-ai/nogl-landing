"use client";

import React from "react";

interface PieChartDataPoint {
	label: string;
	value: number;
	color: string;
}

interface PieChartCardProps {
	data: PieChartDataPoint[];
}

export default function PieChartCard({ data }: PieChartCardProps) {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	// Calculate pie chart segments
	let currentAngle = -90; // Start from top
	const segments = data.map((item) => {
		const percentage = (item.value / total) * 100;
		const angle = (percentage / 100) * 360;
		const segment = {
			...item,
			percentage,
			startAngle: currentAngle,
			endAngle: currentAngle + angle,
		};
		currentAngle += angle;
		return segment;
	});

	// Create SVG path for each segment
	const createArc = (
		startAngle: number,
		endAngle: number,
		innerRadius: number,
		outerRadius: number
	) => {
		const start = polarToCartesian(100, 100, outerRadius, endAngle);
		const end = polarToCartesian(100, 100, outerRadius, startAngle);
		const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
		const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);

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
		<div className="flex w-full items-start gap-4 lg:w-auto">
			{/* Pie Chart */}
			<svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
				{/* Background circle */}
				<circle cx="100" cy="100" r="87.5" fill="none" stroke="#E9EAEB" strokeWidth="25" />

				{/* Segments */}
				{segments.map((segment, index) => (
					<path
						key={index}
						d={createArc(segment.startAngle, segment.endAngle, 75, 100)}
						fill={segment.color}
						opacity={0.9}
					/>
				))}

				{/* Inner white circle */}
				<circle cx="100" cy="100" r="75" fill="var(--color-bg-primary)" />
			</svg>

			{/* Legend */}
			<div className="flex flex-col gap-1 py-4">
				{data.map((item, index) => (
					<div key={index} className="flex items-start gap-2">
						<div className="flex items-center gap-2 pt-1.5">
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
						</div>
						<div className="text-sm leading-5 text-text-tertiary">
							{item.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
