/**
 * UNUSED FILE - UTILITY FUNCTIONS
 *
 * This file contains advanced utility functions for big data table scenarios
 * that were created to support the big data table system. However, these
 * utilities are not currently used in the main application.
 *
 * Utilities included:
 * - createOptimizedDataFetcher: API data fetching with caching
 * - createOptimizedPrismaFetcher: Prisma-based data fetching
 * - createRealisticMockGenerator: Mock data generation for testing
 * - PerformanceMonitor: Performance tracking class
 * - getMemoryUsage: Memory usage monitoring
 *
 * Features:
 * - Advanced caching strategies
 * - Performance monitoring
 * - Memory optimization
 * - Server-side query optimization
 * - Mock data generation for testing
 * - Realistic network delay simulation
 *
 * These utilities are designed to work with the AdvancedVirtualTable component
 * and provide high-performance data fetching capabilities.
 *
 * To use these utilities:
 * 1. Import the specific function you need
 * 2. Configure it with your data source
 * 3. Use it in your data fetching logic
 *
 * Created: [Date when this was added]
 * Status: Unused - not integrated into main app
 */

import { InfiniteScrollData } from "@/types/infiniteTable";

/**
 * Advanced data fetching utilities for big data scenarios
 */

export interface BigDataConfig {
	pageSize: number;
	maxCacheSize: number;
	prefetchThreshold: number;
	staleTime: number;
	retryAttempts: number;
}

export interface ServerSideParams {
	page: number;
	pageSize: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	filters?: Record<string, any>;
	search?: string;
}

export interface BigDataResponse<T> {
	data: T[];
	meta: {
		totalRowCount: number;
		hasNextPage: boolean;
		currentPage: number;
		totalPages: number;
		processingTime: number;
		cached: boolean;
	};
}

/**
 * Creates an optimized API data fetcher with advanced caching and prefetching
 */
export function createOptimizedDataFetcher<TData = any>(
	apiEndpoint: string,
	config: Partial<BigDataConfig> = {}
): (params: ServerSideParams) => Promise<InfiniteScrollData<TData>> {
	const defaultConfig: BigDataConfig = {
		pageSize: 50,
		maxCacheSize: 1000,
		prefetchThreshold: 0.8,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retryAttempts: 3,
		...config,
	};

	// In-memory cache for frequently accessed data
	const cache = new Map<
		string,
		{ data: InfiniteScrollData<TData>; timestamp: number }
	>();

	return async (
		params: ServerSideParams
	): Promise<InfiniteScrollData<TData>> => {
		const cacheKey = JSON.stringify(params);
		const now = Date.now();

		// Check cache first
		const cached = cache.get(cacheKey);
		if (cached && now - cached.timestamp < defaultConfig.staleTime) {
			return { ...cached.data, meta: { ...cached.data.meta, cached: true } };
		}

		const startTime = performance.now();

		try {
			// Build query parameters with server-side operations
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.pageSize.toString(),
				...(params.sortBy && { sortBy: params.sortBy }),
				...(params.sortOrder && { sortOrder: params.sortOrder }),
				...(params.search && { search: params.search }),
				...(params.filters && { filters: JSON.stringify(params.filters) }),
			});

			const response = await fetch(`${apiEndpoint}?${queryParams}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "max-age=300", // 5 minutes cache
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: BigDataResponse<TData> = await response.json();
			const processingTime = performance.now() - startTime;

			const responseData: InfiniteScrollData<TData> = {
				data: result.data,
				meta: {
					totalRowCount: result.meta.totalRowCount,
					hasNextPage: result.meta.hasNextPage,
					currentPage: result.meta.currentPage,
					processingTime,
					cached: false,
				},
			};

			// Cache the result
			if (cache.size >= defaultConfig.maxCacheSize) {
				// Remove oldest entries
				const oldestKey = cache.keys().next().value;
				cache.delete(oldestKey);
			}
			cache.set(cacheKey, { data: responseData, timestamp: now });

			return responseData;
		} catch (error) {
			console.error("Data fetching error:", error);
			throw error;
		}
	};
}

/**
 * Creates a Prisma-based data fetcher with advanced query optimization
 */
export function createOptimizedPrismaFetcher<TData>(
	prismaQuery: (args: {
		skip: number;
		take: number;
		orderBy?: any;
		where?: any;
		select?: any;
	}) => Promise<{ data: TData[]; total: number }>,
	config: Partial<BigDataConfig> = {}
) {
	const _defaultConfig: BigDataConfig = {
		pageSize: 50,
		maxCacheSize: 1000,
		prefetchThreshold: 0.8,
		staleTime: 5 * 60 * 1000,
		retryAttempts: 3,
		...config,
	};

	return async (
		params: ServerSideParams
	): Promise<InfiniteScrollData<TData>> => {
		const startTime = performance.now();

		try {
			const skip = params.page * params.pageSize;
			const take = params.pageSize;

			// Build orderBy clause
			const orderBy = params.sortBy
				? {
						[params.sortBy]: params.sortOrder || "asc",
					}
				: undefined;

			// Build where clause for filters
			const where = params.filters
				? buildWhereClause(params.filters)
				: undefined;

			const { data, total } = await prismaQuery({
				skip,
				take,
				orderBy,
				where,
			});

			const processingTime = performance.now() - startTime;

			return {
				data,
				meta: {
					totalRowCount: total,
					hasNextPage: skip + take < total,
					currentPage: params.page,
					processingTime,
					cached: false,
				},
			};
		} catch (error) {
			console.error("Prisma query error:", error);
			throw error;
		}
	};
}

/**
 * Builds Prisma where clause from filters
 */
function buildWhereClause(filters: Record<string, any>): any {
	const where: any = {};

	Object.entries(filters).forEach(([key, value]) => {
		if (value === null || value === undefined) return;

		if (typeof value === "string") {
			where[key] = {
				contains: value,
				mode: "insensitive",
			};
		} else if (typeof value === "number") {
			where[key] = value;
		} else if (Array.isArray(value)) {
			where[key] = {
				in: value,
			};
		} else if (
			typeof value === "object" &&
			value.min !== undefined &&
			value.max !== undefined
		) {
			where[key] = {
				gte: value.min,
				lte: value.max,
			};
		}
	});

	return where;
}

/**
 * Creates a mock data generator for testing with realistic data patterns
 */
export function createRealisticMockGenerator<TData>(
	dataGenerator: (index: number, seed?: number) => TData,
	totalCount: number = 100000,
	pageSize: number = 50,
	config: Partial<BigDataConfig> = {}
) {
	const _defaultConfig: BigDataConfig = {
		pageSize,
		maxCacheSize: 1000,
		prefetchThreshold: 0.8,
		staleTime: 5 * 60 * 1000,
		retryAttempts: 3,
		...config,
	};

	return async (
		params: ServerSideParams
	): Promise<InfiniteScrollData<TData>> => {
		// Simulate realistic network delay based on data size
		const baseDelay = 100;
		const sizeDelay = (params.pageSize / 50) * 50;
		const randomDelay = Math.random() * 100;
		const totalDelay = baseDelay + sizeDelay + randomDelay;

		await new Promise((resolve) => setTimeout(resolve, totalDelay));

		const start = params.page * params.pageSize;
		const end = Math.min(start + params.pageSize, totalCount);
		const data: TData[] = [];

		// Generate data with consistent seed for sorting
		for (let i = start; i < end; i++) {
			const seed = params.sortBy ? i : Math.floor(i / 1000); // Group similar data
			data.push(dataGenerator(i, seed));
		}

		// Apply client-side sorting if needed (for demo purposes)
		if (params.sortBy && data.length > 0) {
			data.sort((a, b) => {
				const aVal = (a as any)[params.sortBy!];
				const bVal = (b as any)[params.sortBy!];

				if (aVal < bVal) return params.sortOrder === "desc" ? 1 : -1;
				if (aVal > bVal) return params.sortOrder === "desc" ? -1 : 1;
				return 0;
			});
		}

		return {
			data,
			meta: {
				totalRowCount: totalCount,
				hasNextPage: end < totalCount,
				currentPage: params.page,
				processingTime: totalDelay,
				cached: false,
			},
		};
	};
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
	private static measurements: Map<string, number[]> = new Map();

	static startTiming(key: string): () => void {
		const start = performance.now();
		return () => {
			const duration = performance.now() - start;
			const existing = this.measurements.get(key) || [];
			existing.push(duration);
			this.measurements.set(key, existing);
		};
	}

	static getAverageTime(key: string): number {
		const measurements = this.measurements.get(key) || [];
		return measurements.reduce((a, b) => a + b, 0) / measurements.length;
	}

	static getStats(): Record<
		string,
		{ average: number; count: number; min: number; max: number }
	> {
		const stats: Record<string, any> = {};

		this.measurements.forEach((measurements, key) => {
			const sorted = measurements.sort((a, b) => a - b);
			stats[key] = {
				average: this.getAverageTime(key),
				count: measurements.length,
				min: sorted[0],
				max: sorted[sorted.length - 1],
			};
		});

		return stats;
	}

	static clear(): void {
		this.measurements.clear();
	}
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
	used: number;
	total: number;
	percentage: number;
} {
	if (typeof window !== "undefined" && "memory" in performance) {
		const memory = (performance as any).memory;
		return {
			used: memory.usedJSHeapSize,
			total: memory.totalJSHeapSize,
			percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
		};
	}
	return { used: 0, total: 0, percentage: 0 };
}
