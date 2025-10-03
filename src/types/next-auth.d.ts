import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email: string;
			onboardingCompleted?: boolean;
			role?: string;
			error?: string;
			priceId?: string;
			currentPeriodEnd?: Date;
			bio?: string;
			username?: string;
		} & DefaultSession["user"];
	}

	interface User {
		id: string;
		email: string;
		onboardingCompleted?: boolean;
		role?: string;
		error?: string;
		priceId?: string;
		currentPeriodEnd?: Date;
		bio?: string;
		isCommunityMember?: boolean;
		username?: string;
	}

	interface JWT {
		id: string;
		email: string;
		onboardingCompleted?: boolean;
		role?: string;
		error?: string;
		bio?: string;
		isCommunityMember?: boolean;
		username?: string;
	}
}
