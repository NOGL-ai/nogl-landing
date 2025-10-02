// COMMENTED OUT - Uses removed ExpertSession model
/*
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
*/

"use server";

// Temporary replacement - returns empty array for removed functionality
export async function getExpertSessions() {
  console.warn("ExpertSession functionality has been removed");
  return [];
}