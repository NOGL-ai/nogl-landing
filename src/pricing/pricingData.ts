import { Price } from "@/types/priceItem";

export const pricingData: Price[] = [
	{
		priceId: "price_1QJgznC8DkZnisvUJPQ8NQpw",
		unit_amount: 0, // Free Plan
		nickname: "Free Plan",
		description: "Start your learning journey today",
		subtitle: "Perfect for exploring",
		includes: [
			"Starter Pack: 3 demand-sensed trend reports (€273 value)",
			"Insights Vault: Access curated forecast highlights",
			"AI Forecast Assistant: Experience smart insights preview",
		],
		icon: `/images/pricing/pricing-icon-01.svg`,
	},
	{
		priceId: "price_1QJh0XC8DkZnisvUHaJvjM6c",
		unit_amount: 100 * 100, // Pro Plan
		nickname: "Pro Plan",
		description: "Transform your merchandising with forecasting & AI insights",
		subtitle: "For ambitious learners",
		includes: [
			"Weekly Forecasts: Demand and trend drops (€917/month value)",
			"AI Merchandising Coach: Summaries & action plans from forecasts",
			"Members-only insights from category specialists",
		],
		icon: `/images/pricing/pricing-icon-02.svg`,
		active: true,
	},
	{
		priceId: "price_1QJh25C8DkZnisvUpcObIKgI",
		unit_amount: 0, // Flexible pricing determined by the expert
		nickname: "Community Access",
		description: "Join our community of data-driven fashion teams",
		subtitle: "For occasional learners",
		includes: [
			"One-time access to a category forecast",
			"Option to purchase deep-dive reports",
			"Add-ons available for enhanced insights",
			"Email support",
		],
		icon: `/images/pricing/pricing-icon-03.svg`,
	},
];
