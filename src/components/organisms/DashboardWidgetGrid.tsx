"use client";

import React from "react";

interface DashboardWidgetGridProps {
	children: React.ReactNode;
	columns?: 1 | 2 | 3 | 4;
	gap?: "sm" | "md" | "lg";
	className?: string;
}

const DashboardWidgetGrid: React.FC<DashboardWidgetGridProps> = ({
	children,
	columns = 3,
	gap = "md",
	className = "",
}) => {
	const getGridClasses = () => {
		const colsMap = {
			1: "grid-cols-1",
			2: "grid-cols-1 md:grid-cols-2",
			3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
			4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
		};

		const gapMap = {
			sm: "gap-3",
			md: "gap-4 lg:gap-6",
			lg: "gap-6 lg:gap-8",
		};

		return `grid ${colsMap[columns]} ${gapMap[gap]}`;
	};

	return <div className={`${getGridClasses()} ${className}`}>{children}</div>;
};

interface DashboardSectionProps {
	title?: string;
	children: React.ReactNode;
	className?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
	title,
	children,
	className = "",
}) => {
	return (
		<div className={`space-y-4 ${className}`}>
			{title && (
				<h2 className='text-lg font-semibold text-primary'>
					{title}
				</h2>
			)}
			{children}
		</div>
	);
};

export default DashboardWidgetGrid;
