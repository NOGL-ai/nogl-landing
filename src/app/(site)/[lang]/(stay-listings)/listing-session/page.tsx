// COMMENTED OUT - Listing Session page disabled for build optimization
// import React from "react";
// import { fetchSessions } from "@/utils/fetchSessions";
// import SectionGridFilterCard from "../SectionGridFilterCard";
// import { processSessionData } from "@/utils/processSessionData";
// import { SessionDataType } from "@/data/types";
// // import { generateSessionUrl } from "@/utils/hashId";
// import { Route } from "@/routers/types";

// const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

// // Temporary local encode function for testing
// const localGenerateSessionUrl = (id: string): Route => {
//   return `/listing-session-detail/${id}` as Route;
// };

// export const revalidate = 0;

// COMMENTED OUT - Listing Session component disabled for build optimization
/*
export default async function ListingSessionPage() {
  try {
    const rawSessions = await fetchSessions();
    console.log('Raw sessions count:', rawSessions.length);
    
    const processedSessions: SessionDataType[] = rawSessions.map(session => {
      console.log('Processing session:', session.id);
      const processed = processSessionData(session);
      
      const sessionData: SessionDataType = {
        id: processed.id,
        expertId: processed.expert?.id || '',
        featuredImage: processed.coverImage 
          ? `${R2_BUCKET_URL}/${processed.coverImage}`
          : `${R2_BUCKET_URL}/default-session.jpg`,
        galleryImgs: (processed.galleryImages || []).map(img => 
          img.startsWith('http') ? img : `${R2_BUCKET_URL}/${img}`
        ),
        sessionDuration: `${processed.duration || 1} hrs`,
        saleOff: "",
        ratings: processed.reviews.averageRating || 0,
        reviewCount: processed.reviews.totalReviews || 0,
        category: processed.category || 'Uncategorized',
        isCircleCommunity: processed.isCircleCommunity ?? false,
        title: processed.title || 'Untitled Session',
        expertName: processed.expert?.name || 'Unknown Expert',
        date: new Date(processed.timing.sessionStart).toDateString(),
        time: processed.timing.sessionStart,
        spotsAvailable: processed.maxParticipants - (processed.bookedSpots || 0),
        spotsBooked: processed.bookedSpots || 0,
        price: Number(processed.price) || 0,
        href: localGenerateSessionUrl(processed.id),
      };
      return sessionData;
    });
    
    console.log('Processed sessions count:', processedSessions.length);
    
    return (
      <SectionGridFilterCard 
        initialData={processedSessions} 
        className="container pb-24 lg:pb-28" 
      />
    );
  } catch (error) {
    console.error('Error in ListingSessionPage:', error);
    return <div>Error loading sessions</div>;
  }
}
*/

// Placeholder component to prevent build errors
export default async function ListingSessionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Session Listings Temporarily Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This feature has been temporarily disabled for build optimization.
        </p>
      </div>
    </div>
  );
}
