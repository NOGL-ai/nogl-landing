import { prisma } from "@/lib/prismaDb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { createTransport } from "nodemailer";
import { getMagicLinkEmail } from "@/lib/emailTemplates/magicLinkEmail";
import { getBookingConfirmationEmail } from "@/lib/emailTemplates/bookingConfirmationEmail";
import { sendEmail } from "@/lib/email";

declare module "next-auth" {
	interface User {
		// Remove role and isCommunityMember
	}

	interface Session extends DefaultSession {
		user: User & DefaultSession["user"];
	}
}

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: "/auth/signin",
	},
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
	},
	debug: process.env.NODE_ENV === "development",

	providers: [
		CredentialsProvider({
			name: "credentials",
			id: "credentials",
			credentials: {
				email: { label: "Email", type: "text", placeholder: "Jhondoe" },
				password: { label: "Password", type: "password" },
				username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter an email or password");
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user || !user.password) {
					throw new Error("No user found");
				}

				const passwordMatch = await bcrypt.compare(
					credentials.password,
					user.password
				);

				if (!passwordMatch) {
					throw new Error("Incorrect password");
				}

				// Ensure the returned object matches the User type
				return {
					id: user.id,
					name: user.name!,
					email: user.email!,
					emailVerified: user.emailVerified,
					image: user.image,
				};
			},
		}),

		CredentialsProvider({
			name: "impersonate",
			id: "impersonate",
			credentials: {
				adminEmail: {
					label: "Admin Email",
					type: "text",
					placeholder: "Jhondoe@gmail.com",
				},
				userEmail: {
					label: "User Email",
					type: "text",
					placeholder: "Jhondoe@gmail.com",
				},
			},

			async authorize(credentials) {
				if (!credentials?.adminEmail || !credentials?.userEmail) {
					throw new Error("User email or Admin email is missing");
				}

				const admin = await prisma.user.findUnique({
					where: {
						email: credentials.adminEmail.toLowerCase(),
					},
				});

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.userEmail.toLowerCase(),
					},
				});

				if (!admin || admin.role !== "ADMIN") {
					throw new Error("Access denied");
				}

				if (!user) {
					throw new Error("No user found");
				}

				// Ensure non-nullable fields are handled
				if (!user.role) {
					throw new Error("User role is missing");
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
				};
			},
		}),

		CredentialsProvider({
			name: "fetchSession",
			id: "fetchSession",
			credentials: {
				email: {
					label: "User Email",
					type: "text",
					placeholder: "Jhondoe@gmail.com",
				},
			},

			async authorize(credentials) {
				if (!credentials?.email) {
					throw new Error("User email is missing");
				}

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email.toLowerCase(),
					},
				});

				if (!user) {
					throw new Error("No user found");
				}

				// Ensure the returned object matches the User type
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					emailVerified: user.emailVerified,
					image: user.image,
				};
			},
		}),

		EmailProvider({
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: Number(process.env.EMAIL_SERVER_PORT),
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
				secure: false,
				tls: {
					rejectUnauthorized: false,
					ciphers: "SSLv3",
				},
			},
			from: process.env.EMAIL_FROM,
			async sendVerificationRequest({
				identifier: email,
				url,
				provider: { server, from },
				theme,
			}) {
				// Determine if this is a booking confirmation
				const isBookingConfirmation = url.includes("booking");

				let emailContent;

				if (isBookingConfirmation) {
					// Ensure bookingDetails is defined with required properties
					const bookingDetails = {
						date: new Date().toISOString(),
						includeRecording: false,
						recordingCount: 0,
						sessionName: "Your Session Name",
						participants: 1,
						totalAmount: 0,
					};
					// Use the booking confirmation email template
					emailContent = getBookingConfirmationEmail({
						url,
						email,
						bookingDetails,
					});
				} else {
					// Use the standard magic link email template
					emailContent = getMagicLinkEmail({
						url,
						host: "yourdomain.com",
						email,
					});
				}

				// Send the email using your sendEmail function
				await sendEmail({
					to: email,
					subject: emailContent.subject,
					html: emailContent.html,
					text: emailContent.text,
				});
			},
		}),

		// GitHubProvider({
		//     clientId: process.env.GITHUB_CLIENT_ID || "",
		//     clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
		// }),

		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					prompt: "select_account",
					state: JSON.stringify({ role: "USER", isCommunityMember: false }),
				},
			},
		}),
	],

	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;

				// Fetch additional user data from database
				try {
					const dbUser = await prisma.user.findUnique({
						where: { id: user.id },
						select: {
							id: true,
							email: true,
							onboardingCompleted: true,
							role: true,
						},
					});

					if (dbUser) {
						token.onboardingCompleted = dbUser.onboardingCompleted;
						token.role = dbUser.role;
						
						// Validate email
						if (dbUser.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dbUser.email)) {
							token.email = dbUser.email;
						} else {
							token.emailError = "Invalid email";
						}
					}
				} catch (error) {
					console.error('Error fetching user data in jwt callback:', error);
				}
			}
			return token;
		},

		async signIn({ user, account, profile, email, credentials }) {
			if (account?.provider === "google") {
				try {
					const existingUser = await prisma.user.findUnique({
						where: { email: user.email! },
					});

					// If user exists and email is verified by Google, we can safely link accounts
					if (existingUser && (profile as any).email_verified) {
						// Update existing user with Google information
						await prisma.user.update({
							where: { email: user.email! },
							data: {
								// Preserve existing role and community status
								name: existingUser.name || user.name,
								image: existingUser.image || user.image,
								emailVerified: new Date(),
							},
						});
						return true;
					}

					// For new users, proceed with normal signup
					return true;
				} catch (error) {
					console.error("Error in signIn callback:", error);
					return false;
				}
			}
			return true;
		},

		session: async ({ session, token }) => {
			// Safely handle null/undefined session (when user is not logged in)
			if (!session) {
				return session;
			}

			// Ensure user object exists before accessing it
			if (session.user) {
				if (token.sub) {
					session.user.id = token.sub;
				}
				if (token.picture) {
					session.user.image = token.picture;
				}
				
				// Add custom fields to session
				(session.user as any).onboardingCompleted = token.onboardingCompleted;
				(session.user as any).role = token.role;
				(session.user as any).emailError = (token as any).emailError;
			}
			
			return session;
		},
	},
};

export const getAuthSession = async () => {
	try {
		// Check if required environment variables are present
		if (!process.env.NEXTAUTH_SECRET) {
			console.warn('NEXTAUTH_SECRET is not set');
			return null;
		}
		
		return await getServerSession(authOptions);
	} catch (error) {
		console.error('Error in getAuthSession:', error);
		return null;
	}
};
