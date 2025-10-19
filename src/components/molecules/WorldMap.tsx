"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import WorldMapSVG from "./WorldMapSVG";
import MapboxErrorBoundary from "./MapboxErrorBoundary";
import { CountryFlag } from "@/components/atoms/CountryFlags";
import type { WinningProductLocation, CountryBreakdown } from "@/data/winningProducts";

// Lazy load Mapbox to reduce initial bundle size and avoid SSR issues
const MapboxWorldMap = dynamic(() => import("./MapboxWorldMap"), {
	ssr: false,
	loading: () => (
		<div className="flex h-[344px] w-full items-center justify-center rounded-lg bg-bg-secondary">
			<div className="text-center">
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-bg-brand-solid border-t-transparent"></div>
				<p className="mt-2 text-sm text-text-tertiary">Loading map...</p>
			</div>
		</div>
	),
});

interface WorldMapProps {
	totalCount: string;
	countryData: CountryBreakdown[];
	locations: WinningProductLocation[];
}

export default function WorldMap({ totalCount, countryData, locations }: WorldMapProps) {
	const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
	const [useMapbox, setUseMapbox] = useState(true); // Toggle for fallback
	const [mapLoadError, setMapLoadError] = useState(false);

	return (
		<div 
			className="w-full rounded-xl border border-border-primary bg-bg-primary shadow-sm"
			role="region"
			aria-label="Winning products geographic distribution"
		>
			<div className="flex flex-col gap-5 p-6">
				{/* Section Header */}
				<div className="flex flex-col gap-5">
					<div className="flex flex-col items-start justify-between gap-4 md:flex-row">
						<div className="flex flex-1 flex-col justify-center gap-0.5">
							<h2 className="text-lg font-semibold leading-7 text-text-primary">
								Winning products right now
							</h2>
						</div>
						<button 
							className="flex items-center justify-center gap-1 rounded-lg border border-border-primary bg-bg-primary px-3.5 py-2.5 shadow-sm transition-colors hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-border-brand focus:ring-offset-2"
							aria-label="View up-to-the-minute data"
						>
							<span className="px-0.5 text-sm font-semibold leading-5 text-text-secondary">
								Up-to-the-minute data
							</span>
						</button>
					</div>
					<div className="h-px w-full bg-border-primary" aria-hidden="true" />
				</div>

				{/* Map and Data */}
				<div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
					{/* Interactive Map */}
					<div 
						className="relative h-[344px] flex-1 overflow-hidden rounded-lg bg-bg-secondary"
						role="img"
						aria-label="World map showing product locations"
					>
						{/* Render Mapbox if available and no errors, otherwise fallback to SVG */}
						{useMapbox && !mapLoadError && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? (
							<MapboxErrorBoundary>
								<MapboxWorldMap
									locations={locations}
									onMarkerHover={setHoveredMarkerId}
									hoveredMarkerId={hoveredMarkerId}
								/>
							</MapboxErrorBoundary>
						) : (
							<>
								{/* Fallback SVG Map */}
								<div className="absolute inset-0">
									<WorldMapSVG className="h-full w-full" />
								</div>

							{/* SVG Map Markers (fallback) */}
							{locations.slice(0, 5).map((location) => {
								// Convert lng/lat to percentage for SVG fallback
								// Rough approximation for European region
								const x = ((location.coordinates.lng + 10) / 30) * 100; // -10 to 20 lng
								const y = ((60 - location.coordinates.lat) / 20) * 100; // 40 to 60 lat
								return (
									<button
										key={location.id}
										className="absolute flex items-center justify-center transition-transform duration-300"
										style={{
											left: `${x}%`,
											top: `${y}%`,
											transform: "translate(-50%, -50%)",
											width: "48px",
											height: "48px",
										}}
										onMouseEnter={() => setHoveredMarkerId(location.id)}
										onMouseLeave={() => setHoveredMarkerId(null)}
										aria-label={`Product location in ${location.city}, ${location.country}`}
									>
										<div className="absolute h-10 w-10 rounded-full bg-[#9E77ED] opacity-10" />
										<div className="absolute h-6 w-6 rounded-full bg-[#9E77ED] opacity-20" />
										<div className="absolute h-2 w-2 rounded-full bg-[#9E77ED]" />
									</button>
								);
							})}
							</>
						)}
					</div>

					{/* Sidebar with Stats */}
					<div className="flex flex-col gap-5 lg:w-[280px]">
						{/* Total Count */}
						<div 
							className="text-4xl font-semibold leading-[44px] tracking-[-0.02em] text-text-primary"
							aria-label={`Total products: ${totalCount}`}
						>
							{totalCount}
						</div>

						{/* Countries List */}
						<div 
							className="flex flex-col gap-3"
							role="list"
							aria-label="Product distribution by country"
						>
							{countryData.map((country, index) => (
								<div 
									key={`${country.code}-${index}`} 
									className="flex items-start gap-4"
									role="listitem"
								>
									{/* Country Flag */}
									<div className="flex h-6 w-6 items-center justify-center">
										<CountryFlag 
											countryCode={country.code} 
											size={24}
											aria-label={`${country.country} flag`}
										/>
									</div>

									{/* Country Info */}
									<div className="flex flex-1 flex-col gap-0.5">
										<div className="text-sm font-medium leading-5 text-text-secondary">
											{country.country}
										</div>
										
										{/* Progress Bar */}
										<div className="flex items-center gap-3">
											<div 
												className="relative h-2 flex-1 overflow-hidden rounded"
												role="progressbar"
												aria-valuenow={country.percentage}
												aria-valuemin={0}
												aria-valuemax={100}
												aria-label={`${country.country} market share`}
											>
												{/* Background */}
												<div 
													className="h-full w-full rounded"
													style={{ backgroundColor: "#E9EAEB" }}
												/>
												{/* Progress */}
												<div
													className="absolute left-0 top-0 h-full rounded transition-all duration-300"
													style={{ 
														width: `${country.percentage}%`,
														backgroundColor: "#7F56D9"
													}}
												/>
											</div>
											
											{/* Percentage Text */}
											<div className="text-sm font-medium leading-5 text-text-secondary">
												{country.percentage}%
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
