"use client";

import React, { useState } from "react";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

interface FilterSidebarProps {
	onFilterChange: (filters: unknown) => void;
	categories: string[];
	languages: string[];
	onClose?: () => void;
	isMobile?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
	onFilterChange,
	categories,
	languages,
	onClose,
	isMobile = false,
}) => {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
	const [minRating, setMinRating] = useState<number>(0);
	const [priceRange, setPriceRange] = useState<number[]>([0, 500]);

	// Reset all filters
	const handleReset = () => {
		setSelectedCategories([]);
		setSelectedLanguages([]);
		setMinRating(0);
		setPriceRange([0, 500]);
	};

	const handleFilterApply = () => {
		onFilterChange({
			categories: selectedCategories,
			languages: selectedLanguages,
			minRating,
			priceRange,
		});
		if (isMobile && onClose) onClose();
	};

	return (
		<motion.div
			initial={{ x: isMobile ? "100%" : -20, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: isMobile ? "100%" : -20, opacity: 0 }}
			className={`
        filter-sidebar overflow-y-auto
        ${
					isMobile
						? "fixed inset-y-0 right-0 w-full max-w-sm shadow-xl"
						: "w-72"
				}
        border-r bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800
      `}
		>
			{/* Header */}
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-lg font-semibold'>Filters</h3>
				{isMobile && (
					<button
						onClick={onClose}
						className='rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700'
					>
						<XMarkIcon className='h-5 w-5' />
					</button>
				)}
			</div>

			{/* Active Filters Summary */}
			<div className='mb-6'>
				<div className='flex flex-wrap gap-2'>
					{selectedCategories.map((category) => (
						<span
							key={category}
							className='flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
						>
							{category}
							<XMarkIcon
								className='h-4 w-4 cursor-pointer'
								onClick={() =>
									setSelectedCategories((prev) =>
										prev.filter((item) => item !== category)
									)
								}
							/>
						</span>
					))}
				</div>
			</div>

			{/* Categories */}
			<div className='filter-section mb-6'>
				<h4 className='mb-3 font-medium'>Categories</h4>
				<div className='space-y-2'>
					{categories.map((category) => (
						<label
							key={category}
							className='flex cursor-pointer items-center rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-700'
						>
							<input
								type='checkbox'
								checked={selectedCategories.includes(category)}
								onChange={(e) => {
									const value = category;
									setSelectedCategories((prev) =>
										prev.includes(value)
											? prev.filter((item) => item !== value)
											: [...prev, value]
									);
								}}
								className='h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500'
							/>
							<span className='ml-3 text-sm'>{category}</span>
						</label>
					))}
				</div>
			</div>

			{/* Languages */}
			<div className='filter-section mb-6'>
				<h4 className='mb-3 font-medium'>Languages</h4>
				<div className='space-y-2'>
					{languages.map((language) => (
						<label
							key={language}
							className='flex cursor-pointer items-center rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-700'
						>
							<input
								type='checkbox'
								checked={selectedLanguages.includes(language)}
								onChange={(e) => {
									const value = language;
									setSelectedLanguages((prev) =>
										prev.includes(value)
											? prev.filter((item) => item !== value)
											: [...prev, value]
									);
								}}
								className='h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500'
							/>
							<span className='ml-3 text-sm'>{language}</span>
						</label>
					))}
				</div>
			</div>

			{/* Rating */}
			<div className='filter-section mb-6'>
				<h4 className='mb-3 font-medium'>Minimum Rating</h4>
				<div className='flex items-center gap-4'>
					<input
						type='range'
						min={0}
						max={5}
						step={0.5}
						value={minRating}
						onChange={(e) => setMinRating(parseFloat(e.target.value))}
						className='h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-neutral-200'
					/>
					<div className='flex min-w-[80px] items-center gap-1'>
						<StarIcon className='h-5 w-5 text-yellow-400' />
						<span className='text-sm font-medium'>{minRating}</span>
					</div>
				</div>
			</div>

			{/* Price Range */}
			<div className='filter-section mb-6'>
				<h4 className='mb-3 font-medium'>Hourly Rate (€)</h4>
				<div className='flex gap-4'>
					<div className='flex-1'>
						<input
							type='number'
							placeholder='Min'
							value={priceRange[0]}
							onChange={(e) =>
								setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])
							}
							className='w-full rounded-lg border border-neutral-300 p-2 text-sm dark:border-neutral-600'
						/>
					</div>
					<div className='flex-1'>
						<input
							type='number'
							placeholder='Max'
							value={priceRange[1]}
							onChange={(e) =>
								setPriceRange([priceRange[0], parseFloat(e.target.value) || 0])
							}
							className='w-full rounded-lg border border-neutral-300 p-2 text-sm dark:border-neutral-600'
						/>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className='sticky bottom-0 border-t bg-white pb-2 pt-4 dark:border-neutral-700 dark:bg-neutral-800'>
				<div className='flex gap-3'>
					<button
						onClick={handleReset}
						className='flex-1 rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700'
					>
						Reset All
					</button>
					<button
						onClick={handleFilterApply}
						className='flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700'
					>
						Apply Filters
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default FilterSidebar;
