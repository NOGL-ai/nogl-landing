import { ErrorBoundary } from '@/components/ErrorBoundary';
import ClientSideGridFilter from './ClientSideGridFilter';
import { StayCardData } from "../types";

interface Props {
  initialData: StayCardData[];
  className?: string;
  expertId: string;
  isLoading?: boolean;
}

// Simple error fallback component
const ErrorFallback = () => (
  <div className="p-6 text-center bg-neutral-50 dark:bg-neutral-800 rounded-xl">
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
      Unable to load sessions
    </h3>
    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
      Please refresh the page to try again
    </p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
    >
      Refresh Page
    </button>
  </div>
);

export default async function SectionGridFilterCard({ 
  initialData, 
  className = "",
  expertId,
  isLoading = false
}: Props) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ClientSideGridFilter 
        initialData={initialData}
        className={className}
        isLoading={isLoading}
      />
    </ErrorBoundary>
  );
}

// Constants for pagination
export const PAGINATION_LIMITS = {
  DESKTOP: 9,  // 3x3 grid
  TABLET: 6,   // 2x3 grid
  MOBILE: 4    // 2x2 grid
} as const;