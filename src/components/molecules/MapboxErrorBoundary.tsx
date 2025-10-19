"use client";

import React, { Component, ReactNode } from "react";
import WorldMapSVG from "./WorldMapSVG";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

/**
 * Error Boundary for Mapbox component
 * Catches errors during map initialization and provides fallback
 */
class MapboxErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error details for monitoring
		console.error("[MapboxErrorBoundary] Caught error:", error);
		console.error("[MapboxErrorBoundary] Error info:", errorInfo);

		// Track error in analytics if available
		if (typeof window !== "undefined" && (window as any).analytics?.track) {
			(window as any).analytics.track("mapbox_error_boundary", {
				error: error.message,
				stack: error.stack,
				componentStack: errorInfo.componentStack,
			});
		}
	}

	render() {
		if (this.state.hasError) {
			// Render fallback UI
			return (
				this.props.fallback || (
					<div className="relative h-[344px] w-full overflow-hidden rounded-lg bg-bg-secondary">
						<div className="absolute inset-0">
							<WorldMapSVG className="h-full w-full" />
						</div>
						{/* Optional error message */}
						<div className="absolute bottom-4 left-4 rounded-md bg-bg-primary px-3 py-2 shadow-sm">
							<p className="text-xs text-text-tertiary">
								Map temporarily unavailable. Showing static view.
							</p>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

export default MapboxErrorBoundary;

