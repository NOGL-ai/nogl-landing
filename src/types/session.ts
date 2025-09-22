export type DateString = string;

export interface Expert {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  createdAt: DateString;
  expertise?: string[];
  rating?: number;
  totalSessions?: number;
}

export interface Pricing {
  standardPrice: number;
  currency: string;
  discountedPrice?: number;
  groupDiscountPrice?: number;
  earlyBirdDiscount?: number;
  cancellationRefund: number;
  accessDuration: number;
}

export interface FeaturedReview {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  rating: number;
  comment: string;
  createdAt: DateString;
}

export interface Review {
  averageRating: number;
  totalReviews: number;
  featuredReview?: FeaturedReview;
}

export interface Timing {
  sessionStart: string;
  sessionEnd: string;
  loginTime: string;
  breakTime: string;
}

export interface Preparation {
  materials: string[];
  requirements?: string[];
  prerequisites?: string[];
}

export interface Benefit {
  id: string;
  name: string;
  icon: string;
}

import { SessionCategory, SessionType } from "@prisma/client";

export interface SessionWithExpert {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  galleryImages?: string[];
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  type: SessionType;
  sessionType: string;
  category: SessionCategory;
  price: number;
  currency: string;
  duration: number;
  maxParticipants: number;
  minParticipants: number;
  language: string;
  expertiseLevel: string;
  prerequisites: string[];
  expert: Expert;
  pricing: {
    standardPrice: number;
    groupDiscountPrice: number;
    earlyBirdDiscount: number;
    cancellationRefund: string;
    accessDuration: string;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    featuredReview: any | null;
  };
  benefits: {
    id: string;
    name: string;
    icon: string;
  }[];
  preparation: {
    materials: string[];
    requirements: string[];
  };
  specialNotes: string[];
  timing: {
    sessionStart: string;
    sessionEnd: string;
    loginTime: string;
    breakTime: string;
  };
  bookedSpots: number;
  availableSpots: number;
  status: string;
  isCircleCommunity?: boolean;
  createdAt: DateString;
  updatedAt: DateString;
}

export interface SessionDataType {
  id: string;
  title: string;
  featuredImage: string;
  galleryImgs?: string[];
  href: string;
  
  // Expert related fields
  expertId: string;
  expertName: string;
  expert?: {
    id: string;
    name: string;
    image: string;
    bio?: string;
    createdAt: string;
    totalSessions?: number;
  };

  // Time related fields
  date: string | Date;
  time: string;
  startTime: string | Date;
  sessionDuration: string;
  duration: number;
  timeZone: string;

  // Pricing related fields
  price: number;
  saleOff?: string;
  pricing: {
    standardPrice: number;
    groupDiscountPrice?: number;
    earlyBirdDiscount?: number;
    cancellationRefund?: string;
    accessDuration?: string;
  };

  // Capacity related fields
  spotsAvailable: number;
  spotsBooked: number;
  minParticipants: number;
  maxParticipants: number;

  // Category and type
  category: string;
  sessionType: string;
  expertiseLevel?: string;
  isCircleCommunity?: boolean;

  // Reviews
  ratings?: number;
  reviewCount?: number;
  reviews: {
    averageRating: number;
    totalReviews: number;
    featuredReview?: {
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
      user: {
        name: string;
        avatar: string;
      };
    };
  };

  // Additional details
  description: string;
  benefits: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  preparation?: {
    materials?: string[];
  };
  specialNotes?: string[];
} 