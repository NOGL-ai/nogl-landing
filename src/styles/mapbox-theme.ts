/**
 * Mapbox Custom Theme Styles
 * 
 * Official Mapbox style URLs for light and dark themes.
 * These provide optimal performance and visibility for SaaS dashboards.
 */

export interface MapboxStyle {
	version: number;
	name: string;
	sources: Record<string, any>;
	layers: any[];
	glyphs?: string;
	sprite?: string;
}

/**
 * Light Theme Map Style
 * Uses Mapbox official light-v11 style for optimal visibility and performance
 */
export const lightMapStyle = "mapbox://styles/mapbox/light-v11";

/**
 * Dark Theme Map Style
 * Uses Mapbox official dark-v11 style - industry standard with perfect visibility
 * This style is specifically designed for dark mode dashboards and data visualization
 */
export const darkMapStyle = "mapbox://styles/mapbox/dark-v11";

/**
 * Get appropriate map style based on theme
 * Returns official Mapbox style URLs for optimal performance and visibility
 */
export function getMapStyle(theme: "light" | "dark" = "light"): string {
	return theme === "dark" ? darkMapStyle : lightMapStyle;
}

