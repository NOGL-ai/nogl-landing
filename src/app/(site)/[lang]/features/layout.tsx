import React from 'react';
import Particles from '@/components/ui/particles';
import BgGlassmorphism from '@/components/BgGlassmorphism';
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
		<div className="min-h-screen relative overflow-hidden">
			<Particles
				className="absolute inset-0 -z-10"
				quantity={3000}
				ease={70}
				size={0.5}
				staticity={40}
				color="#4F46E5"
			/>
			<BgGlassmorphism />
			<main className="flex-1 relative z-10">
				{children}
			</main>
		</div>
	);
}