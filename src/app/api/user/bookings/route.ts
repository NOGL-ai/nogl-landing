export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from "../../../../libs/prismaDb";

interface FormattedBooking {
  id: string;
  sessionId: string;
  title: string;
  date: Date | undefined;
  startTime: Date | undefined;
  duration: number;
  timeZone: string;
  price: number;
  originalPrice: number;
  discountAmount: number | null;
  featuredImage: string;
  galleryImgs: string[];
  expert: {
    id: string;
    name: string;
    image: string;
    role: string;
    bio: string;
    expertise: string[];
  };
  timing: {
    sessionStart: string;
    duration: number;
  };
  description: string;
  category: string;
  language: string;
  status: string;
  paymentStatus: string;
  joinUrl: string | null;
  numParticipants: number;
  maxParticipants: number;
  availableSpots: number;
  bookedSpots: number;
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
  isCircleCommunity: boolean;
  href: string;
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userBookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: 'CONFIRMED',
      },
      select: {
        id: true,
        expertSessionId: true,
        status: true,
        total: true,
        originalPrice: true,
        discountAmount: true,
        paymentStatus: true,
        joinUrl: true,
        numParticipants: true
      }
    });

    const sessionIds = userBookings.map(booking => booking.expertSessionId);

    const expertSessions = await prisma.expertSession.findMany({
      where: {
        id: {
          in: sessionIds
        }
      },
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        duration: true,
        timeZone: true,
        coverImage: true,
        galleryImages: true,
        expertId: true,
        description: true,
        category: true,
        language: true,
        price: true,
        maxParticipants: true,
        availableSpots: true,
        bookedSpots: true,
        averageRating: true,
        totalReviews: true,
        isCircleCommunity: true,
        expert: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            bio: true,
            expertise: true
          }
        }
      }
    });

    const sessionMap = new Map(expertSessions.map(session => [session.id, session]));

    const formattedBookings: FormattedBooking[] = userBookings.map(booking => {
      const session = sessionMap.get(booking.expertSessionId);
      return {
        id: booking.id,
        sessionId: booking.expertSessionId,
        title: session?.title || '',
        date: session?.date,
        startTime: session?.startTime,
        duration: session?.duration || 0,
        timeZone: session?.timeZone || 'UTC',
        price: booking.total,
        originalPrice: booking.originalPrice,
        discountAmount: booking.discountAmount,
        featuredImage: session?.coverImage || '/images/default-session.jpg',
        galleryImgs: session?.galleryImages?.length ? session.galleryImages : ['/images/default-session.jpg'],
        expert: {
          id: session?.expert?.id || '',
          name: session?.expert?.name || 'Expert',
          image: session?.expert?.image || '/images/default-expert.jpg',
          role: session?.expert?.role || 'Expert',
          bio: session?.expert?.bio || '',
          expertise: session?.expert?.expertise || []
        },
        timing: {
          sessionStart: session?.startTime?.toISOString() || new Date().toISOString(),
          duration: session?.duration || 0
        },
        description: session?.description || '',
        category: session?.category || '',
        language: session?.language || 'English',
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        joinUrl: `/vc/${booking.expertSessionId}`,
        numParticipants: booking.numParticipants,
        maxParticipants: session?.maxParticipants || 1,
        availableSpots: session?.availableSpots || 0,
        bookedSpots: session?.bookedSpots || 0,
        reviews: {
          averageRating: session?.averageRating || 0,
          totalReviews: session?.totalReviews || 0
        },
        isCircleCommunity: session?.isCircleCommunity || false,
        href: `/listing-session-detail/${booking.expertSessionId}`
      };
    });

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 