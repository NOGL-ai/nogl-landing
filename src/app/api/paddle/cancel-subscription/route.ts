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
		const res = await axios.post(
			`${process.env.NEXT_PUBLIC_PADDLE_API_URL}/subscriptions/${subscriptionId}/cancel`,
			{
				effective_from: "immediately",
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
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
