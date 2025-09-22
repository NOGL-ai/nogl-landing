"use client";

import React, { FC } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";
import NcModal from "@/shared/NcModal";
import { ParticipantsObject } from "../(client-components)/type";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import converSelectedDateToString from "@/utils/converSelectedDateToString";

interface CheckoutFormProps {
  selectedDate: Date;
  participants: ParticipantsObject;
  participantEmails: string[];
  messageForExpert: string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleEmailChange: (index: number, value: string) => void;
  addParticipantEmailField: () => void;
  setMessageForExpert: React.Dispatch<React.SetStateAction<string>>;
  renderSidebar: () => JSX.Element;
}

const CheckoutForm: FC<CheckoutFormProps> = ({
  selectedDate,
  participants,
  participantEmails,
  messageForExpert,
  loading,
  setLoading,
  handleEmailChange,
  addParticipantEmailField,
  setMessageForExpert,
  renderSidebar,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      // Get booking data from sessionStorage
      const bookingDataStr = sessionStorage.getItem('bookingData');
      if (!bookingDataStr) {
        throw new Error('Booking data not found');
      }
      const bookingData = JSON.parse(bookingDataStr);

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setLoading(false);
        return;
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email: participantEmails[0] },
      });

      if (error) {
        console.error(error);
        alert(
          error.message || "An error occurred while processing your payment."
        );
        setLoading(false);
        return;
      }

      // Send booking details to the server
      const response = await fetch("/api/stripe/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          participantEmails,
          messageForExpert,
          bookingDetails: {
            selectedDate,
            participants,
          },
          isOneTimePayment: true,
          priceId: "price_123456789", // Replace with your actual price ID
        }),
      });

      const result = await response.json();

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        alert("Payment initiation failed. Please try again.");
        setLoading(false);
      }

      // Clear sessionStorage after successful payment
      sessionStorage.removeItem('bookingData');
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handlePayment}
      className="flex w-full flex-col space-y-8 border-neutral-200 px-0 dark:border-neutral-700 sm:rounded-2xl sm:border sm:p-6 xl:p-8"
    >
      <h2 className="text-3xl font-semibold lg:text-4xl">Confirm and Pay</h2>
      <div className="border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* Your Session */}
      <div>
        <h3 className="text-2xl font-semibold">Your Session</h3>
        <NcModal
          renderTrigger={(openModal) => (
            <span
              onClick={() => openModal()}
              className="mt-1 block cursor-pointer underline lg:hidden"
            >
              View booking details
            </span>
          )}
          renderContent={renderSidebar}
          modalTitle="Booking Details"
        />

        {/* Booking Details */}
        <div className="z-10 mt-6 flex flex-col divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
          {/* Date Display */}
          <div className="flex flex-1 justify-between space-x-5 p-5 text-left">
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400">Date</span>
              <span className="mt-1.5 text-lg font-semibold">
                {converSelectedDateToString([selectedDate])}
              </span>
            </div>
          </div>

          {/* Participants Section */}
          <div className="flex flex-1 justify-between space-x-5 p-5 text-left">
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400">Participants</span>
              <span className="mt-1.5 text-lg font-semibold">
                {`${participants.totalParticipants} Participant${
                  participants.totalParticipants > 1 ? "s" : ""
                }`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                // Open participants modal if applicable
              }}
            >
              <PencilSquareIcon className="text-neutral-600 h-6 w-6 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Participant Emails */}
      <div>
        <h3 className="text-2xl font-semibold">Participant Emails</h3>
        <div className="my-5 w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="space-y-4">
          {participantEmails.map((email, index) => (
            <div key={index} className="space-y-1">
              <Label>
                {index === 0
                  ? "Your Email (Primary Participant)"
                  : `Participant ${index + 1} Email`}
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                required
                disabled={participants.totalParticipants === 1}
              />
            </div>
          ))}
          {/* Add Participant Button */}
          {participantEmails.length < participants.totalParticipants && (
            <button
              type="button"
              onClick={addParticipantEmailField}
              className="text-primary-600 hover:underline"
            >
              + Add another participant
            </button>
          )}
        </div>
      </div>

      {/* Message for Expert */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Message for Expert</h3>
        <Textarea
          value={messageForExpert}
          onChange={(e) => setMessageForExpert(e.target.value)}
          placeholder="Write a message to the expert..."
        />
      </div>

      {/* Payment Section */}
      <div>
        <h3 className="text-2xl font-semibold">Payment Details</h3>
        <div className="my-5 w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div className="mt-6">
          {/* Stripe Elements */}
          <div className="space-y-5">
            <div className="space-y-1">
              <Label>Card Details</Label>
              <div className="p-3 border rounded-lg dark:border-neutral-700">
                <CardElement />
              </div>
            </div>
          </div>
          <div className="pt-8">
            <ButtonPrimary type="submit" disabled={!stripe || loading}>
              {loading ? "Processing..." : "Confirm and Pay"}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;
