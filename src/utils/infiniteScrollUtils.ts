/**
 * UNUSED FILE - UTILITY FUNCTIONS
 * 
 * This file contains utility functions for infinite scroll table functionality
 * that were created to support the infinite scroll table system. However, these
 * utilities are not currently used in the main application.
 * 
 * Utilities included:
 * - createMockDataGenerator: Mock data generation for testing
 * - createApiDataFetcher: Generic API data fetching
 * - createPrismaDataFetcher: Prisma-based data fetching
 * - shouldFetchMore: Scroll position checking
 * - createScrollHandler: Scroll event handler creation
 * 
 * Features:
 * - Mock data generation with realistic delays
 * - Generic API data fetching with pagination
 * - Prisma integration for server-side pagination
 * - Scroll position utilities
 * - Event handler creation
 * 
 * These utilities are designed to work with the InfiniteScrollTable component
 * and provide data fetching and scroll handling capabilities.
 * 
 * To use these utilities:
 * 1. Import the specific function you need
 * 2. Configure it with your data source
 * 3. Use it in your component or hook
 * 
 * Created: [Date when this was added]
 * Status: Unused - not integrated into main app
 */

import { InfiniteScrollData } from '@/types/infiniteTable';

/**
 * Creates a mock data generator for testing infinite scroll functionality
 */
export function createMockDataGenerator<TData>(
  dataGenerator: (index: number) => TData,
  totalCount: number = 10000,
  pageSize: number = 50
) {
  return async (pageParam: number): Promise<InfiniteScrollData<TData>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    
    const start = pageParam * pageSize;
    const end = Math.min(start + pageSize, totalCount);
    const data: TData[] = [];
    
    for (let i = start; i < end; i++) {
      data.push(dataGenerator(i));
    }
    
    return {
      data,
      meta: {
        totalRowCount: totalCount,
        hasNextPage: end < totalCount,
        currentPage: pageParam,
      },
    };
  };
}

/**
 * Creates a generic API data fetcher with pagination
 */
export function createApiDataFetcher<TData = any>(
  apiEndpoint: string,
  pageSize: number = 50,
  additionalParams: Record<string, any> = {}
) {
  return async (pageParam: number): Promise<InfiniteScrollData<TData>> => {
    const params = new URLSearchParams({
      page: pageParam.toString(),
      limit: pageSize.toString(),
      ...additionalParams,
    });
    
    const response = await fetch(`${apiEndpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      data: result.data || result.items || [],
      meta: {
        totalRowCount: result.total || result.totalCount || 0,
        hasNextPage: result.hasNextPage || (result.data?.length === pageSize),
        currentPage: pageParam,
      },
    };
  };
}

/**
 * Creates a Prisma-based data fetcher for server-side pagination
 */
export function createPrismaDataFetcher<TData>(
  prismaQuery: (args: { skip: number; take: number }) => Promise<{ data: TData[]; total: number }>,
  pageSize: number = 50
) {
  return async (pageParam: number): Promise<InfiniteScrollData<TData>> => {
    const skip = pageParam * pageSize;
    const take = pageSize;
    
    const { data, total } = await prismaQuery({ skip, take });
    
    return {
      data,
      meta: {
        totalRowCount: total,
        hasNextPage: skip + take < total,
        currentPage: pageParam,
      },
    };
  };
}

/**
 * Utility to check if we should fetch more data based on scroll position
 */
export function shouldFetchMore(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
  threshold: number = 500
): boolean {
  return scrollHeight - scrollTop - clientHeight < threshold;
}

/**
 * Utility to create a scroll handler for infinite loading
 */
export function createScrollHandler(
  containerRef: React.RefObject<HTMLElement>,
  fetchNextPage: () => void,
  isFetching: boolean,
  hasNextPage: boolean,
  threshold: number = 500
) {
  return (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const { scrollHeight, scrollTop, clientHeight } = element;
    
    if (
      shouldFetchMore(scrollHeight, scrollTop, clientHeight, threshold) &&
      !isFetching &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };
}
