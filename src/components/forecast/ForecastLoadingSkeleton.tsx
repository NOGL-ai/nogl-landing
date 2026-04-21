export function ForecastLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-[360px] animate-pulse rounded-xl bg-muted" />
      <div className="h-[180px] animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
