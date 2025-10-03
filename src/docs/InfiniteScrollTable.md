<!--
UNUSED FILE - DOCUMENTATION

This is comprehensive documentation for the Infinite Scroll Table component that
was created but never integrated into the main application. It provides detailed
API reference and usage examples for the infinite scroll table functionality.

The documentation covers:
- Component features and capabilities
- API reference
- Usage examples
- Styling options
- Performance tips
- Troubleshooting

This documentation is for reference only and the component it describes is
not currently used in the main application.

Created: [Date when this was added]
Status: Documentation only - component not integrated into main app
-->

# Infinite Scroll Table Documentation

A high-performance, infinite scrolling table component built with TanStack Table, TanStack Virtual, and React Query for handling large datasets efficiently.

## 🚀 Features

- **Infinite Scrolling**: Automatically loads more data as user scrolls
- **Virtual Scrolling**: Renders only visible rows for optimal performance
- **Server-side Sorting**: Handles sorting with server-side data fetching
- **TypeScript Support**: Full type safety throughout
- **Dark Mode Support**: Built-in dark/light theme support
- **Responsive Design**: Works on all screen sizes
- **Error Handling**: Comprehensive error states and retry functionality
- **Loading States**: Visual feedback during data fetching
- **Row Interactions**: Click and double-click handlers
- **Customizable**: Highly configurable with sensible defaults

## 📦 Dependencies

```json
{
	"@tanstack/react-table": "^8.21.3",
	"@tanstack/react-virtual": "^3.13.12",
	"@tanstack/react-query": "^5.x.x"
}
```

## 🏗️ Architecture

### Core Components

1. **InfiniteScrollTable**: Main table component
2. **useInfiniteScroll**: Custom hook for data fetching
3. **infiniteScrollUtils**: Utility functions for data fetching
4. **QueryClientProvider**: React Query provider wrapper

### File Structure

```
src/
├── components/
│   ├── ui/
│   │   └── InfiniteScrollTable.tsx
│   ├── examples/
│   │   ├── InfiniteScrollTableExample.tsx
│   │   └── InfiniteScrollTablePage.tsx
│   └── providers/
│       └── QueryClientProvider.tsx
├── hooks/
│   └── useInfiniteScroll.ts
├── types/
│   └── infiniteTable.ts
├── utils/
│   └── infiniteScrollUtils.ts
└── docs/
    └── InfiniteScrollTable.md
```

## 🚀 Quick Start

### 1. Setup QueryClient Provider

Wrap your app with the QueryClientProvider:

```tsx
// app/layout.tsx or your root component
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";

export default function RootLayout({ children }) {
	return (
		<html>
			<body>
				<QueryClientProvider>{children}</QueryClientProvider>
			</body>
		</html>
	);
}
```

### 2. Basic Usage

```tsx
import { InfiniteScrollTable } from "@/components/ui/InfiniteScrollTable";
import { ColumnDef } from "@tanstack/react-table";

interface Person {
	id: number;
	name: string;
	email: string;
}

const columns: ColumnDef<Person>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
];

const fetchData = async (pageParam: number) => {
	const response = await fetch(`/api/people?page=${pageParam}&limit=50`);
	const data = await response.json();

	return {
		data: data.items,
		meta: {
			totalRowCount: data.total,
			hasNextPage: data.hasNextPage,
			currentPage: pageParam,
		},
	};
};

export default function MyTable() {
	return (
		<InfiniteScrollTable
			queryKey={["people"]}
			queryFn={fetchData}
			columns={columns}
			height={600}
		/>
	);
}
```

## 📚 API Reference

### InfiniteScrollTable Props

| Prop                   | Type                                                        | Default     | Description                                |
| ---------------------- | ----------------------------------------------------------- | ----------- | ------------------------------------------ |
| `queryKey`             | `(string \| number \| boolean)[]`                           | -           | React Query key for caching                |
| `queryFn`              | `(pageParam: number) => Promise<InfiniteScrollData<TData>>` | -           | Function to fetch data                     |
| `columns`              | `ColumnDef<TData>[]`                                        | -           | Table column definitions                   |
| `height`               | `number`                                                    | `600`       | Table container height in pixels           |
| `rowHeight`            | `number`                                                    | `50`        | Estimated row height for virtualization    |
| `className`            | `string`                                                    | -           | Additional CSS classes                     |
| `enableVirtualization` | `boolean`                                                   | `true`      | Enable virtual scrolling                   |
| `overscan`             | `number`                                                    | `5`         | Number of items to render outside viewport |
| `threshold`            | `number`                                                    | `500`       | Distance from bottom to trigger fetch      |
| `enableSorting`        | `boolean`                                                   | `true`      | Enable column sorting                      |
| `sorting`              | `SortingState`                                              | `[]`        | Current sorting state                      |
| `onSortingChange`      | `(updater) => void`                                         | -           | Sorting change handler                     |
| `onRowClick`           | `(row) => void`                                             | -           | Row click handler                          |
| `onRowDoubleClick`     | `(row) => void`                                             | -           | Row double-click handler                   |
| `enableSelection`      | `boolean`                                                   | `false`     | Enable row selection                       |
| `selectedRows`         | `Set<string>`                                               | `new Set()` | Currently selected rows                    |
| `onRowSelect`          | `(rowId, selected) => void`                                 | -           | Row selection handler                      |
| `loading`              | `boolean`                                                   | `false`     | External loading state                     |
| `emptyState`           | `React.ReactNode`                                           | -           | Custom empty state component               |

### useInfiniteScroll Hook

```tsx
const {
	data, // Flattened array of all loaded data
	totalRowCount, // Total number of rows in database
	totalFetched, // Number of rows currently loaded
	hasNextPage, // Whether more data is available
	isLoading, // Initial loading state
	isFetching, // Any fetching state
	isFetchingNextPage, // Next page fetching state
	error, // Error object if any
	fetchNextPage, // Function to fetch next page
	refetch, // Function to refetch all data
} = useInfiniteScroll({
	queryKey: ["people"],
	queryFn: fetchData,
	fetchSize: 50,
});
```

## 🛠️ Utility Functions

### createMockDataGenerator

Creates a mock data generator for testing:

```tsx
import { createMockDataGenerator } from "@/utils/infiniteScrollUtils";

const fetchData = createMockDataGenerator(
	(index) => ({ id: index, name: `Item ${index}` }),
	10000, // total count
	50 // page size
);
```

### createApiDataFetcher

Creates an API data fetcher with pagination:

```tsx
import { createApiDataFetcher } from "@/utils/infiniteScrollUtils";

const fetchData = createApiDataFetcher(
	"/api/people",
	50, // page size
	{ status: "active" } // additional params
);
```

### createPrismaDataFetcher

Creates a Prisma-based data fetcher:

```tsx
import { createPrismaDataFetcher } from "@/utils/infiniteScrollUtils";
import { prisma } from "@/libs/prismaDb";

const fetchData = createPrismaDataFetcher(
	async ({ skip, take }) => {
		const [data, total] = await Promise.all([
			prisma.user.findMany({ skip, take }),
			prisma.user.count(),
		]);
		return { data, total };
	},
	50 // page size
);
```

## 🎨 Styling

The component uses Tailwind CSS classes and supports dark mode:

```tsx
<InfiniteScrollTable
	className='rounded-lg border-2 border-blue-200'
	// ... other props
/>
```

### Custom Styling

You can customize the appearance by:

1. **CSS Classes**: Use the `className` prop
2. **Tailwind Overrides**: Override default classes
3. **Custom Components**: Replace default empty state, loading states

## 🔧 Advanced Usage

### Custom Row Renderer

```tsx
const columns: ColumnDef<Person>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<div className='flex items-center space-x-2'>
				<Avatar src={row.original.avatar} />
				<span>{row.original.name}</span>
			</div>
		),
	},
];
```

### Server-side Sorting

```tsx
const [sorting, setSorting] = useState<SortingState>([]);

const fetchData = async (pageParam: number) => {
	const sortParam =
		sorting.length > 0
			? `&sort=${sorting[0].id}&order=${sorting[0].desc ? "desc" : "asc"}`
			: "";

	const response = await fetch(
		`/api/people?page=${pageParam}&limit=50${sortParam}`
	);
	return response.json();
};

<InfiniteScrollTable
	queryKey={["people", sorting]}
	queryFn={fetchData}
	sorting={sorting}
	onSortingChange={setSorting}
	// ... other props
/>;
```

### Error Handling

```tsx
const fetchData = async (pageParam: number) => {
	try {
		const response = await fetch(`/api/people?page=${pageParam}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	} catch (error) {
		console.error("Fetch error:", error);
		throw error;
	}
};
```

## 🚀 Performance Tips

1. **Use Virtual Scrolling**: Keep `enableVirtualization={true}` for large datasets
2. **Optimize Row Height**: Set accurate `rowHeight` for better performance
3. **Adjust Overscan**: Lower `overscan` for better performance, higher for smoother scrolling
4. **Memoize Columns**: Use `useMemo` for column definitions
5. **Debounce Sorting**: Debounce sorting changes to avoid excessive API calls

## 🐛 Troubleshooting

### Common Issues

1. **Data not loading**: Check queryKey and queryFn
2. **Infinite loading**: Verify hasNextPage logic in your API
3. **Performance issues**: Enable virtualization and optimize row height
4. **Sorting not working**: Ensure onSortingChange is provided

### Debug Mode

Enable debug mode to see table state:

```tsx
<InfiniteScrollTable
	// ... props
	debugTable={true}
/>
```

## 📄 License

This component is part of the nogl-landing project and follows the same license terms.
