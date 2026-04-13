export function SkeletonCompanyHeader() {
  return (
    <div className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="h-9 w-56 animate-pulse rounded bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="min-w-[140px] rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-6 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
