/**
 * Country Flag Components
 * 
 * Pixel-perfect flag SVGs extracted from Figma design.
 * These replace emoji flags for better cross-platform consistency.
 */

import React from "react";

interface FlagProps {
	className?: string;
	size?: number;
	"aria-label"?: string;
}

/**
 * Germany Flag (DE)
 */
export function FlagDE({ className = "", size = 24, ...props }: FlagProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label={props["aria-label"] || "Germany flag"}
		>
			<g clipPath="url(#clip-de)">
				{/* Black stripe */}
				<rect
					x="0.75"
					y="15.13"
					width="22.5"
					height="8.12"
					fill="#0A0A0A"
				/>
				{/* Red stripe */}
				<rect
					x="0.75"
					y="0.75"
					width="22.5"
					height="8.12"
					fill="#D00000"
				/>
				{/* Yellow stripe */}
				<rect
					x="0"
					y="7.83"
					width="24"
					height="8.35"
					fill="#FFCE00"
				/>
			</g>
			<defs>
				<clipPath id="clip-de">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

/**
 * France Flag (FR)
 */
export function FlagFR({ className = "", size = 24, ...props }: FlagProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label={props["aria-label"] || "France flag"}
		>
			<g clipPath="url(#clip-fr)">
				{/* White background */}
				<rect width="24" height="24" fill="white" />
				{/* Red stripe */}
				<rect
					x="16.17"
					y="0.75"
					width="7.83"
					height="22.5"
					fill="#ED2939"
				/>
				{/* Blue stripe */}
				<rect
					x="0"
					y="0.75"
					width="7.83"
					height="22.5"
					fill="#002395"
				/>
			</g>
			<defs>
				<clipPath id="clip-fr">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

/**
 * Spain Flag (ES)
 */
export function FlagES({ className = "", size = 24, ...props }: FlagProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label={props["aria-label"] || "Spain flag"}
		>
			<g clipPath="url(#clip-es)">
				{/* Yellow middle stripe */}
				<rect
					x="0"
					y="6.78"
					width="24"
					height="10.43"
					fill="#FFDA44"
				/>
				{/* Red stripes (top and bottom) with coat of arms */}
				<g>
					<rect
						x="0.75"
						y="0"
						width="22.5"
						height="24"
						fill="#D80027"
					/>
					<rect
						x="0.75"
						y="0"
						width="22.5"
						height="24"
						fill="url(#pattern-es)"
					/>
				</g>
			</g>
			<defs>
				<pattern id="pattern-es" patternContentUnits="objectBoundingBox" width="1" height="1">
					<rect width="1" height="0.28" fill="#D80027" />
					<rect y="0.72" width="1" height="0.28" fill="#D80027" />
					<rect y="0.28" width="1" height="0.44" fill="#FFDA44" />
				</pattern>
				<clipPath id="clip-es">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

/**
 * Italy Flag (IT)
 */
export function FlagIT({ className = "", size = 24, ...props }: FlagProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label={props["aria-label"] || "Italy flag"}
		>
			<g clipPath="url(#clip-it)">
				{/* White background */}
				<rect width="24" height="24" fill="white" />
				{/* Red stripe */}
				<rect
					x="16.17"
					y="0.75"
					width="7.83"
					height="22.5"
					fill="#CE2B37"
				/>
				{/* Green stripe */}
				<rect
					x="0"
					y="0.75"
					width="7.83"
					height="22.5"
					fill="#009246"
				/>
			</g>
			<defs>
				<clipPath id="clip-it">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

/**
 * Netherlands Flag (NL)
 */
export function FlagNL({ className = "", size = 24, ...props }: FlagProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label={props["aria-label"] || "Netherlands flag"}
		>
			<g clipPath="url(#clip-nl)">
				{/* White background */}
				<rect width="24" height="24" fill="white" />
				{/* Red stripe (top) */}
				<rect
					x="0.75"
					y="0"
					width="22.5"
					height="7.83"
					fill="#AE1C28"
				/>
				{/* Blue stripe (bottom) */}
				<rect
					x="0.75"
					y="16.17"
					width="22.5"
					height="7.83"
					fill="#21468B"
				/>
			</g>
			<defs>
				<clipPath id="clip-nl">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}

/**
 * United Kingdom Flag (GB)
 */
export function FlagGB({ className = "", size = 24, ...props }: FlagProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			role="img"
			aria-label={props["aria-label"] || "United Kingdom flag"}
		>
			<rect width="24" height="24" fill="#012169" />
			<path d="M0 0L24 24M24 0L0 24" stroke="white" strokeWidth="3" />
			<path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="2" />
			<path d="M12 0V24M0 12H24" stroke="white" strokeWidth="5" />
			<path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="3" />
		</svg>
	);
}

/**
 * Generic flag component that renders the appropriate flag based on country code
 */
interface CountryFlagProps extends FlagProps {
	countryCode: string;
}

export function CountryFlag({ countryCode, ...props }: CountryFlagProps) {
	switch (countryCode.toUpperCase()) {
		case "DE":
			return <FlagDE {...props} />;
		case "FR":
			return <FlagFR {...props} />;
		case "ES":
			return <FlagES {...props} />;
		case "IT":
			return <FlagIT {...props} />;
		case "NL":
			return <FlagNL {...props} />;
		case "GB":
		case "UK":
			return <FlagGB {...props} />;
		default:
			// Fallback: show a placeholder
			return (
				<div
					className="flex items-center justify-center rounded bg-bg-tertiary text-text-quaternary"
					style={{ width: props.size || 24, height: props.size || 24 }}
					role="img"
					aria-label={`${countryCode} flag`}
				>
					<span className="text-xs">🏳️</span>
				</div>
			);
	}
}

