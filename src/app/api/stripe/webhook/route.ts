import { prisma } from "@/lib/prismaDb";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { getBookingConfirmationEmail } from "@/lib/emailTemplates/bookingConfirmationEmail";
import { getBookingInvitationEmail } from "@/lib/emailTemplates/bookingInvitationEmail";
import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

export async function POST(request: Request) {
	const body = await request.text();
	const headersList = await headers();
	const signature = headersList.get("Stripe-Signature") ?? "";

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET || ""
		);

	} catch (err) {
		console.error("Webhook Error:", err);
		const message = err instanceof Error ? err.message : String(err);
		return new Response(`Webhook Error: ${message}`, { status: 400 });
	}

	// Acknowledge receipt immediately
	const response = new Response(null, { status: 200 });

	// Process webhook asynchronously
	processWebhookEvent(event).catch((error) => {
		console.error("Async webhook processing error:", error);
	});

	return response;
}

async function processWebhookEvent(event: Stripe.Event) {
	const session = event.data.object as Stripe.Checkout.Session;
	const email = session.customer_details?.email?.toLowerCase();

	if (!email) {

		return;
	}

	if (event.type === "checkout.session.completed") {

		try {
			// Your existing booking creation code
			// const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://nogl.ai:3000";
			const response = await fetch(
				`https://www.nogl.ai/api/user/bookings/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						metadata: {
							userId: session.metadata?.userId,
							participantEmails: session.metadata?.participantEmails,
							bookingDetails: session.metadata?.bookingDetails,
						},
						amount_total: session.amount_total,
						amount_subtotal: session.amount_subtotal,
						custom_fields: session.custom_fields,
						total_details: session.total_details,
					}),
				}
			);

			const booking = await response.json();
			if (!response.ok || !booking) {
				console.error("Failed to create booking record");
				return new Response("Failed to create booking record", { status: 500 });
			}

			// Add booking ID to the booking details
			const bookingDetailsJSON = session.metadata?.bookingDetails || "{}";
			const bookingDetails = {
				...JSON.parse(bookingDetailsJSON),
				bookingId: booking.id,
			};

			// Then proceed with email sending
			const participantEmailsString = session.metadata?.participantEmails || "";
			const participantEmails = participantEmailsString
				.split(",")
				.map((e) => e.trim().toLowerCase());


			// Assume the first email is the primary participant
			const primaryEmail = participantEmails[0];

			// Get user details from the database using the primary email
			const user = await prisma.user.findUnique({
				where: {
					email: primaryEmail,
				},
				select: {
					name: true,
				},
			});

			// Use the user's name from the database, fallback to session name, then to "Your colleague"
			const primaryParticipantName =
				user?.name || session.customer_details?.name || "Your colleague";
			bookingDetails.primaryParticipantName = primaryParticipantName;

			await Promise.all(
				participantEmails.map(async (participantEmail, index) => {
					// Generate a magic link token
					const token = randomBytes(32).toString("hex");
					const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
					const expires = new Date(Date.now() + ONE_DAY_IN_SECONDS * 1000);

					// Store the token in your database
					await prisma.verificationToken.create({
						data: {
							identifier: participantEmail,
							token: createHash("sha256").update(token).digest("hex"),
							expires,
						},
					});

					// Construct the magic link URL
					const magicLink = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(
						participantEmail
					)}`;

					// Determine which email template to use
					let emailContent;
					if (index === 0) {
						// Primary participant gets the booking confirmation email
						emailContent = getBookingConfirmationEmail({
							url: magicLink,
							email: participantEmail,
							name: bookingDetails.primaryParticipantName,
							bookingDetails,
						});
					} else {
						// Other participants get the booking invitation email
						emailContent = getBookingInvitationEmail({
							url: magicLink,
							email: participantEmail,
							bookingDetails,
						});
					}


					// Send the email
					await sendEmail({
						to: participantEmail,
						subject: emailContent.subject,
						html: emailContent.html,
						text: emailContent.text,
					});
				})
			);
		} catch (error) {
			console.error("Error in async webhook processing:", error);
		}
	}

	try {
		revalidatePath("/user/billing");
	} catch (error) {
		console.error("Error revalidating path:", error);
	}
}
