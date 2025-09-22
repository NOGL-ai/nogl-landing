import { prisma } from "@/libs/prismaDb";
import { SessionWithExpert } from "@/types/session";
import { processSessionData } from "./processSessionData";

export const fetchSessions = async (): Promise<SessionWithExpert[]> => {
  try {
    const sessions = await prisma.expertSession.findMany({
      select: {
        id: true,
        date: true,
        startTime: true,
        timeZone: true,
        title: true,
        category: true, // Include category
        sessionType: true, // Include sessionType
        isCircleCommunity: true, // Include isCircleCommunity
        coverImage: true, // Include coverImage
        galleryImages: true, // Include galleryImages
        price: true, // Include price
        groupDiscountPercentage: true,
        earlyBirdDiscount: true,
        cancellationPolicy: true,
        accessDurationDays: true,
        prerequisites: true,
        duration: true,
        expertiseLevel: true,
        bookedSpots: true,
        availableSpots: true,
        maxParticipants: true,
        minParticipants: true,
        description: true, // Include description
        // Include other fields as needed
        expert: {
          select: {
            id: true,
            name: true,
            bio: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            totalSessions: true, // If available
          },
        },
        benefits: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    console.log('Raw sessions from DB:', sessions);

    return sessions.map((session: any) => processSessionData(session));
  } catch (error) {
    console.error("Fetch sessions error:", error);
    throw error;
  }
};
