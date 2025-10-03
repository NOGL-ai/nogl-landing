export interface FeatureItem {
	id: number;
	title: string;
	description: string;
	icon: string;
	href: string;
}

const featuresData: FeatureItem[] = [
	{
		id: 1,
		title: "Demand Sensing",
		description:
			"Real-time analysis of consumer demand patterns and market signals to predict trending products.",
		icon: "/images/features/demand-sensing.svg",
		href: "/features/1",
	},
	{
		id: 2,
		title: "Trend Forecasting",
		description:
			"AI-powered predictions of upcoming fashion trends based on social media, runway shows, and market data.",
		icon: "/images/features/trend-forecasting.svg",
		href: "/features/2",
	},
	{
		id: 3,
		title: "Assortment Optimization",
		description:
			"Intelligent recommendations for product mix and inventory planning to maximize sales potential.",
		icon: "/images/features/assortment-optimization.svg",
		href: "/features/3",
	},
	{
		id: 4,
		title: "Price Intelligence",
		description:
			"Dynamic pricing insights and competitive analysis to optimize your pricing strategy.",
		icon: "/images/features/price-intelligence.svg",
		href: "/features/4",
	},
	{
		id: 5,
		title: "Market Analysis",
		description:
			"Comprehensive market research and competitor analysis to identify opportunities.",
		icon: "/images/features/market-analysis.svg",
		href: "/features/5",
	},
	{
		id: 6,
		title: "Consumer Insights",
		description:
			"Deep understanding of consumer behavior and preferences to drive product decisions.",
		icon: "/images/features/consumer-insights.svg",
		href: "/features/6",
	},
];

export default featuresData;
