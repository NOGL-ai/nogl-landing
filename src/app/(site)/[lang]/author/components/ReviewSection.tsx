import React from "react";
import ButtonSecondary from "@/shared/ButtonSecondary";
// import CommentListing from "@/components/CommentListing";

interface ReviewSectionProps {
  totalReviews?: number;
}

const ReviewSection = ({ totalReviews = 23 }: ReviewSectionProps) => {
  return (
    <div className='listingSection__wrap'>
      {/* HEADING */}
      <h2 className='text-2xl font-semibold'>
        Reviews ({totalReviews} reviews)
      </h2>
      <div className='w-14 border-b border-neutral-200 dark:border-neutral-700'></div>

      {/* COMMENTS */}
      <div className='divide-y divide-neutral-100 dark:divide-neutral-800'>
        {/* <CommentListing hasListingTitle className='pb-8' />
        <CommentListing hasListingTitle className='py-8' />
        <CommentListing hasListingTitle className='py-8' />
        <CommentListing hasListingTitle className='py-8' /> */}
        <div className='pt-8'>
          <ButtonSecondary>
            View more {totalReviews - 3} reviews
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection; 