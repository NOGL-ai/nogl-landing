"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon, MoreVerticalIcon } from "lucide-react";

interface MetricCardProps {
	label: string;
	value: string;
	change: {
		value: string;
		trend: "positive" | "negative";
	};
	compareText: string;
}

export default function MetricCard({
	label,
	value,
	change,
	compareText,
}: MetricCardProps) {
	const isPositive = change.trend === "positive";

	return (
		<div className="flex min-w-[280px] flex-1 flex-col gap-5 rounded-xl border border-border-primary bg-bg-primary p-5 shadow-sm md:min-w-[312px]">
			<div className="flex items-center justify-between">
				<h3 className="text-base font-semibold leading-6 text-text-primary">
					{label}
				</h3>
				<button className="text-fg-quaternary transition-colors hover:text-fg-quaternary-hover">
					<MoreVerticalIcon className="h-5 w-5" />
				</button>
			</div>

			<div className="flex items-end gap-4">
				<div className="flex flex-1 flex-col gap-3">
					<div className="text-3xl font-semibold leading-[38px] tracking-[-0.02em] text-text-primary">
						{value}
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center gap-0.5">
							{isPositive ? (
								<ArrowUpIcon className="h-4 w-4 text-fg-success-primary" strokeWidth={2} />
							) : (
								<ArrowDownIcon className="h-4 w-4 text-fg-error-primary" strokeWidth={2} />
							)}
							<span
								className={`text-center text-sm font-medium leading-5 ${
									isPositive ? "text-text-success" : "text-text-error"
								}`}
							>
								{change.value}
							</span>
						</div>
						<span className="truncate text-sm font-medium leading-5 text-text-secondary">
							{compareText}
						</span>
					</div>
				</div>

				{/* Mini Chart Placeholder */}
				<div className="relative h-14 w-28">
					<svg
						width="112"
						height="56"
						viewBox="0 0 112 56"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="h-full w-full"
					>
						<path
							d="M1 56L3.98612 48.5347C4.3321 47.6698 5.5687 47.7061 5.86328 48.5899L8.56126 56.6838"
							stroke={isPositive ? "#17B26A" : "#F04438"}
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							opacity="0.3"
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}
