"use client"; // Ensure this component is treated as a Client Component

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GallerySlider from "@/components/GallerySlider";
import { SessionDataType } from "@/data/types";
import StartRating from "@/components/StartRating";
import BtnLikeIcon from "@/components/BtnLikeIcon";
import SaleOffBadge from "@/components/SaleOffBadge";
import Badge from "@/shared/Badge";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";

export interface StayCardBookingsProps {
  className?: string;
  data?: SessionDataType;
  size?: "default" | "small";
  onCancelBooking?: (sessionId: string) => void; // Callback to handle booking cancellation
}

const StayCardBookings: React.FC<StayCardBookingsProps> = ({
  size = "default",
  className = "",
  data,
  onCancelBooking,
}) => {
  const router = useRouter();
  const [isBooked, setIsBooked] = useState(false);
  const [conferenceId, setConferenceId] = useState<string>("");

  useEffect(() => {
    if (data?.id) {
      setConferenceId(`CONF-${data.id}`);
    }
  }, [data]);

  if (!data) {
    return null; // Return null if data is not passed
  }

  const {
    galleryImgs,
    title,
    href,
    like,
    saleOff,
    price,
    reviewStart,
    reviewCount,
    id,
    authorName,
    date,
    time,
    categoryName,
    sessionType,
    minGuests,
    maxGuests,
    isAds,
  } = data;

  const handleBookNow = () => {
    setIsBooked(true); // Set the session as booked
  };

  const handleCancel = () => {
    setIsBooked(false); // Cancel the booking
    if (onCancelBooking && id) {
      onCancelBooking(id); // Call the callback to handle booking cancellation
    }
  };

  const handleAttendClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Stop the event from bubbling up
    event.preventDefault();  // Prevent the default link behavior
    // Commented out video conference navigation to prevent performance issues
    alert('Video conference feature is temporarily unavailable for performance optimization.');
    // router.push(`/videoconference?id=${conferenceId}`); // Navigate to the videoconference page with conferenceId
  };

  const renderSliderGallery = () => {
    return (
      <div className="relative w-full">
        <GallerySlider
          uniqueID={`StayCardBookings_${id}`}
          ratioClass="aspect-w-12 aspect-h-11"
          galleryImgs={galleryImgs}
          imageClass="rounded-lg"
          href={href}
        />
        <BtnLikeIcon isLiked={like} className="absolute right-3 top-3 z-[1]" />
        {saleOff && (
          <SaleOffBadge className="absolute left-3 top-3" desc={saleOff} />
        )}
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={size === "default" ? "mt-3 space-y-3" : "mt-2 space-y-2"}>
        <div className="flex space-x-2">
          <Badge
            name={
              <div className="flex items-center">
                <i className="las la-home text-sm"></i>
                <span className="ml-1">{categoryName}</span>
              </div>
            }
          />
          <Badge
            name={
              <div className="flex items-center">
                <i className="las la-bed text-sm"></i>
                <span className="ml-1">{sessionType}</span>
              </div>
            }
            color="yellow"
          />
        </div>
        <div className="flex items-center space-x-2">
          {isAds && <Badge name="ADS" color="green" />}
          <h2
            className={`font-semibold capitalize text-neutral-900 dark:text-white ${
              size === "default" ? "text-base" : "text-base"
            }`}
          >
            <span className="line-clamp-1">{title}</span>
          </h2>
        </div>

        {/* Author Information */}
        <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400">
          <i className="las la-user text-lg"></i>
          <span>{authorName}</span>
        </div>

        {/* Calendar and Time Information */}
        <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center">
            <i className="las la-calendar text-lg"></i>
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <span className="ml-1">{`${time} CET`}</span>
          </div>
        </div>

        {/* Guest Information */}
        <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center">
            <i className="las la-user-friends text-lg"></i>
            <span className="ml-1">Min Guests: {minGuests}</span>
          </div>
          <div className="flex items-center">
            <i className="las la-user-friends text-lg"></i>
            <span className="ml-1">Max Guests: {maxGuests}</span>
          </div>
        </div>

        <div className="w-14 border-b border-neutral-100 dark:border-neutral-800"></div>
        <div className="flex items-center justify-between">
          {!isBooked ? (
            <>
              <span className="text-base font-semibold">
                {price}
                {` `}
                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  /session
                </span>
              </span>
              <ButtonPrimary className="ml-auto" onClick={handleBookNow}>
                Book Now
              </ButtonPrimary>
            </>
          ) : (
            <>
              <ButtonPrimary className="mr-auto" onClick={handleAttendClick}>
                Attend
              </ButtonPrimary>
              <ButtonSecondary className="ml-2" onClick={handleCancel}>
                Cancel
              </ButtonSecondary>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`nc-StayCardBookings group relative ${className}`}>
      {renderSliderGallery()}
      <div>{renderContent()}</div> {/* No Link wrapper here */}
    </div>
  );
};

export default StayCardBookings;
