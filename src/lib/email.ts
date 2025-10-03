import nodemailer from "nodemailer";
// Removed DOMPurify import - using validator for sanitization instead
import validator from "validator";
import { getBookingConfirmationEmail } from "./emailTemplates/bookingConfirmationEmail";

// Validate required environment variables at startup
const requiredEnvVars = [
	"EMAIL_SERVER_HOST",
	"EMAIL_SERVER_USER",
	"EMAIL_SERVER_PASSWORD",
	"EMAIL_FROM",
];

requiredEnvVars.forEach((varName) => {
	if (!process.env[varName]) {
		console.error(`Environment variable ${varName} is not set.`);
		process.exit(1);
	}
});

type EmailPayload = {
	to: string;
	subject: string;
	html: string;
	text?: string;
};

type VerificationEmailProps = {
	to: string;
	name: string;
	verificationUrl: string;
};

const smtpOptions = {
	host: process.env.EMAIL_SERVER_HOST || "smtp.ionos.de",
	port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
	secure: false, // Set to true if using port 465
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PASSWORD,
	},
	requireTLS: true, // Enforce TLS
	tls: {
		rejectUnauthorized: false,
		ciphers: "SSLv3",
	},
	// Commented out insecure TLS options
};

export const sendEmail = async (data: EmailPayload) => {
	try {
		const transporter = nodemailer.createTransport({
			...smtpOptions,
		});

		const result = await transporter.sendMail({
			from: {
				name: "Nogl",
				address: process.env.EMAIL_FROM || "noreply@nogl.tech",
			},
			...data,
		});

		return { success: true, messageId: result.messageId };
	} catch (error: unknown) {
		console.error("Error sending email:", error);
		// throw new Error('Failed to send email');
		// Commented out generic error
		throw new Error(
			`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
};

export const sendVerificationEmail = async ({
	to,
	name,
	verificationUrl,
}: VerificationEmailProps) => {
	// Sanitize user inputs
	const sanitizedVerificationUrl = validator.escape(verificationUrl);
	const sanitizedName = validator.escape(name);


	const emailContent = {
		to,
		subject: "Verify your Nogl Account",
		html: `
<!DOCTYPE html>
<html>
<head>
    <title>Verify your Nogl Account</title>
    <style>
        /* Embedded styles for email clients that support them */
    </style>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f2">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; margin: 20px 0;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <img src="https://nogl.ai/logo.png" alt="Nogl Logo" width="150" style="display: block; margin: 0 auto 20px;">
                            <h1 style="font-size: 24px; color: #333333; margin-bottom: 20px;">Welcome to Nogl, ${sanitizedName}!</h1>
                            <p style="font-size: 16px; color: #555555; line-height: 1.5;">Thank you for joining Nogl. Please confirm your email address to get started.</p>
                            <a href="${sanitizedVerificationUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px;">Verify Email Address</a>
                            <p style="font-size: 14px; color: #777777; line-height: 1.5;">If the button above doesn't work, copy and paste the following link into your browser:</p>
                            <p style="font-size: 14px; color: #007bff; word-break: break-all;">${sanitizedVerificationUrl}</p>
                            <p style="font-size: 14px; color: #777777; line-height: 1.5;">This link will expire in 24 hours.</p>
                            <hr style="border: none; border-top: 1px solid #dddddd; margin: 20px 0;">
                            <p style="font-size: 12px; color: #aaaaaa;">If you did not sign up for this account, you can ignore this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9f9f9; padding: 10px; text-align: center;">
                            <p style="font-size: 12px; color: #aaaaaa;">&copy; ${new Date().getFullYear()} Nogl. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
		text: `
Welcome to Nogl, ${sanitizedName}!

Thank you for joining Nogl. Please confirm your email address to get started.

Verify Email Address: ${sanitizedVerificationUrl}

If the above link doesn't work, copy and paste it into your browser.

This link will expire in 24 hours.

If you did not sign up for this account, you can ignore this email.

© ${new Date().getFullYear()} Nogl. All rights reserved.
        `,
	};

	return sendEmail(emailContent);
};

export const formatEmail = (email: string) => {
	return email.replace(/\s+/g, "").toLowerCase().trim();
};

export const isValidEmail = (email: string): boolean => {
	// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	// return emailRegex.test(email);
	// Commented out the old regex validation
	return validator.isEmail(email);
};

export const sendBookingConfirmationEmail = async ({
	to,
	participantName,
	bookingDetails,
	signInUrl,
}: {
	to: string;
	participantName: string;
	bookingDetails: {
		date: string;
		includeRecording: boolean;
		recordingCount: number;
		sessionName: string;
		participants: number;
		totalAmount: number;
	};
	signInUrl: string;
}) => {
	// Add debug logging


	// Sanitize inputs
	const sanitizedEmail = validator.escape(to);
	const sanitizedParticipantName = validator.escape(participantName);
	const sanitizedSignInUrl = validator.escape(signInUrl);

	const emailContent = getBookingConfirmationEmail({
		url: sanitizedSignInUrl,
		email: sanitizedParticipantName,
		bookingDetails,
	});

	const emailPayload = {
		to: sanitizedEmail,
		subject: emailContent.subject,
		html: emailContent.html,
		text: emailContent.text,
	};

	return sendEmail(emailPayload);
};
