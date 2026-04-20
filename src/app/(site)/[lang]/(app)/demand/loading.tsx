import { ForecastLoadingSkeleton } from "@/components/forecast/ForecastLoadingSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <ForecastLoadingSkeleton />
    </div>
  );
}
