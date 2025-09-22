import { prisma } from "@/libs/prismaDb";
import { SessionWithExpert } from "@/types/session";
import { SessionType } from "@prisma/client";
import { processSessionData } from "./processSessionData";

interface FetchSessionsParams {
  expertId: string;
  sessionType?: SessionType;
}

export const fetchSessionsByExpertId = async ({ 
  expertId, 
  sessionType 
}: FetchSessionsParams): Promise<SessionWithExpert[]> => {
  try {
    const sessions = await prisma.expertSession.findMany({
      where: {
        expertId,
        ...(sessionType && { sessionType })
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        timeZone: true,
        title: true,
        category: true,
        sessionType: true,
        isCircleCommunity: true,
        coverImage: true,
        galleryImages: true,
        price: true,
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
        description: true,
        expert: {
          select: {
            id: true,
            name: true,
            bio: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            totalSessions: true,
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

    return sessions.map((session) => processSessionData(session));
  } catch (error) {
    console.error("Fetch sessions error:", error);
    throw error;
  }
};
