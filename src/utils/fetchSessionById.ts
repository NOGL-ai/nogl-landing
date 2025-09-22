// src/utils/fetchSessionById.ts

import { prisma } from "@/libs/prismaDb";
import { SessionWithExpert } from "@/types/session";
import { processSessionData } from "./processSessionData";

export const fetchSessionById = async (
  sessionId: string
): Promise<SessionWithExpert> => {
  if (!sessionId) {
    throw { message: "Session ID is required.", status: 400 };
  }

  try {
    const session = await prisma.expertSession.findUnique({
      where: { id: sessionId },
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            bio: true,
            image: true,
            createdAt: true,
            updatedAt: true,
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
        }
      },
    });

    if (!session) {
      throw { message: "Session not found.", status: 404 };
    }

    const processedSession = processSessionData(session);
    return processedSession;
  } catch (error) {
    console.error("Fetch session error:", error);
    throw error;
  }
};

