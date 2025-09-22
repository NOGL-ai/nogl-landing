import { fetchSessionsByExpertId } from "@/utils/fetchSessionByExpertId";
import { SessionType } from "@prisma/client";
import { mapSessionToStayCard } from "./mappers";

export async function getAuthorData(expertId: string, sessionType?: SessionType) {
  try {
    const rawSessions = await fetchSessionsByExpertId(expertId, sessionType);
    const sessions = rawSessions.map(mapSessionToStayCard);
    return {
      sessions,
      error: null
    };
  } catch (error) {
    console.error('Error fetching author data:', error);
    return {
      sessions: [],
      error: 'Failed to load sessions'
    };
  }
} 