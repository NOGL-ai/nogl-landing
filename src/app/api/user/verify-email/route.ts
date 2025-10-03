import { prisma } from "@/lib/prismaDb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { token } = await request.json();

		const verificationToken = await prisma.verificationToken.findUnique({
			where: { token },
		});

		if (!verificationToken) {
			return NextResponse.json({ error: "Invalid token" }, { status: 400 });
		}

		if (verificationToken.expires < new Date()) {
			return NextResponse.json({ error: "Token expired" }, { status: 400 });
		}

		// Update user
		await prisma.user.update({
			where: { email: verificationToken.identifier },
			data: { emailVerified: new Date() },
		});

		// Delete used token
		await prisma.verificationToken.delete({
			where: { token },
		});

		return NextResponse.json({ message: "Email verified successfully" });
	} catch (error) {
		console.error("Verification error:", error);
		return NextResponse.json(
			{ error: "Something went wrong during verification" },
			{ status: 500 }
		);
	}
}
