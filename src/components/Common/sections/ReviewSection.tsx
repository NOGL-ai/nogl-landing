"use client";

import React from "react";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  totalReviews?: number;
  className?: string;
  showViewMore?: boolean;
  visibleReviews?: number;
}

const ReviewSection = ({
  totalReviews = 0,
  className,
  showViewMore = true,
  visibleReviews = 3,
}: ReviewSectionProps) => {
  return (
    <div className={cn('listingSection__wrap', className)}>
      {/* HEADING */}
      <h2 className='text-2xl font-semibold'>
        Reviews ({totalReviews} reviews)
      </h2>
      <div className='w-14 border-b border-neutral-200 dark:border-neutral-700'></div>

      {/* COMMENTS */}
      <div className='divide-y divide-neutral-100 dark:divide-neutral-800'>
        {totalReviews > 0 ? (
          <>
            {/* Review items would go here */}
            {showViewMore && totalReviews > visibleReviews && (
              <div className='pt-8'>
                <ButtonSecondary>
                  View more {totalReviews - visibleReviews} reviews
                </ButtonSecondary>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center text-neutral-500 dark:text-neutral-400">
            No reviews yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;