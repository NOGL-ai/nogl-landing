/**
 * Map Location Marker Component
 * 
 * Animated circular marker with ripple effect for map locations.
 * Based on Figma design with three concentric circles.
 */

import React from "react";
import { cx } from "@/utils/cx";

interface MapLocationMarkerProps {
	/** Unique identifier for the marker */
	id: string;
	/** X position as percentage (0-100) */
	x: number;
	/** Y position as percentage (0-100) */
	y: number;
	/** Whether the marker is currently hovered */
	isHovered?: boolean;
	/** Callback when marker is hovered */
	onHover?: (id: string) => void;
	/** Callback when hover ends */
	onHoverEnd?: () => void;
	/** Click handler */
	onClick?: (id: string) => void;
	/** Accessibility label */
	"aria-label"?: string;
	className?: string;
}

export default function MapLocationMarker({
	id,
	x,
	y,
	isHovered = false,
	onHover,
	onHoverEnd,
	onClick,
	className = "",
	...props
}: MapLocationMarkerProps) {
	return (
		<button
			className={cx(
				"absolute flex items-center justify-center transition-transform duration-300",
				"focus:outline-none focus:ring-2 focus:ring-border-brand focus:ring-offset-2",
				"cursor-pointer",
				isHovered && "scale-110 z-10",
				className
			)}
			style={{
				left: `${x}%`,
				top: `${y}%`,
				transform: "translate(-50%, -50%)",
				width: "48px",
				height: "48px",
			}}
			onMouseEnter={() => onHover?.(id)}
			onMouseLeave={onHoverEnd}
			onClick={() => onClick?.(id)}
			aria-label={props["aria-label"] || `Location marker ${id}`}
			type="button"
		>
			{/* Outer circle - 40px diameter, 10% opacity */}
			<div
				className={cx(
					"absolute rounded-full transition-all duration-300",
					"bg-[#9E77ED]"
				)}
				style={{
					width: "40px",
					height: "40px",
					opacity: isHovered ? 0.15 : 0.1,
				}}
			/>
			
			{/* Middle circle - 24px diameter, 20% opacity */}
			<div
				className={cx(
					"absolute rounded-full transition-all duration-300",
					"bg-[#9E77ED]"
				)}
				style={{
					width: "24px",
					height: "24px",
					opacity: isHovered ? 0.3 : 0.2,
				}}
			/>
			
			{/* Inner circle - 8px diameter, solid */}
			<div
				className={cx(
					"absolute rounded-full transition-all duration-300",
					"bg-[#9E77ED]",
					isHovered && "scale-125"
				)}
				style={{
					width: "8px",
					height: "8px",
					opacity: 1,
				}}
			/>

			{/* Pulse animation on hover */}
			{isHovered && (
				<div
					className="absolute rounded-full bg-[#9E77ED] animate-ping"
					style={{
						width: "40px",
						height: "40px",
						opacity: 0.2,
					}}
				/>
			)}
		</button>
	);
}

