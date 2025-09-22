// src/components/StayCard2/StayCard2.tsx
import React, { FC } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Badge from "@/shared/Badge";
import StayCard2Client from "./StayCard2Client";
import StayCard2ActionButton from './StayCard2ActionButton';

const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

export interface StayCard2Props {
  className?: string;
  data: {
    id: string;
    featuredImage: string;
    galleryImgs: string[];
    title: string;
    href: string;
    expertId: string;
    expertName: string;
    timing: {
      sessionStart: string;
      duration: number;
    };
    saleOff: string;
    price: number;
    reviews: {
      averageRating: number;
      totalReviews: number;
    };
    categoryName: string;
    isCircleCommunity: boolean;
    availableSpots: number;
    bookedSpots: number;
    maxParticipants: number;
    date: string;
    time: string;
    duration: number;
    bookingState?: 'PAST' | 'READY_TO_JOIN' | 'UPCOMING' | 'BOOKED' | 'AVAILABLE';
    joinUrl?: string | null;
    numParticipants?: number;
    includeRecording?: boolean;
    recordingCount?: number;
    status?: string;
    paymentStatus?: string;
  };
  size?: "default" | "small";
}

const StayCard2: FC<StayCard2Props> = ({
  size = "default",
  className = "",
  data,
}) => {
  if (!data) {
    return null;
  }

  const {
    id,
    galleryImgs,
    title,
    href,
    saleOff,
    price,
    reviews,
    categoryName,
    isCircleCommunity,
    availableSpots = 0,
    bookedSpots = 0,
    featuredImage,
    expertId,
    expertName: initialName,
    timing,
    maxParticipants,
    date,
    time,
    duration,
    bookingState,
    joinUrl,
    numParticipants,
    includeRecording,
    recordingCount,
    status,
    paymentStatus,
  } = data;

  const expertName: string = initialName || 'Expert Not Available';

  const formattedGalleryImgs = galleryImgs.map(img => 
    img.startsWith('http') ? img : `${R2_BUCKET_URL}/${img}`
  );

  const formattedFeaturedImage = featuredImage?.startsWith('http') 
    ? featuredImage 
    : `${R2_BUCKET_URL}/${featuredImage}`;

  const sessionDuration = timing?.duration ? `${timing.duration} mins` : 'Duration not specified';
  const ratings = reviews?.averageRating || 0;
  const reviewCount = reviews?.totalReviews || 0;

  const formatDateTime = (date: string, time: string) => {
    try {
      const formattedDate = date;

      const timeDate = new Date(time);
      const formattedTime = timeDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return {
        date: formattedDate,
        time: `${formattedTime} CET`,
      };
    } catch (error) {
      console.error('Error formatting date/time:', error);
      return { date: 'Date TBD', time: 'Time TBD' };
    }
  };

  const { date: formattedDate, time: formattedTime } = formatDateTime(date, time);

  const renderContent = () => {
    return (
      <div className={`${size === "default" ? "mt-3 space-y-2" : "mt-2 space-y-2"} 
          h-[260px] sm:h-[300px] lg:h-[340px]
          w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[380px]
          mx-auto
          flex flex-col`}
      >
        {/* Category Badges */}
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <Badge name={categoryName} className="text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5" />
          {Boolean(isCircleCommunity) && (
            <Badge name="Circle" color="green" className="text-xs lg:text-sm px-2 py-1 lg:px-3 lg:py-1.5" />
          )}
        </div>

        {/* Title */}
        <div className='flex items-center space-x-2 min-h-[48px] sm:min-h-[56px] lg:min-h-[64px]'>
          <h2 className={`font-semibold capitalize text-neutral-900 dark:text-white 
              ${title.length > 50 
                  ? 'text-[11px] lg:text-xs' 
                  : title.length > 30 
                      ? 'text-xs lg:text-sm' 
                      : 'text-sm lg:text-base'}`}
          >
            <span className='line-clamp-2'>{title}</span>
          </h2>
        </div>

        {/* Author Information */}
        <div className="flex items-center space-x-2 text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
          <UserCircleIcon className="h-6 w-6 lg:h-8 lg:w-8 text-neutral-500" />
          <span>
            Led by{' '}
            <span className="font-medium text-neutral-900 dark:text-neutral-200 line-clamp-1">
              {expertName}
            </span>
          </span>
        </div>

        {/* Calendar and Time Information */}
        <div className="flex items-center justify-between text-[10px] lg:text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center">
            <i className="las la-calendar text-sm lg:text-base"></i>
            <span className="ml-1">{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <i className="las la-clock text-lg text-neutral-500"></i>
            <span className="ml-1">{formattedTime}</span>
          </div>
        </div>

        {/* Guest Information */}
        <div className="flex justify-between text-[10px] lg:text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center">
            <i className="las la-user-plus text-sm lg:text-base"></i>
            <span className="ml-1">Available: {availableSpots}</span>
          </div>
          <div className="flex items-center">
            <i className="las la-user-check text-sm lg:text-base"></i>
            <span className="ml-1">Booked: {bookedSpots}</span>
          </div>
        </div>

        {/* Divider */}
        <div className='w-14 border-b border-neutral-100 dark:border-neutral-800'></div>

        {/* Price and Button */}
        <div className='mt-auto flex items-center justify-between'>
          <span className='text-sm lg:text-base font-semibold'>€
            {price}
            {' '}
            <span className='text-xs lg:text-sm font-normal text-neutral-500 dark:text-neutral-400'>
              /session
            </span>
          </span>
          {renderActionButton()}
        </div>
      </div>
    );
  };

  const renderActionButton = () => {
    return (
      <StayCard2ActionButton
        href={data.href}
        bookingState={data.bookingState} // Pass bookingState directly
        joinUrl={data.joinUrl}
        bookedSpots={bookedSpots}
        status={data.status}
        price={data.price}
        includeRecording={data.includeRecording}
        recordingCount={data.recordingCount}
        paymentStatus={data.paymentStatus}
      />
    );
  };

  return (
    <div 
      className={`nc-StayCard2 group relative ${className} 
          w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[380px]
          mx-auto block`}
      aria-label={`View details for ${title}`}
    >
      <StayCard2Client
        id={id}
        galleryImgs={formattedGalleryImgs}
        saleOff={saleOff}
        duration={duration}
        ratings={reviews?.averageRating}
        reviewCount={reviews?.totalReviews}
      />
      {renderContent()}
    </div>
  );
};

export default StayCard2;
