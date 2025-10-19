"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import { getMapStyle } from "@/styles/mapbox-theme";
import type { WinningProductLocation } from "@/data/winningProducts";
import { renderToStaticMarkup } from "react-dom/server";
import { CountryFlag } from "@/components/atoms/CountryFlags";

// Set Mapbox access token
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
	mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
}

// Utility: Announce to screen readers
const announceToScreenReader = (message: string) => {
	if (typeof window === "undefined") return;
	
	const announcement = document.createElement("div");
	announcement.setAttribute("role", "status");
	announcement.setAttribute("aria-live", "polite");
	announcement.setAttribute("aria-atomic", "true");
	announcement.className = "sr-only";
	announcement.style.cssText = "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
	announcement.textContent = message;
	document.body.appendChild(announcement);
	setTimeout(() => announcement.remove(), 1000);
};

// Utility: Debounce function
const debounce = <T extends (...args: any[]) => any>(
	func: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout | null = null;
	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

interface MapboxWorldMapProps {
	locations: WinningProductLocation[];
	onMarkerHover: (id: string | null) => void;
	hoveredMarkerId: string | null;
}

export default function MapboxWorldMap({
	locations,
	onMarkerHover,
	hoveredMarkerId,
}: MapboxWorldMapProps) {
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
	const popups = useRef<Map<string, mapboxgl.Popup>>(new Map());
	const hoverTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
	const { resolvedTheme } = useTheme();
	const [mapLoaded, setMapLoaded] = useState(false);

	// Initialize map
	useEffect(() => {
		if (!mapContainer.current || map.current) return;

		const mapInstance = new mapboxgl.Map({
			container: mapContainer.current,
			style: getMapStyle(resolvedTheme === "dark" ? "dark" : "light"),
			center: [9.9937, 53.5511], // Hamburg, Germany - perfect view of all European markers
			zoom: 4.5,
			minZoom: 2,
			maxZoom: 10,
			maxBounds: [[-180, -85], [180, 85]], // Constrain to world bounds
			dragRotate: false, // Disable rotation
			touchPitch: false, // Disable tilt on mobile
			pitchWithRotate: false,
		});

		// Add zoom and navigation controls
		mapInstance.addControl(
			new mapboxgl.NavigationControl({
				showCompass: false, // Hide compass since rotation is disabled
			}),
			"top-right"
		);

		mapInstance.on("load", () => {
			setMapLoaded(true);
		});

		map.current = mapInstance;

		return () => {
			// Clear all hover timeouts
			hoverTimeouts.current.forEach((timeout) => clearTimeout(timeout));
			hoverTimeouts.current.clear();
			
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, []); // Only initialize once, never recreate the map

	// Update map style when theme changes
	useEffect(() => {
		if (!map.current || !mapLoaded) return;

		setMapLoaded(false); // Temporarily set to false while style loads
		const newStyle = getMapStyle(resolvedTheme === "dark" ? "dark" : "light");
		map.current.setStyle(newStyle);
		
		// Re-add markers after style loads
		map.current.once('style.load', () => {
			setMapLoaded(true); // Trigger marker re-addition
		});
	}, [resolvedTheme]);

	// Create custom marker element
	const createMarkerElement = useCallback((locationId: string, isHovered: boolean) => {
		const el = document.createElement("div");
		el.className = "custom-marker";
		el.style.width = "48px";
		el.style.height = "48px";
		el.style.cursor = "pointer";
		el.style.transition = "transform 0.3s ease";
		
		if (isHovered) {
			el.style.transform = "scale(1.1)";
		}

		// Create ripple circles
		el.innerHTML = `
			<div style="position: relative; width: 100%; height: 100%;">
				<!-- Outer circle -->
				<div style="
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 40px;
					height: 40px;
					border-radius: 50%;
					background-color: #9E77ED;
					opacity: ${isHovered ? 0.15 : 0.1};
					transition: opacity 0.3s ease;
				"></div>
				
				<!-- Middle circle -->
				<div style="
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 24px;
					height: 24px;
					border-radius: 50%;
					background-color: #9E77ED;
					opacity: ${isHovered ? 0.3 : 0.2};
					transition: opacity 0.3s ease;
				"></div>
				
				<!-- Inner circle -->
				<div style="
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%) ${isHovered ? 'scale(1.25)' : 'scale(1)'};
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background-color: #9E77ED;
					transition: transform 0.3s ease;
				"></div>
				
				${isHovered ? `
				<!-- Pulse animation -->
				<div style="
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 40px;
					height: 40px;
					border-radius: 50%;
					background-color: #9E77ED;
					opacity: 0.2;
					animation: pulse 1s ease-out infinite;
				"></div>
				` : ''}
			</div>
		`;

		return el;
	}, []);

	// Add/update markers
	useEffect(() => {
		if (!map.current || !mapLoaded) return;

		// Clear existing markers
		markers.current.forEach((marker) => marker.remove());
		markers.current.clear();
		popups.current.forEach((popup) => popup.remove());
		popups.current.clear();

		// Add new markers
		locations.forEach((location) => {
			const { lng, lat } = location.coordinates;
			const isHovered = hoveredMarkerId === location.id;

			// Create custom marker element
			const el = createMarkerElement(location.id, isHovered);
			
			const marker = new mapboxgl.Marker({
				element: el,
				anchor: "center",
			})
				.setLngLat([lng, lat])
				.addTo(map.current!);
			
			// Add hover events with delay
			el.addEventListener("mouseenter", () => {
				const timeout = setTimeout(() => {
					onMarkerHover(location.id);
				}, 200); // 200ms delay for better UX
				hoverTimeouts.current.set(location.id, timeout);
			});

			el.addEventListener("mouseleave", () => {
				const timeout = hoverTimeouts.current.get(location.id);
				if (timeout) {
					clearTimeout(timeout);
					hoverTimeouts.current.delete(location.id);
				}
				onMarkerHover(null);
			});

			// Create Figma-styled popup with country flag
			const popupContent = document.createElement("div");
			popupContent.className = "figma-tooltip-content";
			
			// Render flag as HTML string
			const flagHTML = renderToStaticMarkup(
				<CountryFlag countryCode={location.countryCode} size={20} />
			);
			
			popupContent.innerHTML = `
				<div style="
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 8px;
					padding: 0;
				">
					<!-- Country Flag 20x20 -->
					<div style="width: 20px; height: 20px; flex-shrink: 0;">
						${flagHTML}
					</div>
					
					<!-- Location Info -->
					<div style="
						display: flex;
						flex-direction: column;
						gap: 4px;
						align-items: center;
						text-align: center;
					">
						<!-- City + Country -->
						<div style="
							font-family: 'Inter', -apple-system, Roboto, sans-serif;
							font-size: 12px;
							font-weight: 600;
							line-height: 18px;
							color: var(--color-text-primary);
							white-space: nowrap;
						">
							${location.city}, ${location.country}
						</div>
						
						<!-- Website -->
						<div style="
							font-family: 'Inter', -apple-system, Roboto, sans-serif;
							font-size: 12px;
							font-weight: 400;
							line-height: 18px;
							color: var(--color-text-tertiary);
							white-space: nowrap;
						">
							${location.website}
						</div>
					</div>
				</div>
			`;

			const popup = new mapboxgl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset: 52, // Match Figma spacing (52px above marker)
				className: "figma-tooltip",
				anchor: 'bottom', // Always position above marker
			}).setDOMContent(popupContent);

			markers.current.set(location.id, marker);
			popups.current.set(location.id, popup);
		});
	}, [locations, mapLoaded, hoveredMarkerId, onMarkerHover, createMarkerElement]);

	// Show/hide popup based on hover
	useEffect(() => {
		if (!map.current || !mapLoaded) return;

		popups.current.forEach((popup, locationId) => {
			if (locationId === hoveredMarkerId) {
				const marker = markers.current.get(locationId);
				if (marker) {
					popup.setLngLat(marker.getLngLat()).addTo(map.current!);
				}
			} else {
				popup.remove();
			}
		});
	}, [hoveredMarkerId, mapLoaded]);

	return (
		<>
			<div
				ref={mapContainer}
				className="h-full w-full rounded-lg"
				style={{ minHeight: "344px" }}
			/>
			{/* Add pulse animation keyframes */}
			<style jsx global>{`
				@keyframes pulse {
					0% {
						transform: translate(-50%, -50%) scale(1);
						opacity: 0.2;
					}
					100% {
						transform: translate(-50%, -50%) scale(1.5);
						opacity: 0;
					}
				}
			`}</style>
		</>
	);
}

