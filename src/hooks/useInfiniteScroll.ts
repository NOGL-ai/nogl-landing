/**
 * UNUSED FILE - CUSTOM HOOK
 *
 * This is a custom React hook for infinite scroll functionality that was created
 * to support the infinite scroll table components. However, it's not currently
 * used in the main application.
 *
 * Features:
 * - Infinite data fetching with React Query
 * - Automatic pagination handling
 * - Loading and error states
 * - Data flattening for table consumption
 * - Performance optimizations
 *
 * This hook is designed to work with the InfiniteScrollTable component
 * and requires @tanstack/react-query dependency (already installed).
 *
 * To use this hook:
 * 1. Import it in your component
 * 2. Provide queryKey and queryFn
 * 3. Use the returned data and functions
 *
 * Created: [Date when this was added]
 * Status: Unused - not integrated into main app
 */

import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
	InfiniteScrollData,
	UseInfiniteScrollOptions,
	InfiniteScrollState,
} from "@/types/infiniteTable";

export function useInfiniteScroll<TData>({
	queryKey,
	queryFn,
	fetchSize: _fetchSize = 50,
	enabled = true,
	staleTime = 5 * 60 * 1000, // 5 minutes
	refetchOnWindowFocus = false,
}: UseInfiniteScrollOptions<TData>): InfiniteScrollState<TData> {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		isLoading,
		error,
		refetch,
	} = useInfiniteQuery<InfiniteScrollData<TData>>({
		queryKey,
		queryFn: async ({ pageParam = 0 }) => {
			const result = await queryFn(pageParam as number);
			return result;
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.meta.hasNextPage) {
				return undefined;
			}
			return allPages.length;
		},
		enabled,
		staleTime,
		refetchOnWindowFocus,
		placeholderData: keepPreviousData,
	});

	// Flatten the array of arrays from the useInfiniteQuery hook
	const flatData = useMemo(
		() => data?.pages?.flatMap((page) => page.data) ?? [],
		[data]
	);

	const totalRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
	const totalFetched = flatData.length;

	const fetchNextPageCallback = useCallback(() => {
		if (hasNextPage && !isFetching) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetching, fetchNextPage]);

	const refetchCallback = useCallback(() => {
		refetch();
	}, [refetch]);

	return {
		data: flatData,
		totalRowCount,
		totalFetched,
		hasNextPage: hasNextPage ?? false,
		isLoading,
		isFetching,
		isFetchingNextPage,
		error: error as Error | null,
		fetchNextPage: fetchNextPageCallback,
		refetch: refetchCallback,
	};
}
