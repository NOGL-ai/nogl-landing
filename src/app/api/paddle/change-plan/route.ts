import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json();
	const { subscriptionId, priceId } = body;

	try {
		const subscription = await axios.patch(
			`${process.env.NEXT_PUBLIC_PADDLE_API_URL}/subscriptions/${subscriptionId}`,
			{
				proration_billing_mode: "prorated_immediately",
				items: [
					{
						price_id: priceId,
						quantity: 1,
					},
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
				},
			}
		);

		const newData = {
			subscriptionId: subscription.data.data.id,
			customerId: subscription.data.data.customer_id,
			priceId: subscription.data.data.items[0].price.id,
			currentPeriodEnd: new Date(
				subscription.data.data.current_billing_period.ends_at
			),
		};

		// console.log(newData);
		return new NextResponse(JSON.stringify(newData), { status: 200 });
	} catch (error) {
		console.error(error);
		return new NextResponse("Something went wrong", { status: 500 });
	}
}
