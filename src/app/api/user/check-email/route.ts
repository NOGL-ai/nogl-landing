import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDb";
import { formatEmail, isValidEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const emailParam = searchParams.get("email");

		if (!emailParam) {
			return NextResponse.json(
				{ error: "Email parameter is required" },
				{ status: 400 }
			);
		}

		const formattedEmail = formatEmail(emailParam);

		if (!isValidEmail(formattedEmail)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		const existingUser = await prisma.user.findUnique({
			where: { email: formattedEmail },
			select: { id: true },
		});

		return NextResponse.json({ exists: Boolean(existingUser) });
	} catch (error) {
		console.error("Email availability check failed:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
