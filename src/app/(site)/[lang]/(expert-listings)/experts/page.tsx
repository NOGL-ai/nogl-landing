import React from "react";
import SectionGridFilterCard from "../SectionGridFilterCard";
import { ExpertDataType } from "@/data/types";
import { Route } from "@/routers/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const R2_BUCKET_URL = 'https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev';

export const revalidate = 0;

export default async function ExpertsListingPage() {
  let processedExperts: ExpertDataType[] = [];
  let errorMessage = "";

  try {
    const rawExperts = await prisma.user.findMany({
      where: {
        role: 'EXPERT',
      }
    });
    
    processedExperts = rawExperts.map((expert: any) => ({
      id: expert.id,
      authorId: Number(expert.id),
      authorName: expert.name || 'Unknown Expert',
      hostBio: expert.bio || '',
      listingCategoryId: 1,
      categoryName: expert.expertCategories?.[0] || 'General',
      title: expert.name || 'Expert Profile',
      subtitle: expert.expertise?.join(', ') || '',
      featuredImage: expert.image 
        ? `${expert.image}`
        : `${R2_BUCKET_URL}/default-expert.jpg`,
      galleryImgs: [],
      reviewStart: expert.rating || 0,
      reviewCount: expert.totalSessions || 0,
      currentGuests: expert.totalSessions || 0,
      sessionType: 'Expert Sessions',
      prerequisites: expert.expertise?.join(', ') || '',
      like: false,
      tags: expert.expertise || [],
      language: expert.languages?.[0] || 'English',
      languages: expert.languages || ['English'],
      expertise: expert.expertise || [],
      rating: expert.rating || 0,
      totalSessions: expert.totalSessions || 0,
      isVerifiedExpert: expert.isVerifiedExpert || false,
      isBookmarked: false,
      sharedCount: 0,
      sessionSummary: expert.bio || '',
      maxViewers: 0,
      recordedSession: false,
      accessAfterEvent: '',
      bookingStatus: '',
      additionalResources: [],
      eventLink: '',
      contactSupport: '',
      href: `/expert/${expert.id}` as Route<string>,
      sessions: []
    }));

  } catch (error) {
    console.error('Error in ExpertsListingPage:', error);
    errorMessage = "Unable to load experts at this time. Please try again later.";
  }

  return (
    <SectionGridFilterCard 
      initialData={processedExperts}
      errorMessage={errorMessage}
      className="container pb-24 lg:pb-28" 
    />
  );
}
