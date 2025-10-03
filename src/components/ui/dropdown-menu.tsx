"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
	children: React.ReactNode;
	className?: string;
}

interface DropdownMenuTriggerProps {
	children: React.ReactNode;
	className?: string;
	asChild?: boolean;
}

interface DropdownMenuContentProps {
	children: React.ReactNode;
	className?: string;
	align?: "start" | "center" | "end";
}

interface DropdownMenuItemProps {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	disabled?: boolean;
}

interface DropdownMenuSeparatorProps {
	className?: string;
}

interface DropdownMenuCheckboxItemProps {
	children: React.ReactNode;
	className?: string;
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	onClick?: () => void;
	disabled?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className }) => {
	return (
		<div className={cn("relative inline-block text-left", className)}>
			{children}
		</div>
	);
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
	children,
	className,
	asChild = false,
}) => {
	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(children, {
			className: cn(children.props.className, className),
		});
	}

	return (
		<button
			className={cn(
				"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
				className
			)}
		>
			{children}
		</button>
	);
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
	children,
	className,
	align = "center",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div
			ref={dropdownRef}
			className={cn(
				"absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				align === "end"
					? "right-0"
					: align === "start"
						? "left-0"
						: "left-1/2 -translate-x-1/2",
				"top-full mt-1",
				isOpen ? "block" : "hidden",
				className
			)}
		>
			{children}
		</div>
	);
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
	children,
	className,
	onClick,
	disabled = false,
}) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
				"focus:bg-gray-100 focus:text-gray-900",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				disabled && "pointer-events-none opacity-50",
				className
			)}
		>
			{children}
		</button>
	);
};

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
	className,
}) => {
	return (
		<div
			className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
			role='separator'
		/>
	);
};

const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({
	children,
	className,
	checked = false,
	onCheckedChange,
	onClick,
	disabled = false,
}) => {
	const handleClick = () => {
		if (onClick) {
			onClick();
		} else if (onCheckedChange) {
			onCheckedChange(!checked);
		}
	};

	return (
		<button
			onClick={handleClick}
			disabled={disabled}
			className={cn(
				"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
				"focus:bg-gray-100 focus:text-gray-900",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				disabled && "pointer-events-none opacity-50",
				className
			)}
		>
			<div className='flex items-center space-x-2'>
				<input
					type='checkbox'
					checked={checked}
					onChange={() => onCheckedChange?.(!checked)}
					className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
				/>
				<span>{children}</span>
			</div>
		</button>
	);
};

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
};
