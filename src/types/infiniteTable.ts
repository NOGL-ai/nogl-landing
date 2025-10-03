/**
 * UNUSED FILE - TYPE DEFINITIONS
 *
 * This file contains TypeScript type definitions for the infinite scroll table
 * system that was created but never integrated into the main application.
 *
 * Types included:
 * - InfiniteScrollData: Data structure for infinite scroll responses
 * - InfiniteScrollTableProps: Props for the InfiniteScrollTable component
 * - UseInfiniteScrollOptions: Options for the useInfiniteScroll hook
 * - InfiniteScrollState: State returned by the useInfiniteScroll hook
 *
 * These types provide full TypeScript support for the infinite scroll table
 * functionality and ensure type safety throughout the system.
 *
 * The types are designed to work with:
 * - @tanstack/react-table for table functionality
 * - @tanstack/react-query for data fetching
 * - @tanstack/react-virtual for virtualization
 *
 * Created: [Date when this was added]
 * Status: Unused - not integrated into main app
 */

export interface InfiniteScrollData<T> {
	data: T[];
	meta: {
		totalRowCount: number;
		hasNextPage: boolean;
		currentPage: number;
		processingTime?: number;
		cached?: boolean;
	};
}

export interface InfiniteScrollTableProps<TData> {
	// Data fetching
	queryKey: (string | number | boolean)[];
	queryFn: (pageParam: number) => Promise<InfiniteScrollData<TData>>;
	fetchSize?: number;

	// Table configuration
	columns: any[]; // ColumnDef<TData>[] from @tanstack/react-table
	height?: number;
	rowHeight?: number;
	className?: string;

	// Virtual scrolling
	enableVirtualization?: boolean;
	overscan?: number;
	threshold?: number;

	// Sorting
	enableSorting?: boolean;
	sorting?: any[]; // SortingState from @tanstack/react-table
	onSortingChange?: (updater: any) => void;

	// Loading states
	loading?: boolean;
	emptyState?: React.ReactNode;

	// Row interactions
	onRowClick?: (row: any) => void;
	onRowDoubleClick?: (row: any) => void;

	// Selection
	enableSelection?: boolean;
	selectedRows?: Set<string>;
	onRowSelect?: (rowId: string, selected: boolean) => void;

	// Performance
	enableMemoization?: boolean;
	rowKeyExtractor?: (row: TData, index: number) => string;
}

export interface UseInfiniteScrollOptions<TData> {
	queryKey: (string | number | boolean)[];
	queryFn: (pageParam: number) => Promise<InfiniteScrollData<TData>>;
	fetchSize?: number;
	enabled?: boolean;
	staleTime?: number;
	refetchOnWindowFocus?: boolean;
}

export interface InfiniteScrollState<TData> {
	data: TData[];
	totalRowCount: number;
	totalFetched: number;
	hasNextPage: boolean;
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	error: Error | null;
	fetchNextPage: () => void;
	refetch: () => void;
}
