"use client";

import React, { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { NavigationItem } from "@/types/navigation";

interface SidebarItemProps {
	item: NavigationItem;
	isActive: boolean;
	isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
	item,
	isActive,
	isCollapsed,
}) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
	const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

	const hasSubmenu = item.submenu && item.submenu.length > 0;

	const baseClasses = clsx(
		"flex items-center gap-2 px-3 py-2 rounded-[5px] transition-all duration-200 relative",
		"font-inter text-[14px] font-medium leading-5 tracking-[-0.084px]",
		"cursor-pointer", // Ensure cursor indicates clickability
		isActive
			? "bg-[#375DFB] text-white shadow-sm"
			: "text-[#9293A9] hover:bg-[#375DFB]/10 hover:text-[#375DFB] hover:shadow-sm"
	);

	const iconClasses = clsx(
		"w-5 h-5 flex-shrink-0",
		isActive ? "text-white" : "text-[#9293A9]"
	);

	const submenuItemClasses = (subItem: NavigationItem) =>
		clsx(
			"flex items-center gap-2 px-3 py-2 rounded-[5px] transition-all duration-200 relative ml-6",
			"font-inter text-[14px] font-medium leading-5 tracking-[-0.084px]",
			"hover:scale-[1.02] transform-gpu", // Subtle scale effect on hover
			subItem.isActive
				? "bg-[#375DFB] text-white shadow-sm"
				: "text-[#9293A9] hover:bg-[#375DFB]/10 hover:text-[#375DFB] hover:shadow-sm"
		);

	const handleItemClick = () => {
		if (hasSubmenu && !isCollapsed) {
			setIsSubmenuOpen(!isSubmenuOpen);
		}
	};

	const handleMouseEnter = () => {
		// Clear any existing timeout
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			setHoverTimeout(null);
		}

		if (hasSubmenu && !isCollapsed) {
			setIsSubmenuOpen(true);
		}
		if (isCollapsed) {
			setShowTooltip(true);
		}
	};

	const handleMouseLeave = () => {
		// Add delay before closing to prevent accidental closures
		if (hasSubmenu && !isCollapsed) {
			const timeout = setTimeout(() => {
				setIsSubmenuOpen(false);
			}, 300); // 300ms delay - industry standard for dropdowns
			setHoverTimeout(timeout);
		}
		setShowTooltip(false);
	};

	return (
		<div
			className='group relative'
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{/* Main item */}
			{hasSubmenu ? (
				<div className={baseClasses} onClick={handleItemClick}>
					{/* Icon */}
					<div className={iconClasses}>{item.icon}</div>

					{/* Title (only visible when expanded) */}
					{!isCollapsed && <span className='flex-1'>{item.title}</span>}

					{/* Badge (only visible when expanded and badge exists) */}
					{!isCollapsed && item.badge && (
						<div
							className={clsx(
								"rounded px-1.5 py-0.5 text-[12px] font-medium leading-3",
								item.badge.variant === "new" && "bg-[#DF1C41] text-white",
								item.badge.variant === "soon" && isActive
									? "bg-white/10 text-white"
									: "bg-[#375DFB]/10 text-[#375DFB]",
								item.badge.variant === "default" && "bg-secondary_bg text-secondary"
							)}
						>
							{item.badge.text}
						</div>
					)}

					{/* Submenu arrow (only visible when expanded and has submenu) */}
					{!isCollapsed && hasSubmenu && (
						<div
							className={clsx(
								"h-4 w-4 transition-all duration-200 ease-in-out",
								isSubmenuOpen ? "rotate-90 text-[#375DFB]" : "rotate-0"
							)}
						>
							<svg
								width='16'
								height='16'
								viewBox='0 0 16 16'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M6 4L10 8L6 12'
									stroke='currentColor'
									strokeWidth='1.5'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
					)}
				</div>
			) : (
				<Link href={item.path as any} className={baseClasses}>
					{/* Icon */}
					<div className={iconClasses}>{item.icon}</div>

					{/* Title (only visible when expanded) */}
					{!isCollapsed && <span className='flex-1'>{item.title}</span>}

					{/* Badge (only visible when expanded and badge exists) */}
					{!isCollapsed && item.badge && (
						<div
							className={clsx(
								"rounded px-1.5 py-0.5 text-[12px] font-medium leading-3",
								item.badge.variant === "new" && "bg-[#DF1C41] text-white",
								item.badge.variant === "soon" && isActive
									? "bg-white/10 text-white"
									: "bg-[#375DFB]/10 text-[#375DFB]",
								item.badge.variant === "default" && "bg-secondary_bg text-secondary"
							)}
						>
							{item.badge.text}
						</div>
					)}
				</Link>
			)}

			{/* Submenu items */}
			{!isCollapsed && hasSubmenu && isSubmenuOpen && (
				<div className='animate-in slide-in-from-top-1 mt-1 space-y-1 transition-all duration-200 ease-in-out'>
					{item.submenu!.map((subItem) => (
						<Link
							key={subItem.id}
							href={subItem.path as any}
							className={submenuItemClasses(subItem)}
						>
							<span className='flex-1'>{subItem.title}</span>
							{subItem.isActive && (
								<div className='absolute bottom-2 right-0 top-2 w-1 rounded-l-[4px] bg-[#375DFB]' />
							)}
						</Link>
					))}
				</div>
			)}

			{/* Tooltip for collapsed state */}
			{isCollapsed && showTooltip && (
				<div className='absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 transform'>
					<div className='whitespace-nowrap rounded bg-background px-2 py-1 text-sm text-white shadow-lg'>
						{item.title}
						{item.badge && (
							<span
								className={clsx(
									"ml-2 rounded px-1.5 py-0.5 text-xs",
									item.badge.variant === "new" && "bg-red-500 text-white",
									item.badge.variant === "soon" && "bg-blue-500 text-white",
									item.badge.variant === "default" && "bg-border text-white"
								)}
							>
								{item.badge.text}
							</span>
						)}
						{/* Tooltip arrow */}
						<div className='absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-gray-900'></div>
					</div>
				</div>
			)}

			{/* Active indicator (blue line on the right) */}
			{isActive && (
				<div className='absolute bottom-2 right-0 top-2 w-1 rounded-l-[4px] bg-[#375DFB]' />
			)}
		</div>
	);
};

export default SidebarItem;
