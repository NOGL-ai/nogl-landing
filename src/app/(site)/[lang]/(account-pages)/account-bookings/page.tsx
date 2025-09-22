"use client";

import { Tab } from "@headlessui/react";
import StayCard2 from "@/components/StayCard2/StayCard2";
import React, { Fragment, useState, useEffect } from "react";

interface Booking {
  id: string;
  sessionId: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  timeZone: string;
  price: number;
  originalPrice: number;
  discountAmount: number | null;
  featuredImage: string;
  galleryImgs: string[];
  expert: {
    id: string;
    name: string;
    image: string;
    role: string;
    bio: string;
    expertise: string[];
  };
  timing: {
    sessionStart: string;
    duration: number;
  };
  description: string;
  category: string;
  language: string;
  status: string;
  paymentStatus: string;
  joinUrl: string | null;
  numParticipants: number;
  maxParticipants: number;
  availableSpots: number;
  bookedSpots: number;
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
  isCircleCommunity: boolean;
  href: string;
}

const getBookingState = (
  sessionStart: Date,
  duration: number
): "PAST" | "READY_TO_JOIN" | "UPCOMING" => {
  const now = new Date();

  // Convert duration from hours to milliseconds
  const durationInMs = duration * 60 * 60 * 1000;

  const thirtyMinutesBefore = new Date(sessionStart.getTime() - 30 * 60 * 1000);
  const sessionEnd = new Date(sessionStart.getTime() + durationInMs);

  if (now > sessionEnd) {
    return "PAST";
  } else if (now >= thirtyMinutesBefore && now <= sessionEnd) {
    return "READY_TO_JOIN";
  } else {
    return "UPCOMING";
  }
};

const adaptBookingForStayCard = (booking: Booking) => {
  try {
    // Extract date and time components
    const sessionDate = new Date(booking.date);
    const timeDate = new Date(booking.startTime);

    // Create a new combined date with the correct date and time
    const combinedDateTime = new Date(
      Date.UTC(
        sessionDate.getUTCFullYear(), // Year from the actual date
        sessionDate.getUTCMonth(), // Month from the actual date
        sessionDate.getUTCDate(), // Day from the actual date
        timeDate.getUTCHours(), // Hours from the time
        timeDate.getUTCMinutes(), // Minutes from the time
        0
      )
    );

    // Calculate bookingState
    const bookingState = getBookingState(combinedDateTime, booking.duration);

    // Explicitly calculate availableSpots if not correctly set
    const availableSpots =
      booking.maxParticipants - booking.bookedSpots >= 0
        ? booking.maxParticipants - booking.bookedSpots
        : 0;
    return {
      id: booking.sessionId, // Use sessionId to match the session
      featuredImage:
        booking.featuredImage || "/images/default-session.jpg",
      galleryImgs:
        booking.galleryImgs?.length > 0
          ? booking.galleryImgs
          : ["/images/default-session.jpg"],
      title: booking.title,
      href: booking.href,
      expertId: booking.expert?.id || "",
      expertName: booking.expert?.name || "Expert",
      timing: {
        sessionStart: combinedDateTime.toISOString(), // Use combined date/time
        duration: booking.duration,
      },
      saleOff: booking.discountAmount
        ? `${Math.round(
            (booking.discountAmount / booking.originalPrice) * 100
          )}%`
        : "",
      price: booking.price || 0,
      reviews: {
        averageRating: booking.reviews?.averageRating || 0,
        totalReviews: booking.reviews?.totalReviews || 0,
      },
      categoryName: booking.category || "Booked Session",
      isCircleCommunity: booking.isCircleCommunity || false,
      availableSpots: booking.availableSpots || 0,
      bookedSpots: booking.bookedSpots || 1,
      maxParticipants: booking.maxParticipants || 1,
      date: combinedDateTime.toISOString(),
      time: combinedDateTime.toISOString(),
      duration: booking.duration,
      spotsAvailable: booking.availableSpots || 0,
      spotsBooked: booking.bookedSpots || 0,
      sessionDuration: booking.duration.toString(),
      ratings: booking.reviews?.averageRating || 0,
      reviewCount: booking.reviews?.totalReviews || 0,
      expert: booking.expert,
      category: booking.category,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      joinUrl: booking.joinUrl,
      timeZone: booking.timeZone,
      bookingState, // Include bookingState here,
    };
  } catch (error) {
    console.error("Error adapting booking:", error);
    return {
      ...booking,
      date: new Date().toISOString(),
      time: new Date().toISOString(),
      duration: 60,
      bookingState: "Upcoming", // Default bookingState
    };
  }
};

const AccountBookings = () => {
  const [categories] = useState(["Sessions"]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/user/bookings");
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const data = await response.json();

        setBookings(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load bookings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const renderSection1 = () => {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <Tab.Group>
            <Tab.List className="flex space-x-1 overflow-x-auto">
              {categories.map((item) => (
                <Tab key={item} as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`flex-shrink-0 block !leading-none font-medium px-5 py-2.5 text-sm sm:text-base sm:px-6 sm:py-3 capitalize rounded-full focus:outline-none ${
                        selected
                          ? "bg-secondary-900 text-secondary-50 "
                          : "text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      } `}
                    >
                      {item}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className="mt-8">
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : bookings.length === 0 ? (
                  <div>No bookings found</div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {bookings.map((booking) => (
                      <StayCard2
                        key={booking.sessionId}
                        data={adaptBookingForStayCard(booking)}
                      />
                    ))}
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    );
  };

  return renderSection1();
};

export default AccountBookings;
