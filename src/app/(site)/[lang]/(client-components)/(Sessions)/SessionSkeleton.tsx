'use client';

const SessionSkeleton = () => {
  return (
    <div className="nc-SessionDetail animate-pulse">
      {/* HEADER SKELETON */}
      <header className="rounded-md sm:rounded-xl">
        <div className="relative grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2">
          {/* Main Image Skeleton */}
          <div className="relative col-span-2 row-span-3 h-[400px] bg-gray-200 rounded-xl" />
          
          {/* Gallery Images Skeleton */}
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`bg-gray-200 rounded-xl h-[195px] ${
                index >= 3 ? 'hidden sm:block' : ''
              }`}
            />
          ))}
        </div>
      </header>

      {/* MAIN CONTENT SKELETON */}
      <main className="relative z-10 mt-11 flex flex-col lg:flex-row">
        {/* Left Column */}
        <div className="w-full space-y-8 lg:w-3/5 lg:pr-10">
          {/* Title & Badges */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 w-20 bg-gray-200 rounded-full" />
              ))}
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>

          {/* Expert Info */}
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="mt-14 hidden lg:block lg:w-2/5">
          <div className="sticky top-28">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              {/* Price */}
              <div className="flex justify-between">
                <div className="h-8 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
              
              {/* Form Fields */}
              <div className="mt-6 space-y-4">
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>

              {/* Book Button */}
              <div className="mt-6 h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionSkeleton; 