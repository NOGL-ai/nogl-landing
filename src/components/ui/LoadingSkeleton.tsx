import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  itemCount?: number;
  className?: string;
}

export const LoadingSkeleton = ({ 
  itemCount = 6,  // Default to 6 items
  className = "" 
}: LoadingSkeletonProps) => (
  <div className={className}>
    {/* Tabs Skeleton */}
    <div className="sticky top-[80px] z-10 bg-white dark:bg-neutral-900">
      <div className="flex space-x-1 rounded-xl bg-neutral-100/70 p-1 dark:bg-neutral-800/70">
        {[...Array(6)].map((_, index) => (
          <Skeleton 
            key={`tab-${index}`}
            className="h-10 w-full rounded-lg"
          />
        ))}
      </div>
    </div>

    {/* Cards Grid Skeleton */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
      {[...Array(itemCount)].map((_, index) => (
        <div key={`card-${index}`} className="flex flex-col space-y-3">
          {/* Image */}
          <Skeleton className="w-full h-[200px] rounded-2xl" />
          
          {/* Title */}
          <Skeleton className="w-3/4 h-6 rounded-lg" />
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="w-full h-4 rounded-lg" />
            <Skeleton className="w-2/3 h-4 rounded-lg" />
          </div>
          
          {/* Price and Rating */}
          <div className="flex justify-between items-center mt-2">
            <Skeleton className="w-24 h-6 rounded-lg" />
            <Skeleton className="w-16 h-6 rounded-lg" />
          </div>
          
          {/* Tags/Badges */}
          <div className="flex space-x-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-20 h-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
); 