"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "../Icon";

export function ProductTableFilters() {
	const [activeFilters, setActiveFilters] = useState<string[]>([]);

	const quickFilters = [
		{ id: "under-50", label: "Under €50", iconName: "Minus" },
		{ id: "premium", label: "Premium", iconName: "Star" },
		{ id: "with-data", label: "With Data", iconName: "TrendingUp" },
		{ id: "stilnest", label: "Stilnest", iconName: "Target" },
	];

	const handleFilterToggle = (filterId: string) => {
		setActiveFilters(prev => 
			prev.includes(filterId) 
				? prev.filter(id => id !== filterId)
				: [...prev, filterId]
		);
	};

	const clearAllFilters = () => {
		setActiveFilters([]);
	};

	return (
		<div 
			className="space-y-4"
			role="region"
			aria-label="Product table filters"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						onClick={() => {}}
						className="relative"
						aria-label={`Filter products. ${activeFilters.length > 0 ? `${activeFilters.length} filters active.` : 'No filters active.'}`}
						aria-expanded="false"
						aria-haspopup="true"
					>
						<Icon name="Filter" className="mr-2 h-4 w-4" aria-hidden={true} />
						Filters
						{activeFilters.length > 0 && (
							<Badge
								variant="secondary"
								className="ml-2 flex h-5 w-5 items-center justify-center rounded-full border-blue-200 bg-blue-100 p-0 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
								aria-label={`${activeFilters.length} active filters`}
							>
								{activeFilters.length}
							</Badge>
						)}
					</Button>

					{activeFilters.length > 0 && (
						<Button
							variant="ghost"
							onClick={clearAllFilters}
							className="h-8 px-2"
							aria-label="Clear all active filters"
						>
							<Icon name="FilterX" className="mr-2 h-4 w-4" aria-hidden={true} />
							Clear All
						</Button>
					)}
				</div>
			</div>

			<div 
				className="flex flex-wrap gap-2"
				role="group"
				aria-label="Quick filter options"
			>
				{quickFilters.map((filter) => {
					const isActive = activeFilters.includes(filter.id);
					
					return (
						<Button
							key={filter.id}
							variant={isActive ? "primary" : "secondary"}
							size="sm"
							onClick={() => handleFilterToggle(filter.id)}
							className={isActive ? "" : "border-border text-secondary hover:bg-secondary_bg dark:border-border dark:text-tertiary"}
							aria-pressed={isActive}
							aria-label={`${isActive ? 'Remove' : 'Apply'} ${filter.label} filter`}
						>
							<Icon name={filter.iconName as any} className="mr-1 h-3 w-3" aria-hidden={true} />
							{filter.label}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
