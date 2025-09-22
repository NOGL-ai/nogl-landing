'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionContext } from '@/app/context/SessionContext';
import {
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { SessionWithExpert } from "@/types/session";

// Components
import CommentListing from '@/components/CommentListing';
import StartRating from '@/components/StartRating';
import Avatar from '@/shared/Avatar';
import Badge from '@/shared/Badge';
import ButtonSecondary from '@/shared/ButtonSecondary';
import Input from '@/shared/Input';
import ButtonCircle from '@/shared/ButtonCircle';
import SectionDateRange from './SectionDateRange';
import LikeSaveBtns from '@/components/LikeSaveBtns';
import ShareModal from '@/components/ShareModal';
import MobileFooterSticky from './MobileFooterSticky'
import ImageGalleryGrid from './ImageGalleryGrid';
import Sidebar from './Sidebar';
import BenefitsModal from './BenefitsModal';
import SessionSkeleton from './SessionSkeleton';
import Image from 'next/image';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''; // Will be empty in development

interface SessionDetailProps {
    session: SessionWithExpert;
    isBooked?: boolean;
    bookingDetails?: {
        numParticipants: number;
        includeRecording: boolean;
        recordingCount: number;
        totalPaid: number;
        status: string;
        paymentStatus: string;
    };
}

const SessionDetail: FC<SessionDetailProps> = ({ 
    session, 
    isBooked, 
    bookingDetails 
}) => {
  const router = useRouter();

  // States
  const [participants, setParticipants] = useState(1);
  const [includeRecording, setIncludeRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Add null check before accessing session data
  if (!session || !session.id) {
    return (
      <div className="text-center text-red-500 p-8">
        Session not found. Please try again later.
      </div>
    );
  }

  // Handlers
  const handleParticipantsChange = (value: number) => {
    setParticipants(value);
    if (recordingCount > value) {
      setRecordingCount(value);
    }
  };

  const handleRecordingChange = (checked: boolean) => {
    setIncludeRecording(checked);
    if (!checked) {
      setRecordingCount(1);
    }
  };

  const handleRecordingCountChange = (value: number) => {
    if (value >= 1 && value <= participants) {
      setRecordingCount(value);
    }
  };
  // Calculate total price
  const basePrice = session.pricing.standardPrice || 0;
  const recordingPrice = 20; // You can adjust this or fetch from session data
  const total =
    participants * basePrice +
    (includeRecording ? recordingCount * recordingPrice : 0);

  // Handle Booking
  const handleBookNow = () => {
    try {
      const sessionDate = typeof session.date === 'string' ? new Date(session.date) : session.date;
      const sessionTime = new Date(session.startTime);
      
      // Create date in session's timezone (CET = UTC+1)
      const sessionStart = new Date(
        Date.UTC(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate(),
          9, // 10:00 CET = 09:00 UTC
          0,
          0
        )
      );

      const bookingData = {
        sessionId: session.id,
        title: session.title,
        date: sessionStart.toISOString(),
        timeZone: session.timeZone,
        duration: session.duration,
        expert: {
          name: session.expert.name,
          image: session.expert.image,
        },
        pricing: {
          basePrice: basePrice,
          recordingPrice: 20,
        },
        participants: participants,
        includeRecording: includeRecording,
        recordingCount: recordingCount,
        total: total,
        rating: session.reviews ? {
          average: session.reviews.averageRating,
          count: session.reviews.totalReviews,
        } : undefined
      };

      // Save to sessionStorage
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
      
      // Redirect to checkout with sessionId
      router.push(`/checkout?sessionId=${session.id}`);
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <>
      <SessionContext.Provider
        value={{
          session,
          total,
          basePrice: session?.pricing.standardPrice || 0,
          participants,
          handleBookNow
        }}
      >
        <div className="nc-SessionDetail pb-12 lg:pb-0">
          {/* HEADER */}
          <header className="rounded-md sm:rounded-xl">
            <ImageGalleryGrid session={session} />
          </header>

          {/* MAIN */}
          <main className="relative z-10 mt-4 sm:mt-11 flex flex-col lg:flex-row">
            {/* CONTENT */}
            <div className="w-full space-y-4 sm:space-y-8 lg:w-3/5 lg:pr-10 xl:w-2/3">
              {renderSection1(session)}
              {renderSection2(session)}
              {renderSection3(session)}
              {renderSection4(session)}
              <SectionDateRange session={session} />
              {renderSection5(session)}
              {renderSection6(session)}
              {renderSection8(session)}
            </div>

             {/* SIDEBAR */}
             <div className="mt-14 hidden flex-grow lg:mt-0 lg:block">
              <div className="sticky top-28">
              <Sidebar
                session={session}
                participants={bookingDetails?.numParticipants || 1}
                includeRecording={bookingDetails?.includeRecording || false}
                recordingCount={bookingDetails?.recordingCount || 0}
                handleParticipantsChange={handleParticipantsChange}
                handleRecordingChange={handleRecordingChange}
                handleRecordingCountChange={handleRecordingCountChange}
                total={bookingDetails?.totalPaid || basePrice}
                basePrice={basePrice}
                handleBookNow={handleBookNow}
                isBooked={isBooked}
                bookingDetails={bookingDetails}
                />

              </div>
            </div>
          </main>

          {/* Share Modal */}
          <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            session={session}
          />

          {/* STICKY FOOTER MOBILE */}
          <div className="fixed inset-x-0 bottom-0 z-40 block lg:hidden">
            <MobileFooterSticky 
              session={session}
              total={total}
              basePrice={basePrice}
              participants={participants}
              handleBookNow={handleBookNow}
            />
          </div>
        </div>
      </SessionContext.Provider>
    </>
  );

  // Render functions
  function renderSection1(session: SessionWithExpert) {
    const hasReviews = session.reviews.totalReviews > 0;
    const bookedParticipants = session.bookedSpots || 0;
    const availableSpots = session.availableSpots || session.maxParticipants - bookedParticipants;

    // Format date and time
    const formatDateTime = (date: string | Date, time: string | Date) => {
      try {
        const sessionDate = typeof date === 'string' ? new Date(date) : date;
        const timeDate = new Date(time);
        
        // Create the session start time in UTC
        const sessionStart = new Date(
          Date.UTC(
            sessionDate.getFullYear(),
            sessionDate.getMonth(),
            sessionDate.getDate(),
            timeDate.getUTCHours(), // Use the UTC hours from the time
            timeDate.getUTCMinutes(),
            0
          )
        );

        const mobileDate = sessionDate.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
        });

        const desktopDate = sessionDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        // Get the original hours and minutes from the startTime
        const hours = timeDate.getUTCHours();
        const minutes = timeDate.getUTCMinutes();
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        return {
          mobileDate,
          desktopDate,
          time: `${formattedTime} ${session.timeZone}`
        };
      } catch (error) {
        console.error('Error formatting date/time:', error);
        return { 
          mobileDate: 'TBD',
          desktopDate: 'Date TBD',
          time: 'Time TBD'
        };
      }
    };

    const { mobileDate, desktopDate, time } = formatDateTime(session.date, session.startTime);

    return (
      <div className="listingSection__wrap space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          {/* Badges and Actions Row */}
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Badge name={session.category} />
              {session.isCircleCommunity && (
                <Badge name="Circle" color="green" />
              )}
              <Badge name={session.sessionType} />
            </div>
            <div className="flex items-center gap-2">
              <LikeSaveBtns 
                onShare={() => setIsShareModalOpen(true)} 
              />
            </div>
          </div>

          {/* Session Title */}
          <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
            {session.title}
          </h1>

          {/* Rating and DateTime Row */}
          <div className="flex flex-row items-center justify-between text-sm sm:text-base">
            <div className="flex items-center flex-1">
              {hasReviews ? (
                <StartRating
                  rating={session.reviews.averageRating || 0}
                  reviewCount={session.reviews.totalReviews}
                />
              ) : (
                <span className="text-neutral-500 dark:text-neutral-400">
                  No ratings yet
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-center flex-1">
              <i className="las la-calendar-alt text-neutral-500 text-lg mr-1"></i>
              <span className="hidden sm:inline">{desktopDate}</span>
              <span className="sm:hidden">{mobileDate}</span>
            </div>
            
            <div className="flex items-center justify-end flex-1">
              <i className="las la-clock text-neutral-500 text-lg mr-1"></i>
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Expert Info */}
        <div className="flex items-center mt-4">
          <Avatar
            hasChecked
            sizeClass="h-10 w-10"
            radius="rounded-full"
            imgUrl={session.expert.image || '/images/default-avatar.png'}
          />
          <span className="ml-2.5 text-neutral-500 dark:text-neutral-400">
            Led by{' '}
            <span className="font-medium text-neutral-900 dark:text-neutral-200">
              {session.expert.name}
            </span>
          </span>
        </div>

        {/* Divider */}
        <hr className="border-neutral-200 dark:border-neutral-700" />

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-neutral-700 dark:text-neutral-300">
          {/* Already Booked */}
          <div className="flex items-center space-x-2">
            <i className="las la-user-check text-xl"></i>
            <span>Already Booked: {bookedParticipants}</span>
          </div>
          {/* Available Spots */}
          <div className="flex items-center space-x-2">
            <i className="las la-user-plus text-xl"></i>
            <span>Available Spots: {availableSpots}</span>
          </div>
          {/* Min Participants */}
          <div className="flex items-center space-x-2">
            <i className="las la-user-friends text-xl"></i>
            <span>Min Participants: {session.minParticipants}</span>
          </div>
          {/* Max Participants */}
          <div className="flex items-center space-x-2">
            <i className="las la-users text-xl"></i>
            <span>Max Participants: {session.maxParticipants}</span>
          </div>
          {/* Duration */}
          <div className="flex items-center space-x-2">
            <i className="las la-clock text-xl"></i>
            <span>Duration: {session.duration} {session.duration === 1 ? 'hour' : 'hours'}</span>
          </div>
          {/* Level */}
          <div className="flex items-center space-x-2">
            <i className="las la-signal text-xl"></i>
            <span>Level: {session.expertiseLevel}</span>
          </div>
        </div>
      </div>
    );
  }

  function renderSection2(session: SessionWithExpert) {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Session Information</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="text-neutral-6000 dark:text-neutral-300">
          <span
            dangerouslySetInnerHTML={{ __html: session.description }}
          ></span>
        </div>
      </div>
    );
  }

  function renderSection3(session: SessionWithExpert) {
    return (
      <div className="listingSection__wrap">
        <div>
          <h2 className="text-2xl font-semibold">Benefits</h2>
          <span className="mt-2 block text-neutral-500 dark:text-neutral-400">
            What this session offers
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* Display Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-neutral-300">
          {session.benefits.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <i className={`las text-2xl sm:text-3xl ${item.icon}`}></i>
              <span className="text-xs sm:text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        {/* <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div> */}
        
        {/* Replace modal with BenefitsModal component */}
        <BenefitsModal session={session} />
      </div>
    );
  }

  function renderSection4(session: SessionWithExpert) {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Session Pricing</h2>
        <span className="mt-1 block text-neutral-500 dark:text-neutral-400">
          Prices may vary based on group size or special offers
        </span>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* Pricing Details */}
        <div className="flow-root">
          <div className="-mb-4 text-sm text-neutral-6000 dark:text-neutral-300 sm:text-base">
            <div className="flex items-center justify-between space-x-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
              <span>Standard Session</span>
              <span>€{session.pricing.standardPrice}</span>
            </div>
            <div className="flex items-center justify-between space-x-4 rounded-lg p-4">
              <span>Group Discount (5+ attendees)</span>
              <span>€{session.pricing.groupDiscountPrice}</span>
            </div>
            <div className="flex items-center justify-between space-x-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
              <span>Early Bird Discount (Comming Soon)</span>
              <span>-{session.pricing.earlyBirdDiscount}% off</span>
            </div>
            <div className="flex items-center justify-between space-x-4 rounded-lg p-4">
              <span>Cancellation Policy</span>
              <span>{session.pricing.cancellationRefund}</span>
            </div>
            <div className="flex items-center justify-between space-x-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
              <span>Access After Event</span>
              <span>Available for {session.pricing.accessDuration}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSection5(session: SessionWithExpert) {
    const hasReviews = session.reviews.totalReviews > 0;
    
    // Format the expert's join date
    const formatJoinDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Recently joined';
        }
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      } catch {
        return 'Recently joined';
      }
    };

    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Meet Your Expert</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* Expert Details */}
        <div className="flex items-center space-x-4 mt-4">
          <Avatar
            hasChecked
            hasCheckedClass="w-4 h-4 -top-0.5 right-0.5"
            sizeClass="h-14 w-14"
            radius="rounded-full"
            imgUrl={session.expert.image || '/images/default-avatar.png'}
          />
          <div>
            <a
              className="block text-xl font-medium hover:text-primary-500 transition-colors"
              href={`/author/${session.expert.id}`}
            >
              {session.expert.name}
            </a>
            <div className="mt-1.5 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
              {hasReviews ? (
                <StartRating rating={session.reviews.averageRating || 0} />
              ) : (
                <span>No ratings yet</span>
              )}
              <span className="mx-2">·</span>
              {(session.expert.totalSessions ?? 0) > 0 ? (
                <span>{session.expert.totalSessions} sessions conducted</span>
              ) : (
                <span>New expert</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {session.expert.bio}
        </p>

        {/* Additional Information */}
        <div className="mt-4 space-y-3 text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center space-x-3">
            <i className="las la-calendar text-primary-500 text-xl"></i>
            <span>
                    Expert since {formatJoinDate(session.expert.createdAt)}
            </span>
          </div>
          {hasReviews ? (
            <div className="flex items-center space-x-3">
              <i className="las la-star text-primary-500 text-xl"></i>
              <span>
                Average session rating - {session.reviews.averageRating?.toFixed(1)}/5
              </span>
            </div>
          ) : null}
          <div className="flex items-center space-x-3">
            <i className="las la-clock text-primary-500 text-xl"></i>
            <span>Fast response - within a few hours</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 mt-6"></div>
        <div className="mt-4">
          <ButtonSecondary
            // href={`/author/${session.expert.id}`}
            href={`/author`}
            className="hover:bg-primary-500 hover:text-white transition"
          >
            View Full Profile
          </ButtonSecondary>
        </div>
      </div>
    );
  }

  function renderSection6(session: SessionWithExpert) {
    const hasReviews = session.reviews.totalReviews > 0;

    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">
          {hasReviews 
            ? `Reviews (${session.reviews.totalReviews} reviews)`
            : "Reviews"
          }
        </h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* Content */}
        <div className="space-y-5">
          {hasReviews ? (
            <>
              <StartRating rating={session.reviews.averageRating || 0} />
              <div className="relative">
                <Input
                  fontClass=""
                  sizeClass="h-16 px-4 py-3"
                  rounded="rounded-3xl"
                  placeholder="Share your feedback about this session..."
                  disabled
                />
                <ButtonCircle
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform"
                  size="w-12 h-12"
                  disabled
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </ButtonCircle>
              </div>
            </>
          ) : (
            <div className="text-neutral-500 dark:text-neutral-400">
              No ratings yet
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {session.reviews.featuredReview ? (
            <CommentListing
              key={session.reviews.featuredReview.id}
              className="py-8"
              user={session.reviews.featuredReview.user}
              rating={session.reviews.featuredReview.rating}
              comment={session.reviews.featuredReview.comment}
              date={new Date(session.reviews.featuredReview.createdAt).toLocaleDateString()}
            />
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400 py-8">
              {hasReviews ? "Reviews Coming Soon" : "Be the first to review this session"}
            </p>
          )}
        </div>
      </div>
    );
  }

  function renderSection8(session: SessionWithExpert) {
    const FALLBACK_SPECIAL_NOTES = [
      "Active participation is encouraged during the Q&A and breakout sessions.",
      "This session will be recorded and available for 14 days after the session.",
      "All materials and recordings will be available on the event platform for 7 days after the session.",
      "Maintain professional and respectful communication throughout the session.",
    ];

    const formatTime = (date: string | Date) => {
      try {
        const timeDate = new Date(date);
        return timeDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: session.timeZone
        });
      } catch (error) {
        console.error('Error formatting time:', error);
        return 'TBD';
      }
    };

    // Calculate end time by adding duration to start time
    const getEndTime = (startTime: string | Date, durationHours: number) => {
      try {
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + durationHours);
        return formatTime(endTime);
      } catch (error) {
        console.error('Error calculating end time:', error);
        return 'TBD';
      }
    };

    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Things to Know</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* Cancellation Policy */}
        <div>
          <h4 className="text-lg font-semibold">Cancellation Policy</h4>
          <span className="mt-3 block text-neutral-500 dark:text-neutral-400">
            Full refund available if canceled within 48 hours of booking and at least 7 days
            before the session. No refunds will be issued for cancellations made within 3
            days of the session. Registrations can be transferred to another participant up
            to 48 hours before the session.
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* Session Timing */}
        <div>
          <h2 className="text-2xl font-semibold">Session Timing</h2>
          <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

          {/* Timing Details */}
          <div className="flow-root">
            <div className="-mb-4 text-sm text-neutral-6000 dark:text-neutral-300 sm:text-base">
              <div className="flex items-center justify-between space-x-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
                <span>Session Start</span>
                <span>{formatTime(session.startTime)} {session.timeZone}</span>
              </div>
              
              <div className="flex items-center justify-between space-x-4 rounded-lg p-4">
                <span>Session End</span>
                <span>{getEndTime(session.startTime, session.duration)} {session.timeZone}</span>
              </div>
              
              <div className="flex items-center justify-between space-x-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
                <span>Log In</span>
                <span className="text-right">
                  Please log in<br className="sm:hidden" /> 15 minutes before<br className="sm:hidden" /> start time
                </span>
              </div>
              
              <div className="flex items-center justify-between space-x-4 rounded-lg p-4">
                <span>Break</span>
                <span className="text-right">
                  15 minutes at<br className="sm:hidden" /> the midway<br className="sm:hidden" /> point
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* Materials and Preparation */}
        <div>
          <h4 className="text-lg font-semibold">Materials and Preparation</h4>
          <span className="mt-3 block text-neutral-500 dark:text-neutral-400">
            {session.preparation?.materials?.join('. ') || 
              'Please ensure you have a stable internet connection, functioning microphone, and headphones or speakers. A quiet environment is recommended for the best learning experience.'
            }
          </span>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* Special Notes */}
        <div>
          <h4 className="text-lg font-semibold">Special Notes</h4>
          <div className="prose sm:prose">
            <ul className="mt-3 space-y-2 text-neutral-500 dark:text-neutral-400">
              {(session.specialNotes?.length ? session.specialNotes : FALLBACK_SPECIAL_NOTES).map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />

        {/* Support and Contact Information */}
        <div>
          <h4 className="text-lg font-semibold">Support and Contact Information</h4>
          <span className="mt-3 block text-neutral-500 dark:text-neutral-400">
            If you experience technical difficulties, please contact info@nogl.tech.
          </span>
        </div>
      </div>
    );
  }
};

export default SessionDetail;
