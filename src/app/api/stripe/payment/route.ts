import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2023-10-16",
});

async function getBaseUrl() {
	return process.env.NEXT_PUBLIC_APP_URL || (async () => {
		const headersList = await headers();
		  const host = headersList.get("host") || "nogl.ai:3000"
		const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
		return `${protocol}://${host}`;
	})();
}

export async function POST(request: Request) {
	if (!process.env.STRIPE_SECRET_KEY) {
		console.error('Missing Stripe secret key');
		return NextResponse.json(
			{ error: 'Stripe configuration error' },
			{ status: 500 }
		);
	}

	try {
		const data = await request.json();
		const { 
			stripeCustomerId, 
			userId, 
			participantEmails, 
			bookingDetails,
			isOneTimePayment,
			basePrice,
			recordingPrice = 0,
			recordingCount = 0,
			participants = 1
		} = data;

		const baseUrl = await getBaseUrl();

		// Define success and cancel URLs with absolute paths
		const successUrl = `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = `${baseUrl}/checkout`;

		// Calculate total amount in cents
		const totalAmount = Math.round(
			((basePrice * participants) + (recordingPrice * recordingCount)) * 100
		);

		// Create a Stripe Checkout Session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: isOneTimePayment ? 'payment' : 'subscription',
			line_items: [
				{
					price_data: {
						currency: 'eur',
						product_data: {
							name: 'Email Marketing Masterclass',
							description: `Session for ${participants} participant${participants > 1 ? 's' : ''}${
								recordingCount ? ` with ${recordingCount} recording${recordingCount > 1 ? 's' : ''}` : ''
							}`,
						},
						unit_amount: totalAmount,
					},
					quantity: 1,
				},
			],
			success_url: successUrl,
			cancel_url: cancelUrl,
			customer: stripeCustomerId || undefined,
			customer_email: participantEmails[0],
			metadata: {
				userId,
				participantEmails: participantEmails.join(","),
				bookingDetails: JSON.stringify({
					...bookingDetails,
					participants,
					recordingCount,
					totalAmount: totalAmount / 100,
				}),
			},
			payment_intent_data: {
				metadata: {
					userId,
					participantEmails: participantEmails.join(","),
				},
			},
			allow_promotion_codes: true,
			billing_address_collection: 'required',
			custom_fields: [
				{
					key: 'special_requests',
					label: { type: 'custom', custom: 'Any special requirements?' },
					type: 'text',
					optional: true,
				},
			],
			locale: 'auto',
			expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // Session expires in 1 hour
		});

		return NextResponse.json(
			{ url: session.url },
			{ 
				status: 200,
				headers: {
					'Cache-Control': 'no-store',
				}
			}
		);

	} catch (error) {
		console.error('Stripe session creation error:', error);
		return NextResponse.json(
			{ 
				error: 'Failed to create checkout session',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}
