import { prisma } from "@/libs/prismaDb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { SessionType, SessionCategory } from "@prisma/client";
import { revalidatePath } from 'next/cache';

// Add constant for default avatar path
const DEFAULT_AVATAR = '/images/dashboard/profile-avatar.png';

// Helper function to get session type
const getSessionType = (type: string): SessionType => {
  switch (type.toUpperCase()) {
    case 'GROUP':
      return SessionType.GROUP;
    case 'WEBINAR':
      return SessionType.WEBINAR;
    default:
      return SessionType.ONE_ON_ONE;
  }
};

// Helper function to get session category
const getSessionCategory = (category: string): SessionCategory => {
  switch (category.toUpperCase()) {
    case 'DESIGN':
      return SessionCategory.DESIGN;
    case 'DEVELOPMENT':
      return SessionCategory.DEVELOPMENT;
    case 'MARKETING':
      return SessionCategory.MARKETING;
    case 'BUSINESS':
      return SessionCategory.BUSINESS;
    default:
      return SessionCategory.OTHER;
  }
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await req.json();

    // Validate date fields first
    if (!data.sessionDate || !data.startTime) {
      return new Response(JSON.stringify({ 
        error: "Session date and start time are required" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure sessionDate and startTime are strings
    if (typeof data.sessionDate !== 'string' || typeof data.startTime !== 'string') {
      return new Response(JSON.stringify({ 
        error: "Session date and start time must be strings" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse dates with validation
    const sessionDate = new Date(data.sessionDate);
    const startTime = new Date(data.startTime);

    // Validate if dates are valid
    if (isNaN(sessionDate.getTime()) || isNaN(startTime.getTime())) {
      return new Response(JSON.stringify({ 
        error: "Invalid date format provided" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse numeric values with validation
    const minParticipants = Number(data.minParticipants);
    const maxParticipants = Number(data.maxParticipants);
    const duration = Number(data.duration);
    const price = Number(data.basePrice);

    if (
      isNaN(minParticipants) ||
      isNaN(maxParticipants) ||
      isNaN(duration) ||
      isNaN(price)
    ) {
      return new Response(JSON.stringify({ error: "Invalid numeric values" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Construct the session data object
    const expertSessionData = {
      title: data.sessionTitle,
      category: getSessionCategory(data.sessionCategory),
      expertiseLevel: data.expertiseLevel,
      sessionType: getSessionType(data.sessionType),
      minParticipants,
      maxParticipants,
      date: sessionDate,
      startTime: startTime,
      timeZone: data.timeZone,
      duration,
      price,
      description: data.description,
      expertId: session.user.id,
      tags: Array.isArray(data.tags) ? data.tags : [],
      galleryImages: data.galleryImages,
      coverImage: data.coverImage || DEFAULT_AVATAR,
      isCircleCommunity: data.isCircleCommunity || false,
    };

    const newSession = await prisma.expertSession.create({
      data: expertSessionData,
      include: {
        expert: true,
      },
    });

    revalidatePath('/listing-session');
    revalidatePath('/listing-session-detail/[sessionId]', 'page');

    return new Response(JSON.stringify({ 
      success: true,
      session: newSession 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
