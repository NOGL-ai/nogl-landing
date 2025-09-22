// File: client-components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StartRating from '@/components/StartRating';
import ParticipantsInput from './ParticipantsInput';
import ButtonPrimary from '@/shared/ButtonPrimary';
import { MinusIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SessionWithExpert } from '@/types/session'; // Import your session type
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  session: SessionWithExpert & {
    date: string | Date;      // Accept both string and Date
    startTime: string; // e.g., "1970-01-01T10:00:00.000Z"
    timeZone: string;
  };
  participants: number;
  includeRecording: boolean;
  recordingCount: number;
  handleParticipantsChange: (value: number) => void;
  handleRecordingChange: (checked: boolean) => void;
  handleRecordingCountChange: (value: number) => void;
  total: number;
  basePrice: number;
  handleBookNow: () => void;
  isBooked?: boolean;
  bookingDetails?: {
    numParticipants: number;
    includeRecording: boolean;
    recordingCount: number;
    totalPaid: number;
    status: string;
  };
}

const getSessionState = (startTime: string, date: string | Date, timeZone: string): 'UPCOMING' | 'READY_TO_JOIN' | 'PAST' => {
  const now = new Date();
  
  // Convert date to Date object if it's a string
  const sessionDate = typeof date === 'string' ? new Date(date) : date;
  const timeDate = new Date(startTime);

  // Create a new date at the correct time in UTC
  const sessionStart = new Date(
    Date.UTC(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(),
      10, // 10:00 CET = 09:00 UTC
      0,
      0
    )
  );

  console.log({
    now: now.toISOString(),
    browserTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sessionTimeZone: timeZone,
    sessionStart: sessionStart.toISOString(),
    sessionStartLocal: new Date(sessionStart).toLocaleString('en-US', { 
      timeZone: 'Europe/Paris',
      hour12: false 
    }),
    rawDate: sessionDate.toISOString(),
    rawStartTime: timeDate.toISOString(),
    timeComponents: {
      hours: timeDate.getUTCHours(),
      minutes: timeDate.getUTCMinutes()
    }
  });

  const thirtyMinutesBefore = new Date(sessionStart.getTime() - 30 * 60000);
  const sessionEnd = new Date(sessionStart.getTime() + (60 * 60000));

  if (now < sessionStart) {
    return 'UPCOMING';
  } else if (now >= thirtyMinutesBefore && now <= sessionEnd) {
    return 'READY_TO_JOIN';
  } else {
    return 'PAST';
  }
};

const Sidebar: React.FC<SidebarProps> = ({
  session,
  participants,
  includeRecording,
  recordingCount,
  handleParticipantsChange,
  handleRecordingChange,
  handleRecordingCountChange,
  total,
  basePrice,
  handleBookNow,
  isBooked,
  bookingDetails,
}) => {
  const router = useRouter();
  const recordingPrice = 20; // Adjust as needed
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [sessionState, setSessionState] = useState(
    getSessionState(session.startTime, session.date, session.timeZone)
  );

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setSessionState(getSessionState(session.startTime, session.date, session.timeZone));
      
      // Convert to UTC
      const sessionDate = typeof session.date === 'string' ? new Date(session.date) : session.date;
      const sessionTime = new Date(session.startTime);
      
      // Create session start time in UTC
      const sessionStart = new Date(Date.UTC(
        sessionDate.getUTCFullYear(),
        sessionDate.getUTCMonth(),
        sessionDate.getUTCDate(),
        sessionTime.getUTCHours(),
        sessionTime.getUTCMinutes()
      ));

      const diff = sessionStart.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeRemaining({
          days,
          hours,
          minutes
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [session]);

  const renderActionButton = () => {
    switch (sessionState) {
      case 'PAST':
        return (
          <ButtonPrimary disabled className="w-full opacity-50">
            Session Ended
          </ButtonPrimary>
        );
      case 'READY_TO_JOIN':
        return (
          <ButtonPrimary 
            onClick={() => window.open(`/vc/${session.id}`, '_blank')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Join Session Now
          </ButtonPrimary>
        );
      default:
        return isBooked ? null : (
          <ButtonPrimary onClick={handleBookNow} className="w-full">
            Book Now
          </ButtonPrimary>
        );
    }
  };

  return (
    <div className="listingSectionSidebar__wrap shadow-xl rounded-2xl p-4 sm:p-6 bg-white dark:bg-neutral-900">
      {/* PRICE */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <span className="text-3xl font-semibold">€{basePrice}</span>
          <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
            /session
          </span>
          <div className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {session.duration} {session.duration === 1 ? 'hour' : 'hours'} session
          </div>
        </div>
        {session.reviews?.totalReviews > 0 ? (
          <StartRating rating={session.reviews.averageRating || 0} />
        ) : (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            No ratings yet
          </span>
        )}
      </div>

      {/* FORM */}
      {isBooked ? (
        <div className="space-y-4">
          {/* Booking Status Banner */}
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">
                Booking Confirmed
              </span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between text-sm">
              <span>Participants</span>
              <span className="font-medium">{bookingDetails?.numParticipants}</span>
            </div>
            {bookingDetails?.includeRecording && (
              <div className="flex justify-between text-sm">
                <span>Recording Access</span>
                <span className="font-medium">{bookingDetails?.recordingCount}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between font-medium">
                <span>Total Paid</span>
                <span>€{bookingDetails?.totalPaid}</span>
              </div>
            </div>
          </div>

          {/* Added Session starts in text */}
          <div className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Session starts in
          </div>

          <div className="countdown-timer">
            <div className="grid grid-cols-3 gap-2 text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {timeRemaining.days}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Days
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {timeRemaining.hours}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Hours
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {timeRemaining.minutes}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form className="flex flex-col space-y-2">
          {/* Participants Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Number of Participants
            </label>
            <ParticipantsInput
              value={participants}
              onChange={handleParticipantsChange}
              placeholder="Select participants"
              className="flex-1"
            />
          </div>

          {/* Add-ons Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-800 dark:text-neutral-200">
              Add-ons
              <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                (Coming Soon)
              </span>
            </h4>

            {/* Recording Option */}
            <div className="p-4 rounded-xl bg-neutral-800 space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeRecording"
                  checked={includeRecording}
                  onChange={(e) => handleRecordingChange(e.target.checked)}
                  className="h-5 w-5 rounded bg-blue-500 border-transparent text-blue-500 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                  <label
                    htmlFor="includeRecording"
                    className="text-sm font-medium text-white"
                  >
                    Session Recording
                  </label>
                  <span className="text-sm text-neutral-400">
                    €{recordingPrice} per recording
                  </span>
                </div>
              </div>

              {/* Recording Count Input */}
              {includeRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Recordings</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRecordingCountChange(recordingCount - 1)}
                        disabled={recordingCount <= 1}
                        className="rounded-full w-8 h-8 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 transition-colors"
                      >
                        <MinusIcon className="h-4 w-4 text-white" />
                      </button>
                      <span className="text-white w-4 text-center">
                        {recordingCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRecordingCountChange(recordingCount + 1)}
                        disabled={recordingCount >= participants}
                        className="rounded-full w-8 h-8 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  {recordingCount === participants && (
                    <span className="text-xs text-neutral-400">
                      Maximum number of recordings reached
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Base Price (€{basePrice} × {participants}{' '}
                {participants === 1 ? 'participant' : 'participants'})
              </span>
              <span className="font-medium">€{basePrice * participants}</span>
            </div>
            {includeRecording && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Recording (€{recordingPrice} × {recordingCount}{' '}
                  {recordingCount === 1 ? 'access' : 'accesses'})
                </span>
                <span className="font-medium">
                  €{recordingPrice * recordingCount}
                </span>
              </div>
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{total}</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUBMIT */}
      <div className="mt-6">
        {renderActionButton()}
        {sessionState === 'UPCOMING' && !isBooked && (
          <p className="mt-3 text-xs text-center text-neutral-500 dark:text-neutral-400">
            You won't be charged yet
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
