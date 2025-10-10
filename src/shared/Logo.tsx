"use client";

import React, { useId } from "react";
import Link from "next/link";
import { Route } from "@/routers/types";
import { usePathname } from "next/navigation";
import { i18n } from "@/i18n";

type LogoVariant = "light" | "dark" | "auto";
type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
	className?: string;
	variant?: LogoVariant;
	showText?: boolean;
	size?: LogoSize;
}

const sizeStyles: Record<LogoSize, { mark: string; text: string; gap: string }> = {
	sm: { mark: "h-8 w-8", text: "text-base", gap: "gap-2" },
	md: { mark: "h-10 w-10", text: "text-xl", gap: "gap-2.5" },
	lg: { mark: "h-12 w-12", text: "text-2xl", gap: "gap-3" },
	xl: { mark: "h-16 w-16", text: "text-3xl", gap: "gap-4" },
};

interface PixelSquare {
	x: number;
	y: number;
	opacity: number;
}

const pixelSquares: PixelSquare[] = [
	{ x: 21, y: 21, opacity: 1 },
	{ x: 21, y: 27, opacity: 0.6 },
	{ x: 27, y: 27, opacity: 0.32 },
	{ x: 34, y: 27, opacity: 0.07 },
	{ x: 14, y: 27, opacity: 0.32 },
	{ x: 7, y: 27, opacity: 0.07 },
	{ x: 21, y: 34, opacity: 0.32 },
	{ x: 14, y: 34, opacity: 0.07 },
	{ x: 27, y: 34, opacity: 0.07 },
	{ x: 21, y: 41, opacity: 0.07 },
	{ x: 14, y: 21, opacity: 0.6 },
	{ x: 7, y: 21, opacity: 0.32 },
	{ x: 0, y: 21, opacity: 0.07 },
	{ x: 27, y: 21, opacity: 0.6 },
	{ x: 34, y: 21, opacity: 0.32 },
	{ x: 41, y: 21, opacity: 0.07 },
	{ x: 21, y: 14, opacity: 0.6 },
	{ x: 14, y: 14, opacity: 0.32 },
	{ x: 14, y: 7, opacity: 0.07 },
	{ x: 7, y: 14, opacity: 0.07 },
	{ x: 27, y: 14, opacity: 0.32 },
	{ x: 27, y: 7, opacity: 0.07 },
	{ x: 34, y: 14, opacity: 0.07 },
	{ x: 21, y: 7, opacity: 0.32 },
	{ x: 21, y: 0, opacity: 0.07 },
];

interface PixelMarkProps {
	variant: Exclude<LogoVariant, "auto">;
}

const PixelMark: React.FC<PixelMarkProps> = ({ variant }) => {
	const gradientId = useId();
	const fillColor = variant === "dark" ? "#FFFFFF" : "#0A0D12";
	const backgroundColor = variant === "dark" ? "#0A0D12" : "transparent";
	const backgroundStroke = variant === "dark" ? "rgba(255,255,255,0.12)" : "transparent";

	return (
		<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' role='img' aria-hidden='true' className='h-full w-full'>
			{variant === "dark" && (
				<>
					<rect width='48' height='48' rx='12' fill={backgroundColor} />
					<rect width='48' height='48' rx='12' fill={`url(#${gradientId})`} />
					<rect
						width='46'
						height='46'
						rx='11'
						x='1'
						y='1'
						fill='none'
						stroke={backgroundStroke}
						strokeWidth='2'
					/>
				</>
			)}

			{pixelSquares.map((square, index) => (
				<rect
					key={`${square.x}-${square.y}-${index}`}
					x={square.x}
					y={square.y}
					width='7'
					height='7'
					rx='1.5'
					fill={fillColor}
					opacity={square.opacity}
				/>
			))}

			{variant === "dark" && (
				<defs>
					<linearGradient id={gradientId} x1='24' y1='0' x2='24' y2='48' gradientUnits='userSpaceOnUse'>
						<stop offset='0%' stopColor='#FFFFFF' stopOpacity='0' />
						<stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.12' />
					</linearGradient>
				</defs>
			)}
		</svg>
	);
};

const Logo: React.FC<LogoProps> = ({
	className = "",
	variant = "auto",
	showText = true,
	size = "md",
}) => {
	const { mark, text, gap } = sizeStyles[size];
	const textClasses =
		variant === "dark"
			? "text-white"
			: "text-slate-950 transition-colors duration-200 dark:text-white";
	const spacing = showText ? gap : "gap-0";

	// Determine current locale from the first URL segment
	const pathname = usePathname() || "/";
	const firstSegment = pathname.split("/").filter(Boolean)[0] || "";
	const locale = (i18n.locales as readonly string[]).includes(firstSegment) ? firstSegment : i18n.defaultLocale;

	return (
		<Link
			href={("/" + locale) as Route}
			className={`ttnc-logo inline-flex items-center ${spacing} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 ${className}`}
			aria-label='NOGL logo'
		>
			<span className={`${mark} inline-flex items-center justify-center`}>
				{variant === "auto" ? (
					<>
						<span className='block h-full w-full dark:hidden'>
							<PixelMark variant='light' />
						</span>
						<span className='hidden h-full w-full dark:block'>
							<PixelMark variant='dark' />
						</span>
					</>
				) : (
					<PixelMark variant={variant} />
				)}
			</span>
			{showText && (
				<span className={`${textClasses} font-semibold tracking-tight`}>NOGL</span>
			)}
		</Link>
	);
};

export default Logo;
