"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "outlined" | "elevated" | "filled";
	padding?: "none" | "sm" | "md" | "lg";
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	subtitle?: string;
	action?: React.ReactNode;
}

export interface CardContentProps
	extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardTitleProps
	extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps
	extends React.HTMLAttributes<HTMLParagraphElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant = "default", padding = "md", ...props }, ref) => {
	const variants = {
		default: "bg-background border border-border",
		outlined: "bg-background border-2 border-border",
		elevated: "bg-background shadow-lg border border-border",
		filled: "bg-secondary_bg border border-border",
	};

		const paddings = {
			none: "",
			sm: "p-4",
			md: "p-6",
			lg: "p-8",
		};

		return (
			<div
				ref={ref}
				className={cn(
					"rounded-lg transition-colors",
					variants[variant],
					paddings[padding],
					className
				)}
				{...props}
			/>
		);
	}
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, title, subtitle, action, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex flex-col space-y-1.5 p-6", className)}
			{...props}
		>
			{(title || subtitle || action) && (
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						{title && (
							<h3 className='text-lg font-semibold leading-none tracking-tight'>
								{title}
							</h3>
						)}
						{subtitle && <p className='text-sm text-tertiary'>{subtitle}</p>}
					</div>
					{action && <div>{action}</div>}
				</div>
			)}
			{children}
		</div>
	)
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
	)
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex items-center p-6 pt-0", className)}
			{...props}
		/>
	)
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
	({ className, ...props }, ref) => (
		<h3
			ref={ref}
			className={cn(
				"text-lg font-semibold leading-none tracking-tight",
				className
			)}
			{...props}
		/>
	)
);

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	CardDescriptionProps
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn("text-sm text-tertiary", className)} {...props} />
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";

export {
	Card,
	CardHeader,
	CardContent,
	CardFooter,
	CardTitle,
	CardDescription,
};
