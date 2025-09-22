import { SessionType } from "@prisma/client";

export interface StayCardData {
    id: string;
    featuredImage: string;
    galleryImgs: string[];
    title: string;
    href: string;
    expertId: string;
    expertName: string;
    timing: {
      sessionStart: string;
      duration: number;
    };
    saleOff: string;
    price: number;
    reviews: {
      averageRating: number;
      totalReviews: number;
    };
    categoryName: string;
    availableSpots: number;
    isCircleCommunity: boolean;
    duration: number;
    bookedSpots: number;
    maxParticipants: number;
    date: string;
    time: string;
    sessionType: SessionType;
} 