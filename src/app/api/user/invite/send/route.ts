import { NextResponse } from "next/server";
import { prisma } from "@/libs/prismaDb";
import { sendEmail } from "@/libs/email";
import { isAuthorized } from "@/libs/isAuthorized";
import crypto from "crypto";

export async function POST(request: Request) {
	const body = await request.json();
	const { email, role } = body;

	const user = await isAuthorized();
	if (!user || user.role !== "ADMIN") {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	const token = crypto.randomBytes(32).toString("hex");

	const isAlreadyInvited = await prisma.invitation.findUnique({
		where: {
			email,
		},
	});

	if (isAlreadyInvited) {
		return new NextResponse("User already invited", { status: 400 });
	}

	try {
		const invitation = await prisma.invitation.create({
			data: {
				email,
				token,
				role,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
			},
		});

		if (!invitation) {
			return new NextResponse("Unable to send invitation", { status: 500 });
		}
	} catch (error) {
		return new NextResponse("Something went wrong", { status: 500 });
	}

	// Send invitation email
	const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/invite?token=${token}`;
	try {
		await sendEmail({
			to: email,
			subject: "Invitation to Login",
			html: ` 
      <div>
        <h1>You have been invited to login to your account</h1>
        <p>Click the link below login</p>
        <a href="${inviteLink}" target="_blank">Activate Account</a>
      </div>
      `,
		});

		return NextResponse.json("Invitation sent", {
			status: 200,
		});
	} catch (error) {
		return NextResponse.json("Unable to send invitation. Please try again!", {
			status: 500,
		});
	}
}
