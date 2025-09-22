'use client';

import { useState, useEffect } from 'react';
import Pagination from "@/shared/Pagination";
import TabFilters from "./TabFilters";
import Heading2 from "@/shared/Heading2";
import StayCard2 from "@/components/StayCard2/StayCard2";
import { SessionDataType } from "@/data/types";
import { useSession } from "next-auth/react";

interface Props {
  initialData: SessionDataType[];
  className?: string;
}

export default function SectionGridFilterCard({ initialData, className = "" }: Props) {
  const [sessions, setSessions] = useState<any[]>([]);
  const { data: session } = useSession(); // Get current user session

  useEffect(() => {
    const fetchBookingStates = async () => {
      console.log('Initial data received:', initialData);

      let bookedSessionIds = new Set<string>();

      if (session && session.user) {
        // Fetch user bookings from the API
        try {
          const response = await fetch('/api/user/bookings');
          if (!response.ok) {
            throw new Error('Failed to fetch user bookings');
          }
          const data = await response.json();
          // Extract session IDs from bookings
          const sessionIds = data.map((booking: any) => booking.sessionId);
          bookedSessionIds = new Set<string>(sessionIds);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      }

      // Map sessions and include bookingState
      const mappedSessions = initialData.map((sessionData) => {
        console.log('Processing session:', sessionData);

        // Determine booking state
        const isBooked = bookedSessionIds.has(sessionData.id);
        const isPast = new Date(sessionData.date) < new Date();
        const bookingState = isPast
          ? 'PAST'
          : isBooked
          ? 'BOOKED'
          : 'AVAILABLE';

        // Explicit mapping with default values and transformations
        return {
          id: sessionData.id,
          featuredImage: sessionData.featuredImage,
          galleryImgs: sessionData.galleryImgs || [],
          title: sessionData.title,
          href: sessionData.href,
          expertId: sessionData.expertId,
          expertName: sessionData.expertName || 'Unknown Expert',
          timing: {
            sessionStart: sessionData.time || new Date().toISOString(),
            duration: parseInt(sessionData.sessionDuration) || 60
          },
          saleOff: sessionData.saleOff || '',
          price: sessionData.price || 0,
          reviews: {
            averageRating: sessionData.ratings || 0,
            totalReviews: sessionData.reviewCount || 0
          },
          categoryName: sessionData.category || 'Uncategorized',
          isCircleCommunity: sessionData.isCircleCommunity || false,
          availableSpots: sessionData.spotsAvailable || 0,
          bookedSpots: sessionData.spotsBooked || 0,
          maxParticipants: (sessionData.spotsAvailable || 0) + (sessionData.spotsBooked || 0),
          date: sessionData.date || new Date().toDateString(),
          time: sessionData.time || new Date().toISOString(),
          duration: parseInt(sessionData.sessionDuration) || 60,
          bookingState, // Include bookingState here
        };
      });

      console.log('Mapped sessions with booking states:', mappedSessions);
      setSessions(mappedSessions);
    };

    fetchBookingStates();
  }, [initialData, session]);

  if (!sessions.length) {
    return <div>No sessions available</div>;
  }

  return (
    <div className={`nc-SectionGridFilterCard ${className}`}>
      <Heading2 />
      <div className="mb-8 lg:mb-11">
        <TabFilters />
      </div>
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sessions.map((session) => (
          <StayCard2 key={session.id} data={session} />
        ))}
      </div>
      <div className="flex mt-16 justify-center items-center">
        <Pagination />
      </div>
    </div>
  );
}
