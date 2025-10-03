import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { email } = await req.json();
	if (!email) {
		return NextResponse.json({ error: "Email is required" }, { status: 400 });
	}

	// Check if we're in development/local environment
	const isLocal = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DOMAIN?.includes('localhost');
	
	if (isLocal) {
		// In local development, just return success without calling Mailchimp
		console.log(`[LOCAL] Newsletter subscription for: ${email}`);
		return NextResponse.json({ 
			status: "subscribed",
			email_address: email.toLowerCase(),
			message: "Subscription successful (local development mode)"
		});
	}

	const MailchimpKey = process.env.MAILCHIMP_API_KEY;
	const MailchimpServer = process.env.MAILCHIMP_API_SERVER;
	const MailchimpAudience = process.env.MAILCHIMP_AUDIENCE_ID;

	// Check if Mailchimp is configured
	if (!MailchimpKey || !MailchimpServer || !MailchimpAudience) {
		console.error("Mailchimp environment variables not configured");
		return NextResponse.json(
			{ error: "Newsletter service not configured" },
			{ status: 500 }
		);
	}

	const customUrl = `https://${MailchimpServer}.api.mailchimp.com/3.0/lists/${MailchimpAudience}/members`;

	try {
		const response = await fetch(customUrl, {
			method: "POST",
			headers: {
				Authorization: `apikey ${MailchimpKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email_address: email.toLowerCase(),
				status: "subscribed",
			}),
		});
		const received = await response.json();
		return NextResponse.json(received);
	} catch (error) {
		console.error("Mailchimp API error:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 }
		);
	}
}
