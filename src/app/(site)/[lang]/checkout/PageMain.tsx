"use client";

import React, { FC, useState, useEffect } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ParticipantsInput from "./ParticipantsInput";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import StartRating from "@/components/StartRating";
import Avatar from "@/shared/Avatar";
import Input from "@/shared/Input";
import { toast } from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

export interface CheckOutPagePageMainProps {
  className?: string;
}

interface BookingData {
  sessionId: string;
  title: string;
  date: string;
  duration: number;
  expert: {
    name: string;
    image: string;
  };
  pricing: {
    basePrice: number;
    recordingPrice: number;
  };
  participants: number;
  includeRecording: boolean;
  recordingCount: number;
  total: number;
  rating?: {
    average: number;
    count: number;
  };
}

const CheckOutPagePageMain: FC<CheckOutPagePageMainProps> = ({ className = "" }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [participantEmails, setParticipantEmails] = useState<string[]>([]);
  const [includeRecording, setIncludeRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(1);
  const [participants, setParticipants] = useState(1);
  const [billingAddressChecked, setBillingAddressChecked] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [termsError, setTermsError] = useState<string>('');

  const userEmail = session?.user?.email || "";

  // Load session data from sessionStorage
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      router.push(`/listing-session-detail/${sessionId}`);
      return;
    }

    const loadSessionData = () => {
      try {
        // Get data from sessionStorage
        const storedData = sessionStorage.getItem('bookingData');
        if (!storedData) {
          throw new Error('No booking data found');
        }

        const bookingData = JSON.parse(storedData);
        
        // Update all state
        setBookingData(bookingData);
        setParticipants(bookingData.participants);
        setIncludeRecording(bookingData.includeRecording);
        setRecordingCount(bookingData.recordingCount);

      } catch (error) {
        console.error('Error loading session:', error);
        toast.error('Error loading session details');
        // Update the fallback route to include the session ID
        router.push(`/listing-session-detail/${sessionId}`);
      }
    };

    loadSessionData();
  }, [searchParams, router]);

  // Update participant emails initialization
  useEffect(() => {
    if (participants && userEmail) {
      const emails = Array(participants).fill("");
      if (userEmail) {
        emails[0] = userEmail;
      }
      setParticipantEmails(emails);
    }
  }, [participants, userEmail]);

  if (!bookingData) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Handle participant email changes
  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...participantEmails];
    updatedEmails[index] = value;
    setParticipantEmails(updatedEmails);
    
    // Clear error for this field
    const newErrors = [...emailErrors];
    newErrors[index] = '';
    setEmailErrors(newErrors);
  };

  // Handle discount code application
  const applyDiscountCode = () => {
    setLoading(true);
    setTimeout(() => { // Simulating API call
      if (discountCode.toUpperCase() === 'SAVE10') {
        setDiscountApplied(true);
        setSuccessMessage('Discount successfully applied!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Invalid or expired discount code.');
      }
      setLoading(false);
    }, 500);
  };

  // Handle recording count change
  const handleRecordingCountChange = (newCount: number) => {
    if (newCount < 1) return;
    if (newCount > participants) return;
    setRecordingCount(newCount);
  };

  // Remove the hardcoded price calculations
  const basePrice = bookingData?.pricing.basePrice || 0;
  const recordingPrice = bookingData?.pricing.recordingPrice || 0;
  let totalPrice = bookingData?.total || 0;

  // Update total when discount is applied
  if (discountApplied) {
    totalPrice *= 0.9; // 10% discount
  }

  // Handle "Proceed to Payment"
  const handleProceedToPayment = async () => {
    // Reset error
    setTermsError('');

    // Validate terms
    if (!termsAccepted) {
      setTermsError('Please accept the terms and conditions to proceed');
      toast.error('Please accept the terms and conditions to proceed');
      return;
    }

    // Validate emails
    if (!validateEmails()) {
      toast.error('Please check all email addresses are valid.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          participantEmails,
          basePrice: bookingData.pricing.basePrice,
          recordingPrice: bookingData.pricing.recordingPrice,
          recordingCount: includeRecording ? recordingCount : 0,
          participants: participants,
          bookingDetails: {
            sessionId: bookingData.sessionId,
            date: bookingData.date,
            includeRecording,
            discountApplied,
            sessionName: bookingData.title,
          },
          isOneTimePayment: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment initialization failed');
      }

      const { url } = await response.json();
      
      // Show loading message
      toast.loading('Redirecting to payment...', {
        duration: 2000,
      });

      // Redirect to Stripe Checkout after a short delay
      setTimeout(() => {
        window.location.href = url;
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Unable to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add email validation helper
  const validateEmails = () => {
    const errors = participantEmails.map(email => {
      if (!email) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
      return '';
    });
    setEmailErrors(errors);
    return errors.every(error => !error);
  };

  // Render Sidebar
  const renderSidebar = () => {
    if (!bookingData) return null;

    return (
      <div className="listingSectionSidebar__wrap shadow-xl p-6 rounded-2xl bg-white dark:bg-neutral-900">
        {/* Price and Rating */}
        <div className="flex justify-between items-center">
          <span className="text-3xl font-semibold">
            €{bookingData.pricing.basePrice}
            <span className="ml-1 text-base font-normal text-neutral-500 dark:text-neutral-400">
              /session
            </span>
          </span>
          {bookingData.rating && bookingData.rating.count > 0 ? (
            <StartRating 
              rating={bookingData.rating.average}     // matches the prop interface
              reviewCount={bookingData.rating.count}  // matches the prop interface
              className="text-sm"
            />
          ) : (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              No ratings yet
            </span>
          )}
        </div>

        {/* MAIN FORM */}
        <div className="flex flex-col space-y-6 mt-6">
          {/* Participants Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Participants</h3>
            <ParticipantsInput 
              value={participants} 
              onChange={setParticipants} 
              placeholder="Number of Participants" 
            />
          </div>

          {/* Recording Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Add-ons
            <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
                (Coming Soon)
              </span>
            </h3>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600"
                  checked={includeRecording}
                  onChange={(e) => {
                    setIncludeRecording(e.target.checked);
                    if (!e.target.checked) setRecordingCount(1);
                  }}
                />
                <div className="flex flex-col">
                  <span className="font-medium">Session Recording</span>
                  <span className="text-sm text-neutral-500">
                    €{recordingPrice} per recording
                  </span>
                </div>
              </label>

              {includeRecording && (
                <div className="flex items-center justify-between pl-8">
                  <span className="text-sm text-neutral-600">Recordings</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-1.5 rounded-full ${
                        recordingCount > 1
                          ? "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700"
                          : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      }`}
                      onClick={() => handleRecordingCountChange(recordingCount - 1)}
                      disabled={recordingCount <= 1}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{recordingCount}</span>
                    <button
                      className={`p-1.5 rounded-full ${
                        recordingCount < participants
                          ? "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700"
                          : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      }`}
                      onClick={() => handleRecordingCountChange(recordingCount + 1)}
                      disabled={recordingCount >= participants}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 border rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  className="hidden"
                  defaultChecked
                />
                <span className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 10h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Credit Card</span>
                </span>
              </label>
              
              <label className="relative flex items-center p-4 border rounded-xl text-neutral-400 cursor-not-allowed">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  disabled
                  className="hidden"
                />
                <span className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M19.5 5h-15a2.5 2.5 0 00-2.5 2.5v9A2.5 2.5 0 004.5 19h15a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0019.5 5z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 15h10M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>PayPal</span>
                </span>
                <span className="absolute top-2 right-2 text-xs">Soon</span>
              </label>
            </div>
          </div>

          {/* Discount Code */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Discount Code</h3>
            <div className="flex space-x-2">
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter code"
                className="flex-1"
                disabled={loading || discountApplied}
              />
              <button
                onClick={applyDiscountCode}
                disabled={loading || discountApplied}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  loading || discountApplied
                    ? 'bg-neutral-100 text-neutral-400'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {loading ? 'Applying...' : discountApplied ? 'Applied ✓' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
              <span>Base Price (€{basePrice} × {participants})</span>
              <span>€{basePrice * participants}</span>
            </div>
            {includeRecording && (
              <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>Recording ({recordingCount}×)</span>
                <span>€{recordingPrice * recordingCount}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center">
                <span>Platform fees</span>
                <span className="ml-2 text-xs text-green-600">(waived)</span>
              </div>
              <span className="line-through">€0.99</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-600">
                <span>Discount (10%)</span>
                <span>-€{(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms and Payment Button */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setTermsError(''); // Clear error when terms are accepted
                    }
                  }}
                  className={`mt-1 form-checkbox h-5 w-5 ${
                    termsError ? 'border-red-500' : 'border-neutral-200'
                  }`}
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  I agree to the{" "}
                  <a 
                    href="/terms" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Terms and Conditions
                  </a>
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {termsError && (
                <div className="text-sm text-red-500 flex items-center space-x-1">
                  <svg 
                    className="w-4 h-4" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{termsError}</span>
                </div>
              )}
            </div>

            <ButtonPrimary
              onClick={handleProceedToPayment}
              disabled={loading || !termsAccepted}
              className={`w-full relative ${
                !termsAccepted ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg 
                    className="animate-spin h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                <>
                  {!termsAccepted ? (
                    "Please Accept Terms to Continue"
                  ) : (
                    "Proceed to Payment"
                  )}
                </>
              )}
            </ButtonPrimary>

            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-xl">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Main Content
  const renderMainContent = () => {
    if (!bookingData) return null;

    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{bookingData.title}</h1>
          <div className="flex items-center mt-2 text-neutral-500 dark:text-neutral-400">
            <span>
              {new Date(bookingData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="mx-2">•</span>
            <span>{bookingData.duration} minutes</span>
          </div>

          <div className="flex items-center mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Avatar
              hasChecked
              sizeClass="h-10 w-10"
              radius="rounded-full"
              imgUrl={bookingData.expert.image}
            />
            <div className="ml-4">
              <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                Led by
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-200">
                {bookingData.expert.name}
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="animate-fadeIn bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            {successMessage}
          </div>
        )}

        {/* Participant Emails Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Participant Details</h2>
          <div className="space-y-6">
            {participantEmails.map((email, index) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium mb-2">
                  {index === 0 ? (
                    <div className="flex items-center">
                      <span>Your Email</span>
                      <span className="ml-2 px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded-full">Primary</span>
                    </div>
                  ) : (
                    `Participant ${index + 1} Email`
                  )}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg border transition-all duration-150
                      ${emailErrors[index] 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-neutral-200 focus:border-primary-500'
                      }
                    `}
                    placeholder="email@example.com"
                  />
                  {email && !emailErrors[index] && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                  )}
                </div>
                {emailErrors[index] && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {emailErrors[index]}
                  </div>
                )}
                {index === 0 && (
                  <p className="mt-2 text-sm text-neutral-500">
                    This email will receive all important updates about the session
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Elements stripe={stripePromise}>
      <div className={`nc-CheckOutPagePageMain ${className}`}>
        <main className="container mb-24 mt-11 flex flex-col-reverse lg:flex-row">
          <div className="w-full lg:w-3/5 lg:pr-10 xl:w-2/3">{renderMainContent()}</div>
          <div className="mt-10 lg:mt-0 lg:w-2/5">{bookingData && renderSidebar()}</div>
        </main>
      </div>
    </Elements>
  );
};

export default CheckOutPagePageMain;
