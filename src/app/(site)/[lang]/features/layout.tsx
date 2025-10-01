import { Metadata } from 'next';

export const metadata: Metadata = {
	title: {
		template: '%s | Features',
		default: 'Features - AI Fashion Intelligence Platform',
	},
	description: 'Discover our AI-powered features for fashion trend forecasting and demand prediction',
};

export default function FeaturesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="features-layout">
			{children}
		</div>
	);
}