import { prisma } from "@/libs/prismaDb";
import { createHash } from "crypto";

export function encodeId(id: string): string {
  const hashSecret = process.env.HASH_SECRET;
  if (!hashSecret) {
    throw new Error("HASH_SECRET environment variable is not set");
  }

  return createHash("sha256")
    .update(`${id}-${hashSecret}`)
    .digest("hex")
    .slice(0, 12);
}

export async function decodeId(hashedId: string): Promise<string | null> {
  try {
    const allSessions = await prisma.expertSession.findMany({
      select: { id: true },
    });

    const matchingSession = allSessions.find(
      (session) => encodeId(session.id) === hashedId
    );

    return matchingSession?.id || null;
  } catch (error) {
    console.error("Error in decodeId:", error);
    return null;
  }
}

export function generateSessionUrl(id: string): string {
  const hashedId = encodeId(id);
  return `/listing-session-detail/${hashedId}`;
}
