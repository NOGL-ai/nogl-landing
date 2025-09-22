import { SessionWithExpert } from '@/types/session';

const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

export function processSessionData(session: any): SessionWithExpert {
  if (!session?.expert) {
    // Provide default expert data if missing
    session.expert = {
      id: '',
      name: 'Unknown Expert',
      image: `${R2_BUCKET_URL}/default-avatar.png`,
    };
  }

  const totalReviews = session.reviews?.length || 0;
  const averageRating = totalReviews
    ? session.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
    : 0;

  // Format the date and time
  const startTime = new Date(session.startTime);
  const formattedDate = startTime.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return {
    ...session,
    featuredImage: session.coverImage 
      ? `${R2_BUCKET_URL}/${session.coverImage}` 
      : `${R2_BUCKET_URL}/default-session.jpg`,
    galleryImgs: session.galleryImages?.map((img: string) =>
      img.startsWith('http') ? img : `${R2_BUCKET_URL}/${img}`
    ) || [],
    expert: {
      id: session.expert.id,
      name: session.expert.name || 'Unknown Expert',
      bio: session.expert.bio,
      image: session.expert.image
        ? session.expert.image.startsWith('http')
          ? session.expert.image
          : `${R2_BUCKET_URL}/${session.expert.image}`
        : `${R2_BUCKET_URL}/default-avatar.png`,
    },
    reviews: {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
      featuredReview: session.reviews?.[0] || null,
    },
    timing: {
      sessionStart: session.startTime.toISOString(),
      sessionEnd: new Date(
        session.startTime.getTime() + session.duration * 60000
      ).toISOString(),
      duration: session.duration,
      loginTime: "Please log in 15 minutes before start time",
      breakTime: "15 minutes at the midway point",
    },
    date: formattedDate,
    time: formattedTime,
    title: session.title,
    category: session.category,
    isCircleCommunity: session.isCircleCommunity || true,
    price: session.price,
    saleOff: session.earlyBirdDiscount || 0,
    availableSpots: session.maxParticipants - (session.bookedSpots || 0),
    bookedSpots: session.bookedSpots || 0,
    maxParticipants: session.maxParticipants
  };
}