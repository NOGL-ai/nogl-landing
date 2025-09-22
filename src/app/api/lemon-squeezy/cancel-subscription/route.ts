// https://api.lemonsqueezy.com/v1/subscriptions/{subscription_id}

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

async function POST(req: NextRequest) {
	const body = await req.json();
	const { subscriptionId } = body;

	if (!subscriptionId) {
		return NextResponse.json(
			{ error: "Subscription ID is required" },
			{ status: 400 }
		);
	}

	try {
		const res = await axios.delete(
			`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
				},
			}
		);

		const data = (await res).data;

		return NextResponse.json(
			{ message: "Subscription canceled successfully", data },
			{ status: 200 }
		);
	} catch (error: any) {
		// console.log(error.response.data.error.detail);
		return NextResponse.json(
			{ error: error.response.data.error.detail },
			{ status: 500 }
		);
	}
}

export { POST };
