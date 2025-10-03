import bcrypt from "bcrypt";
import { prisma } from "@/lib/prismaDb";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail, formatEmail, isValidEmail } from "@/lib/email";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, email, password, role, isCommunityMember } = body;

		if (!name || !email || !password) {
			return NextResponse.json(
				{
					error: "Missing Fields",
				},
				{ status: 400 }
			);
		}

		const formattedEmail = formatEmail(email);

		if (!isValidEmail(formattedEmail)) {
			return NextResponse.json(
				{
					error: "Invalid email format",
				},
				{ status: 400 }
			);
		}

		const exist = await prisma.user.findUnique({
			where: { email: formattedEmail },
		});

		if (exist) {
			return NextResponse.json(
				{
					error: "Email already exists",
				},
				{ status: 409 }
			);
		}

		// Password validation
		const MIN_PASSWORD_LENGTH = 8;
		if (password.length < MIN_PASSWORD_LENGTH) {
			return NextResponse.json(
				{
					error: "Password must be at least 8 characters",
				},
				{ status: 400 }
			);
		}

		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(password)) {
			return NextResponse.json(
				{
					error:
						"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
				},
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const adminEmails =
			process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
			[];

		// Validate and sanitize the role
		const allowedRoles = ["USER", "EXPERT"];
		const sanitizedRole = allowedRoles.includes(role) ? role : "USER";

		// Determine user role
		const userRole = adminEmails.includes(formattedEmail)
			? "ADMIN"
			: sanitizedRole;

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString("hex");
		const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Create user with verification status
		const user = await prisma.user.create({
			data: {
				name: name.trim(),
				email: formattedEmail,
				password: hashedPassword,
				role: userRole,
				isCommunityMember: Boolean(isCommunityMember),
				emailVerified: null, // Will be set after verification
			},
		});

		// Create verification token
		await prisma.verificationToken.create({
			data: {
				identifier: user.email!,
				token: verificationToken,
				expires: verificationExpiry,
			},
		});

		// Generate verification URL
		const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

		// Send verification email
		await sendVerificationEmail({
			to: user.email!,
			name: user.name!,
			verificationUrl,
		});

		return NextResponse.json({
			message:
				"Registration successful. Please check your email to verify your account.",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				isCommunityMember: user.isCommunityMember as boolean,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json(
			{
				error: "Something went wrong during registration",
			},
			{ status: 500 }
		);
	}
}
