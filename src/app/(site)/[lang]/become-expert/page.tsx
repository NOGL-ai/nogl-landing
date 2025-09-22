// COMMENTED OUT - Become Expert page disabled for build optimization
// "use client";
// import ExpertVerificationForm from '@/components/ExpertVerificationForm';

// COMMENTED OUT - Become Expert component disabled for build optimization
/*
export default function BecomeExpertPage() {
  return (
    <div className="relative pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <ExpertVerificationForm />
      </div>
    </div>
  );
}
*/

// Placeholder component to prevent build errors
export default function BecomeExpertPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Become Expert Temporarily Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This feature has been temporarily disabled for build optimization.
        </p>
      </div>
    </div>
  );
} 