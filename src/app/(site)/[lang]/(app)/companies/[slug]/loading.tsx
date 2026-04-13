import { SkeletonCompanyHeader } from "@/components/companies/SkeletonCompanyHeader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <SkeletonCompanyHeader />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    </div>
  );
}
