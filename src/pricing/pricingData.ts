import { Price } from "@/types/priceItem";

export const pricingData: Price[] = [
	{
		priceId: "price_1QJgznC8DkZnisvUJPQ8NQpw",
		unit_amount: 0, // Free Plan
		nickname: "Free Plan",
		description: "Start your learning journey today",
		subtitle: "Perfect for exploring",
		includes: [
			"Starter Pack: 3 hand-picked expert sessions ($297 value)",
			"Success Vault: Access curated session highlights",
			"AI Learning Assistant: Experience smart insights preview",
		],
		icon: `/images/pricing/pricing-icon-01.svg`,
	},
	{
		priceId: "price_1QJh0XC8DkZnisvUHaJvjM6c",
		unit_amount: 100 * 100, // Pro Plan
		nickname: "Pro Plan",
		description: "Transform your learning with unlimited access & AI insights",
		subtitle: "For ambitious learners",
		includes: [
			"Weekly Growth Sessions: Guided expert learning path ($997/month value)",
			"Personal AI Coach: Get summaries & action plans after each session",
			"Members-only mastermind sessions with industry experts",
		],
		icon: `/images/pricing/pricing-icon-02.svg`,
		active: true,
	},
	{
		priceId: "price_1QJh25C8DkZnisvUpcObIKgI",
		unit_amount: 0, // Flexible pricing determined by the expert
		nickname: "Community Access",
		description:
			"Join our thriving community of ambitious learners",
		subtitle: "For occasional learners",
		includes: [
			"One-time access to an expert session",
			"Option to purchase recordings",
			"Add-ons available for enhanced learning",
			"Email support",
		],
		icon: `/images/pricing/pricing-icon-03.svg`,
	},
];
