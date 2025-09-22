"use client";

import React from "react";
import ShimmerButton from "@/components/ui/shimmer-button";
import { useRouter } from "next/navigation";
import { Route } from "next";

interface StayCard2ActionButtonProps {
  href: string;
  bookingState?: "PAST" | "READY_TO_JOIN" | "UPCOMING" | "BOOKED" | "AVAILABLE";
  joinUrl?: string | null;
  bookedSpots: number;
  status?: string;
  price?: number;
  includeRecording?: boolean;
  recordingCount?: number;
  paymentStatus?: string;
}

const StayCard2ActionButton: React.FC<StayCard2ActionButtonProps> = ({
  href,
  bookingState,
  joinUrl,
  bookedSpots,
  status,
  price,
  paymentStatus,
}) => {
  console.log("Component Props:", {
    bookingState,
    status,
    href,
    bookedSpots,
    price,
    paymentStatus,
  });

  const router = useRouter();

  const handleShowDetails = () => {
    const sessionId = href.split("/").pop();
    const isSessionBooked =
      bookingState === "BOOKED" ||
      bookingState === "READY_TO_JOIN" ||
      bookingState === "UPCOMING";

    const params: Record<string, string> = {
      participants: bookedSpots.toString(),
      isBooked: String(isSessionBooked),
      state: status || "UPCOMING",
      price: price?.toString() || "0",
    };

    if (isSessionBooked) {
      params.paymentStatus = paymentStatus || "PENDING";
    }

    const searchParams = new URLSearchParams(params);
    router.push(
      `/listing-session-detail/${sessionId}?${searchParams.toString()}` as Route
    );
  };

  const renderActionButton = () => {
    console.log("Rendering button with:", {
      bookingState,
      status,
      isReadyToJoin: bookingState === "READY_TO_JOIN",
      isPast: bookingState === "PAST",
      isBooked: bookingState === "BOOKED",
      isUpcoming: bookingState === "UPCOMING",
    });

    if (bookingState === "READY_TO_JOIN") {
      console.log("Showing: Join Session");
      return (
        <ShimmerButton
          onClick={(e) => {
            e.preventDefault();
            if (joinUrl) window.open(joinUrl, "_blank");
          }}
          className="ml-auto text-xs lg:text-sm text-white dark:text-white"
        >
          Join Session
        </ShimmerButton>
      );
    }

    if (bookingState === "PAST") {
      console.log("Showing: Session Ended");
      return (
        <ShimmerButton
          className="ml-auto text-xs lg:text-sm text-white dark:text-white opacity-50 cursor-not-allowed"
          disabled
        >
          Session Ended
        </ShimmerButton>
      );
    }

    if (bookingState === "BOOKED" || bookingState === "UPCOMING") {
      console.log("Showing: View Details");
      return (
        <ShimmerButton
          onClick={handleShowDetails}
          className="ml-auto text-xs lg:text-sm text-white dark:text-white"
        >
          View Details
        </ShimmerButton>
      );
    }

    // Default case: Book Now
    console.log("Showing: Book Now");
    return (
      <ShimmerButton
        onClick={handleShowDetails}
        className="ml-auto text-xs lg:text-sm text-white dark:text-white"
      >
        Book Now
      </ShimmerButton>
    );
  };

  return <>{renderActionButton()}</>;
};

export default StayCard2ActionButton;
