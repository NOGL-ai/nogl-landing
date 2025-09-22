import { SessionWithExpert } from "@/types/session";

const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

export function processSessionData(session: any): SessionWithExpert {
  const totalReviews = session.reviews?.length || 0;
  const averageRating = totalReviews
    ? session.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
    : 0;

  return {
    ...session,
    coverImage: session.coverImage 
      ? `${R2_BUCKET_URL}/${session.coverImage}` 
      : `${R2_BUCKET_URL}/default-session.jpg`,
    expert: {
      ...session.expert,
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
      loginTime: "Please log in 15 minutes before start time",
      breakTime: "15 minutes at the midway point",
    },
  };
}
