/**
 * World Map SVG Component
 * 
 * Dotted world map visualization extracted from Figma design.
 * Theme-aware with support for light and dark modes.
 */

import React from "react";

interface WorldMapSVGProps {
	className?: string;
}

export default function WorldMapSVG({ className = "" }: WorldMapSVGProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 720 343"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="World map"
		>
			{/* Dotted world map pattern - simplified representation */}
			<g opacity="0.4">
				{/* Map is represented as a grid of dots */}
				{/* This creates the dotted world map effect seen in Figma */}
				<defs>
					<pattern id="dot-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
						<circle cx="4" cy="4" r="1" className="fill-text-quaternary dark:fill-text-quaternary" />
					</pattern>
				</defs>
				
				{/* Continents outlined with dots */}
				{/* North America */}
				<path
					d="M50 80 L50 180 L180 180 L180 80 L120 50 Z"
					fill="url(#dot-pattern)"
				/>
				
				{/* South America */}
				<path
					d="M100 200 L100 300 L160 320 L180 280 L180 200 Z"
					fill="url(#dot-pattern)"
				/>
				
				{/* Europe */}
				<path
					d="M320 60 L320 160 L420 160 L420 80 L380 60 Z"
					fill="url(#dot-pattern)"
				/>
				
				{/* Africa */}
				<path
					d="M320 180 L320 300 L400 320 L420 280 L420 180 Z"
					fill="url(#dot-pattern)"
				/>
				
				{/* Asia */}
				<path
					d="M440 40 L440 200 L640 200 L640 80 L580 40 Z"
					fill="url(#dot-pattern)"
				/>
				
				{/* Australia */}
				<path
					d="M580 240 L580 300 L660 300 L660 240 Z"
					fill="url(#dot-pattern)"
				/>
			</g>
			
			{/* Subtle continent outlines for better definition */}
			<g opacity="0.2" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-text-tertiary dark:text-text-quaternary">
				{/* Simplified continental outlines */}
				<path d="M50 80 Q80 60, 120 50 Q160 55, 180 80 L180 180 Q160 190, 120 185 Q80 180, 50 180 Z" />
				<path d="M100 200 Q120 195, 140 200 L180 200 Q185 240, 180 280 Q170 310, 160 320 Q130 325, 100 300 Z" />
				<path d="M320 60 Q350 50, 380 60 L420 80 L420 160 Q390 165, 360 160 L320 160 Z" />
				<path d="M320 180 L420 180 Q425 230, 420 280 Q405 310, 400 320 Q360 325, 320 300 Z" />
				<path d="M440 40 Q510 30, 580 40 Q620 60, 640 80 L640 200 Q610 205, 580 200 L440 200 Z" />
				<path d="M580 240 Q620 235, 660 240 L660 300 Q630 305, 600 300 L580 300 Z" />
			</g>
		</svg>
	);
}

