export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from "../../../../../libs/prismaDb";
import type Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const stripeSession = typeof body === 'string' ? JSON.parse(body) : body as Stripe.Checkout.Session;
    
    const bookingDetailsJSON = typeof stripeSession.metadata?.bookingDetails === 'string' 
      ? stripeSession.metadata.bookingDetails 
      : JSON.stringify(stripeSession.metadata?.bookingDetails || {});
    
    console.log('Booking details JSON:', bookingDetailsJSON);
    const bookingDetails = JSON.parse(bookingDetailsJSON);
    console.log('Parsed booking details:', bookingDetails);

    const specialRequests = stripeSession.custom_fields?.find(
      (field: Stripe.Checkout.Session.CustomField) => field.key === 'special_requests'
    )?.text?.value;

    const booking = await prisma.booking.create({
      data: {
        expertSessionId: bookingDetails.sessionId,
        userId: stripeSession.metadata?.userId!,
        numParticipants: bookingDetails.participants,
        status: 'CONFIRMED',
        total: stripeSession.amount_total! / 100,
        includeRecording: bookingDetails.includeRecording || false,
        recordingCount: bookingDetails.recordingCount || 0,
        paymentStatus: 'PAID',
        paymentMethod: 'stripe',
        originalPrice: stripeSession.amount_subtotal! / 100,
        discountAmount: stripeSession.total_details?.amount_discount 
          ? stripeSession.total_details.amount_discount / 100 
          : null,
        discountCode: bookingDetails.discountCode,
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: specialRequests || null,
      }
    });

    console.log('Booking created:', booking);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 