"use client";

import React, { useState } from "react";
import { Building06 } from "@untitledui/icons";
import { Checkbox } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { cx } from "@/utils/cx";

export interface Competitor {
	id: string;
	name: string;
	url: string;
	lastChecked: string;
	enabled: boolean;
	avatar?: string;
}

interface CompetitorCardProps {
	competitor: Competitor;
	selected: boolean;
	onSelect: (id: string, selected: boolean) => void;
	onToggle: (id: string, enabled: boolean) => void;
	disabled?: boolean;
	loading?: boolean;
	className?: string;
}

/**
 * CompetitorCard Component
 * 
 * Displays an individual competitor with selection checkbox and enable/disable toggle.
 * Follows Untitled UI design patterns with full accessibility support.
 * 
 * Features:
 * - Checkbox for multi-select
 * - Avatar with fallback icon
 * - Name, URL, and last checked timestamp
 * - Enable/disable toggle switch
 * - Multiple states: default, hover, selected, disabled, loading
 * - Truncation with tooltips for long text
 * - Micro-interactions (scale, shadow elevation)
 * - Full keyboard navigation
 * - ARIA labels and roles
 * 
 * States:
 * - Default: Normal card with gray border
 * - Hover: Elevated shadow, subtle bg change
 * - Selected: Blue border, brand tint background
 * - Disabled: Grayed out, cursor-not-allowed
 * - Loading: Disabled with spinner on toggle
 */
export function CompetitorCard({
	competitor,
	selected,
	onSelect,
	onToggle,
	disabled = false,
	loading = false,
	className,
}: CompetitorCardProps) {
	const [toggleLoading, setToggleLoading] = useState(false);

	const handleToggleChange = async (checked: boolean) => {
		setToggleLoading(true);
		try {
			await onToggle(competitor.id, checked);
		} finally {
			setToggleLoading(false);
		}
	};

	const formatLastChecked = (timestamp: string) => {
		try {
			const date = new Date(timestamp);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMs / 3600000);
			const diffDays = Math.floor(diffMs / 86400000);

			if (diffMins < 1) return "Just now";
			if (diffMins < 60) return `${diffMins}m ago`;
			if (diffHours < 24) return `${diffHours}h ago`;
			if (diffDays < 7) return `${diffDays}d ago`;
			return date.toLocaleDateString();
		} catch {
			return timestamp;
		}
	};

	const isDisabled = disabled || loading;

	return (
		<div
			className={cx(
				// Base layout
				"group relative flex items-center gap-3 rounded-lg border p-3",
				// Background
				"bg-background",
				// Border & Shadow
				"border-border-primary shadow-xs",
				// Transitions
				"transition-all duration-200 ease-out",
				// Hover state
				!isDisabled && "hover:shadow-md hover:bg-bg-secondary",
				// Selected state
				selected && [
					"border-border-brand border-2 bg-bg-brand-secondary_alt",
					"-m-px", // Compensate for 2px border
				],
				// Disabled state
			isDisabled && "cursor-not-allowed opacity-50",
			// Custom className
			className
		)}
		role="listitem"
			aria-selected={selected}
			aria-disabled={isDisabled}
		>
			{/* Selection Checkbox */}
			<Checkbox
				isSelected={selected}
				onChange={(checked) => onSelect(competitor.id, checked)}
				isDisabled={isDisabled}
				className={cx(
					"flex size-5 shrink-0 items-center justify-center rounded",
					"border-2 border-border-primary bg-background",
					"transition-all duration-150",
					// Focus ring
					"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
					// Checked state
					"data-[selected]:border-brand-solid data-[selected]:bg-brand-solid",
					// Hover
					!isDisabled && "hover:border-brand-solid",
					// Disabled
					isDisabled && "cursor-not-allowed opacity-50"
				)}
				aria-label={`Select ${competitor.name}`}
			>
				{({ isSelected }) =>
					isSelected && (
						<svg
							className="size-3 text-white"
							viewBox="0 0 12 12"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M10 3L4.5 8.5L2 6"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)
				}
			</Checkbox>

			{/* Avatar */}
			<Avatar
				size="md"
				src={competitor.avatar}
				alt={competitor.name}
				fallback={
					<Building06 className="size-5 text-text-quaternary" />
				}
				className="shrink-0"
			/>

			{/* Content */}
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				{/* Name with truncation */}
				<TooltipTrigger>
					<h4
						className={cx(
							"truncate text-sm font-semibold",
							"text-text-primary"
						)}
					>
						{competitor.name}
					</h4>
					{competitor.name.length > 30 && (
						<Tooltip>{competitor.name}</Tooltip>
					)}
				</TooltipTrigger>

				{/* URL with truncation */}
				<TooltipTrigger>
					<a
						href={competitor.url}
						target="_blank"
						rel="noopener noreferrer"
						className={cx(
							"truncate text-xs text-text-tertiary",
							!isDisabled &&
								"hover:text-text-brand hover:underline transition-colors"
						)}
						onClick={(e) => {
							if (isDisabled) {
								e.preventDefault();
							}
						}}
					>
						{competitor.url.replace(/^https?:\/\/(www\.)?/, "")}
					</a>
					{competitor.url.length > 40 && (
						<Tooltip>{competitor.url}</Tooltip>
					)}
				</TooltipTrigger>

				{/* Last Checked */}
				<p className="text-xs text-text-quaternary">
					Last checked: {formatLastChecked(competitor.lastChecked)}
				</p>
			</div>

			{/* Toggle Switch */}
			<div className="flex shrink-0 items-center gap-2">
				{toggleLoading && (
					<svg
						className="size-4 animate-spin text-text-quaternary"
						viewBox="0 0 20 20"
						fill="none"
						aria-hidden="true"
					>
						<circle
							className="opacity-25"
							cx="10"
							cy="10"
							r="8"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M10 2a8 8 0 018 8h-2a6 6 0 00-6-6V2z"
						/>
					</svg>
				)}
				
				<Checkbox
					isSelected={competitor.enabled}
					onChange={handleToggleChange}
					isDisabled={isDisabled || toggleLoading}
					className={cx(
						// Base styling
						"relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full",
						"transition-colors duration-200 ease-out",
						// Background colors
						"bg-gray-200 dark:bg-gray-700",
						"data-[selected]:bg-brand-solid",
						// Focus ring
						"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
						// Disabled
						(isDisabled || toggleLoading) && "cursor-not-allowed opacity-50"
					)}
					aria-label={`${competitor.enabled ? "Disable" : "Enable"} ${
						competitor.name
					}`}
				>
					{({ isSelected }) => (
						<span
							className={cx(
								// Base styling
								"inline-block size-4 rounded-full bg-white shadow-sm",
								"transition-transform duration-200 ease-out",
								// Position
								"translate-x-0.5",
								isSelected && "translate-x-[1.125rem]"
							)}
							aria-hidden="true"
						/>
					)}
				</Checkbox>
			</div>

			{/* Status Badge */}
			<div
				className={cx(
					"absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full",
					"ring-2 ring-background",
					competitor.enabled
						? "bg-success-solid"
						: "bg-gray-300 dark:bg-gray-600",
					// Pulse animation when status changes
					"transition-all duration-300"
				)}
				aria-label={competitor.enabled ? "Active" : "Inactive"}
			>
				<span className="sr-only">
					{competitor.enabled ? "Active" : "Inactive"}
				</span>
			</div>
		</div>
	);
}

