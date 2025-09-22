"use server";
import { prisma } from "@/libs/prismaDb";

export async function getExpertSessions() {
  try {
    return await prisma.expertSession.findMany({
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        benefits: true,
        reviews: true,
      },
    });
  } catch (error) {
    console.error("Error fetching expert sessions:", error);
    return [];
  }
}