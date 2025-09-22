import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import formatPassword from "@/libs/formatPassword";

export async function POST(request: Request) {
	const body = await request.json();
	const { token, password } = body;

	if (!token || !password) {
		return new NextResponse("Missing Fields", { status: 400 });
	}

	const invitation = await prisma.invitation.findUnique({
		where: { token },
	});

	if (!invitation || invitation.expiresAt < new Date() || invitation.accepted) {
		if (!token) {
			return new NextResponse("Missing Fields", { status: 400 });
		}
	}

	const hashedPassword = await formatPassword(password);

	if (!invitation) {
		return new NextResponse("Invalid or expired token", { status: 400 });
	}

	// Check if user already exists
	const user = await prisma.user.findUnique({
		where: { email: invitation.email },
	});

	if (user) {
		return new NextResponse("User already exists", { status: 400 });
	}

	try {
		const user = await prisma.user.create({
			data: {
				name: "Guest",
				email: invitation.email,
				password: hashedPassword,
				role: invitation.role,
			},
		});

		await prisma.invitation.update({
			where: { id: invitation.id },
			data: { accepted: true, userId: user.id },
		});

		return new NextResponse("Account created", { status: 200 });
	} catch (error) {
		return new NextResponse("Something went wrong", { status: 500 });
	}
}
