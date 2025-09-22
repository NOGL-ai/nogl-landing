import { SessionWithExpert } from "@/types/session";

const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

// Helper function to format date and time with timezone support
const formatDateTime = (date: string | Date, time: string | Date, timeZone: string) => {
  try {
    // Convert date and time to Date objects if they're strings
    const sessionDate = typeof date === 'string' ? new Date(date) : date;
    const timeDate = typeof time === 'string' ? new Date(time) : time;

    // Create a new date object combining the date and time components
    const combinedDate = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(),
      timeDate.getUTCHours(),
      timeDate.getUTCMinutes()
    );

    // Convert to the specified timezone
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(combinedDate);

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(combinedDate);

    return { formattedDate, formattedTime, combinedDate };
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return {
      formattedDate: 'Date TBD',
      formattedTime: 'Time TBD',
      combinedDate: null,
    };
  }
};

// Function to process session data and format it for rendering
export const processSessionData = (session: any): SessionWithExpert => {
  try {
    console.log("Processing session:", session.id);
    console.log("Session raw data:", session);

    const { formattedDate, formattedTime, combinedDate } = formatDateTime(
      session.date,
      session.startTime,
      session.timeZone
    );

    // Calculate session end time
    const sessionEnd = combinedDate
      ? new Date(combinedDate.getTime() + (session.duration || 60) * 60 * 1000)
      : null;

    // Calculate group discount price with a default discount of 20% if not specified
    const groupDiscountPrice = Math.round(
      session.price - (session.price * (session.groupDiscountPercentage || 20)) / 100
    );

    // Calculate early bird discount if applicable
    const earlyBirdDiscount = session.earlyBirdDiscount || 10;

    // Prepare reviews data
    const totalReviews = session.reviews.length;
    const averageRating = totalReviews
      ? session.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
      : 0;

    // Prepare benefits data
    const benefits = session.benefits.map((benefit: any) => ({
      id: benefit.id,
      name: benefit.name,
      icon: benefit.icon,
    }));

    return {
      ...session,
      date: formattedDate,
      time: `${formattedTime} ${session.timeZone || 'UTC'}`,
      timing: {
        sessionStart: combinedDate?.toISOString(),
        sessionEnd: sessionEnd?.toISOString(),
      },
      coverImage: session.coverImage
        ? `${R2_BUCKET_URL}/${session.coverImage}`
        : `${R2_BUCKET_URL}/default-session.jpg`,
      galleryImages: session.galleryImages?.map((img: string) =>
        img.startsWith('http') ? img : `${R2_BUCKET_URL}/${img}`
      ) || [],
      expert: {
        ...session.expert,
        image: session.expert.image
          ? session.expert.image.startsWith('http')
            ? session.expert.image
            : `${R2_BUCKET_URL}/${session.expert.image}`
          : `${R2_BUCKET_URL}/default-avatar.png`,
      },
      pricing: {
        standardPrice: session.price,
        groupDiscountPrice,
        earlyBirdDiscount,
        cancellationRefund: session.cancellationPolicy || "50% refund",
        accessDuration: `${session.accessDurationDays || 7} days`,
      },
      reviews: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
        featuredReview: session.reviews[0] || null,
      },
      benefits,
      preparation: {
        materials: [],
        requirements: session.prerequisites || [],
      },
      specialNotes: [],
      expertiseLevel: session.expertiseLevel || "All Levels",
      bookedSpots: session.bookedSpots || 0,
      availableSpots: session.availableSpots || session.maxParticipants - (session.bookedSpots || 0),
    };
  } catch (error) {
    console.error('Error in processSessionData:', error);
    return session;
  }
};
