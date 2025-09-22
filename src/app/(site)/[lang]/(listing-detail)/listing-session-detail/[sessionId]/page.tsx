// COMMENTED OUT - Listing Session Detail page disabled for build optimization
// // src/app/(site)/(listing-detail)/listing-session-detail/[sessionId]/page.tsx

// import { FC } from 'react';
// import { notFound } from 'next/navigation';
// import { fetchSessionById } from '@/utils/fetchSessionById';
// import SessionDetail from '@/app/(site)/[lang]/(client-components)/(Sessions)/SessionDetail';
// // import { decodeId } from '@/utils/hashId';

// interface Props {
//   params: { sessionId: string };
//   searchParams: {
//     participants?: string;
//     isBooked?: string;
//     state?: string;
//     price?: string;
//     includeRecording?: string;
//     recordingCount?: string;
//     paymentStatus?: string;
//   };
// }

// export const revalidate = 0;

// // Temporary local decode function for testing
// const localDecodeId = (id: string): string => {
//   // For testing, just return the ID as-is
//   return id;
// };

// COMMENTED OUT - Listing Session Detail component disabled for build optimization
/*
const ListingSessionDetailPage: FC<Props> = async ({ params, searchParams }) => {
  console.log('🔍 Session ID:', params.sessionId);
  console.log('📝 Raw Search Params:', searchParams);

  try {
    const sessionId = params.sessionId; // "191203a4-24cf-45f6-9967-a742474d4542"
    
    const session = await fetchSessionById(sessionId);

    if (!session) {
      console.log('❌ No session found with ID:', sessionId);
      return notFound();
    }

    // Create booking state from URL parameters
    const bookingState = {
      isBooked: searchParams?.isBooked === 'true',
      bookingDetails: {
        numParticipants: parseInt(searchParams?.participants || '0'),
        includeRecording: searchParams?.includeRecording === 'true',
        recordingCount: parseInt(searchParams?.recordingCount || '0'),
        totalPaid: parseFloat(searchParams?.price || '0'),
        status: searchParams?.state || 'UPCOMING',
        paymentStatus: searchParams?.paymentStatus || 'PENDING'
      }
    };

    // Pass both session and booking details to SessionDetail
    return (
      <SessionDetail 
        session={session} 
        isBooked={bookingState.isBooked}
        bookingDetails={bookingState.bookingDetails}
      />
    );
  } catch (error) {
    console.error('💥 Database query error:', error);
    return notFound();
  }
};
*/

// Placeholder component to prevent build errors
const ListingSessionDetailPage = async ({ params, searchParams }: any) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Session Details Temporarily Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This feature has been temporarily disabled for build optimization.
        </p>
      </div>
    </div>
  );
};

export default ListingSessionDetailPage;
