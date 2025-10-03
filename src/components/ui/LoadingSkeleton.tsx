import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
	itemCount?: number;
	className?: string;
}

export const LoadingSkeleton = ({
	itemCount = 6, // Default to 6 items
	className = "",
}: LoadingSkeletonProps) => (
	<div className={className}>
		{/* Tabs Skeleton */}
		<div className='sticky top-[80px] z-10 bg-white dark:bg-neutral-900'>
			<div className='flex space-x-1 rounded-xl bg-neutral-100/70 p-1 dark:bg-neutral-800/70'>
				{[...Array(6)].map((_, index) => (
					<Skeleton key={`tab-${index}`} className='h-10 w-full rounded-lg' />
				))}
			</div>
		</div>

		{/* Cards Grid Skeleton */}
		<div className='mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3'>
			{[...Array(itemCount)].map((_, index) => (
				<div key={`card-${index}`} className='flex flex-col space-y-3'>
					{/* Image */}
					<Skeleton className='h-[200px] w-full rounded-2xl' />

					{/* Title */}
					<Skeleton className='h-6 w-3/4 rounded-lg' />

					{/* Description */}
					<div className='space-y-2'>
						<Skeleton className='h-4 w-full rounded-lg' />
						<Skeleton className='h-4 w-2/3 rounded-lg' />
					</div>

					{/* Price and Rating */}
					<div className='mt-2 flex items-center justify-between'>
						<Skeleton className='h-6 w-24 rounded-lg' />
						<Skeleton className='h-6 w-16 rounded-lg' />
					</div>

					{/* Tags/Badges */}
					<div className='flex space-x-2'>
						<Skeleton className='h-5 w-16 rounded-full' />
						<Skeleton className='h-5 w-20 rounded-full' />
					</div>
				</div>
			))}
		</div>
	</div>
);
