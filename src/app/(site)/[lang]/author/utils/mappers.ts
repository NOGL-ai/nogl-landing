const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

export function mapSessionToStayCard(session: any) {
  return {
    id: session.id,
    featuredImage: session.coverImage 
          ? `${R2_BUCKET_URL}/${session.coverImage}`
          : `${R2_BUCKET_URL}/default-session.jpg`,
    galleryImgs: (session.galleryImages || []).map(img => 
            img.startsWith('http') ? img : `${R2_BUCKET_URL}/${img}`
          ),
    title: session.title,
    href: `/listing-session-detail/${session.id}`,
    expertName: session.expert?.name || "Unknown Expert",
    timing: {
      sessionStart: session.startTime,
      duration: session.duration,
    },
    saleOff: "",
    price: session.price,
    reviews: {
      averageRating: session.averageRating || 0,
      totalReviews: session.totalReviews || 0,
    },
    categoryName: session.category || "Uncategorized",
    sessionType: session.sessionType,
    isCircleCommunity: session.isCircleCommunity ?? false,
    availableSpots: session.maxParticipants - (session.bookedSpots || 0),
    bookedSpots: session.bookedSpots || 0,
    maxParticipants: session.maxParticipants,
    date: session.date,
    time: session.startTime,
    duration: session.duration,
  };
} 