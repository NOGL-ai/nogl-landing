// ============================================
// STRIPE TEMPORARILY DISABLED FOR BUILD
// Uncomment when Stripe is needed
// ============================================

/*
import Stripe from "stripe";

// Lazy initialization - only create Stripe instance when needed, not at module load
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
	if (!stripeInstance) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY is not set");
		}
		stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: "2023-10-16",
		});
	}
	return stripeInstance;
}

// Export a proxy object that lazily initializes Stripe
export const stripe = new Proxy({} as Stripe, {
	get(target, prop) {
		const stripeInstance = getStripe();
		const value = stripeInstance[prop as keyof Stripe];
		if (typeof value === 'function') {
			return value.bind(stripeInstance);
		}
		return value;
	}
});
*/

// Temporary mock export to prevent build errors
export const stripe: any = {
	webhooks: {
		constructEvent: () => { throw new Error("Stripe is disabled"); }
	},
	checkout: {
		sessions: {
			create: () => { throw new Error("Stripe is disabled"); }
		}
	}
};
