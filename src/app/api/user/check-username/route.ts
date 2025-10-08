import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";

// Remove edge runtime to allow Prisma usage
// export const runtime = "edge";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const username = searchParams.get("username");

		if (!username) {
			return NextResponse.json(
				{ error: "Username parameter is required" },
				{ status: 400 }
			);
		}

		const existingUser = await prisma.user.findUnique({
			where: { username },
			select: { id: true },
		});

		return NextResponse.json({
			available: !existingUser,
		});
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
