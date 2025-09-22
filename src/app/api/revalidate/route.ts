import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		if (!body?.type) {
			return new Response("Bad Request", { status: 400 });
		}

		revalidateTag(body.type);
		return NextResponse.json({
			status: 200,
			revalidated: true,
			now: Date.now(),
			body,
		});
	} catch (error: any) {
		console.error(error);
		return new Response(error.message, { status: 500 });
	}
}
