import { prisma } from "@/lib/prismaDb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import { getMagicLinkEmail } from "@/lib/emailTemplates/magicLinkEmail";
import { getBookingConfirmationEmail } from "@/lib/emailTemplates/bookingConfirmationEmail";
import { formatEmail } from "@/lib/email";

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
				try {
					if (!credentials?.email || !credentials?.password) {
						throw new Error("Please enter an email or password");
					}

					const formattedEmail = formatEmail(credentials.email);

					if (!formattedEmail) {
						throw new Error("Invalid email format");
					}

				const user = await prisma.user.findUnique({
					where: {
						email: formattedEmail,
					},
				});

				if (!user) {
					throw new Error("No user found");
				}

				if (!user.password) {
					throw new Error("This account was created with Google. Please use 'Sign in with Google' button instead.");
				}

					const passwordMatch = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (!passwordMatch) {
						throw new Error("Incorrect password");
					}

					// Ensure all required fields are present
					if (!user.id || !user.email) {
						throw new Error("Invalid user data");
					}

					// Ensure the returned object matches the User type
					return {
						id: user.id,
						name: user.name || "",
						email: user.email,
						emailVerified: user.emailVerified || null,
						image: user.image || null,
					};
				} catch (error) {
					console.error("Credentials authorize error:", error);
					throw error;
				}
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
			// Prefer Stalwart submission relay (homelab) when configured;
			// fall back to the legacy EMAIL_SERVER_* vars for dev/local environments.
			server: {
				host:
					process.env.STALWART_HOST ||
					process.env.EMAIL_SERVER_HOST ||
					"10.10.10.101",
				port: Number(
					process.env.STALWART_SUBMISSION_PORT ||
						process.env.EMAIL_SERVER_PORT ||
						587
				),
				auth: {
					user:
						process.env.STALWART_ALERTS_USER ||
						process.env.EMAIL_SERVER_USER ||
						"alerts@nogl.tech",
					pass:
						process.env.STALWART_ALERTS_PASSWORD ||
						process.env.EMAIL_SERVER_PASSWORD,
				},
				// Stalwart uses STARTTLS on 587, not implicit TLS.
				secure: false,
				requireTLS: true,
				tls: {
					rejectUnauthorized: false,
				},
			},
			from:
				process.env.STALWART_ALERTS_FROM ||
				process.env.EMAIL_FROM ||
				"alerts@nogl.tech",
			maxAge: 15 * 60, // 15 min token expiry
			async sendVerificationRequest({
				identifier: email,
				url,
				provider,
			}) {
				// Determine if this is a booking confirmation flow
				const isBookingConfirmation = url.includes("booking");

				let emailContent;

				if (isBookingConfirmation) {
					const bookingDetails = {
						date: new Date().toISOString(),
						includeRecording: false,
						recordingCount: 0,
						sessionName: "Your Session Name",
						participants: 1,
						totalAmount: 0,
					};
					emailContent = getBookingConfirmationEmail({
						url,
						email,
						bookingDetails,
					});
				} else {
					// Standard magic-link signin email — clean template that
					// also reminds the pilot they can sign in with a password.
					const host =
						process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, "") ||
						"app.nogl.tech";
					emailContent = getMagicLinkEmail({
						url,
						host,
						email,
					});
				}

				// Send through the EmailProvider's configured server (Stalwart
				// submission relay in prod), NOT through the legacy sendEmail()
				// helper which uses different env vars.
				const { createTransport } = await import("nodemailer");
				const transport = createTransport(provider.server as any);
				await transport.sendMail({
					to: email,
					from: provider.from,
					subject: emailContent.subject,
					text: emailContent.text,
					html: emailContent.html,
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
			// Ensure token is always an object
			if (!token) {
				token = {};
			}

			if (user && user.id) {
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
							console.warn('Invalid email format for user:', dbUser.id);
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
			// Ensure user object exists
			if (!user) {
				console.error("signIn callback: user is undefined");
				return false;
			}

			if (account?.provider === "google") {
				try {
					// Ensure email is available
					if (!user.email) {
						console.error("Google sign in: user email is missing");
						return false;
					}

					const existingUser = await prisma.user.findUnique({
						where: { email: user.email },
					});

					// If user exists and email is verified by Google, we can safely link accounts
					if (existingUser && (profile as any)?.email_verified) {
						// Update existing user with Google information
						await prisma.user.update({
							where: { email: user.email },
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

		async redirect({ url, baseUrl }) {
			// Get the default locale
			const defaultLocale = "en";
			
			// If url is relative, make it absolute
			if (url.startsWith("/")) {
				return `${baseUrl}/${defaultLocale}/dashboard`;
			}
			
			// If url already contains the callback, parse it
			if (url.includes("callbackUrl=")) {
				const urlObj = new URL(url);
				const callbackUrl = urlObj.searchParams.get("callbackUrl");
				if (callbackUrl) {
					return callbackUrl.startsWith("/") ? `${baseUrl}/${defaultLocale}/dashboard` : callbackUrl;
				}
			}
			
			// Default redirect to dashboard with locale
			return `${baseUrl}/${defaultLocale}/dashboard`;
		},

		session: async ({ session, token }) => {
			// Ensure session and session.user exist
			if (!session || !session.user) {
				// Return a minimal valid session structure
				return {
					user: {
						id: token.sub || '',
						email: token.email || null,
						name: token.name || null,
						image: token.picture || null,
					},
					expires: session?.expires || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
				};
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
		// Development bypass for local testing
		if (process.env.NODE_ENV === 'development') {
			console.log('⚠️ Auth bypass enabled - returning mock session');
			return {
				user: {
					id: 'dev-user-id',
					name: 'Dev User',
					email: 'dev@test.com',
					image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
					emailVerified: new Date(),
					role: 'USER',
				} as any,
				expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
			};
		}

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

