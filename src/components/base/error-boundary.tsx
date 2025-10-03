"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.props.onError?.(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback || (
				<div className="flex items-center justify-center min-h-screen bg-gray-50">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
							<svg
								className="h-6 w-6 text-red-600"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
								/>
							</svg>
						</div>
						<h2 className="mt-2 text-lg font-semibold text-gray-900">
							Something went wrong
						</h2>
						<p className="mt-1 text-sm text-gray-500">
							We're sorry, but something unexpected happened. Please try refreshing the page.
						</p>
						<div className="mt-6">
							<button
								type="button"
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								onClick={() => window.location.reload()}
							>
								Refresh page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
