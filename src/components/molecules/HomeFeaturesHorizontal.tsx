"use client";

import { useState } from "react";
import Image from "next/image";
import { FeatureSection as Features } from "@/components/organisms/Features";
import Section from "@/components/organisms/section";
import { Users, BookOpen, MessageSquare, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

// Define feature data with optimized image properties
const FEATURES_DATA = [
	{
		id: 1,
		title: "Affordable Group Sessions",
		content: "Join expert-led group calls at a fraction of the cost.",
		image: "/images/solution/group_sessions.png",
		width: 800,
		height: 600,
		sizes: "(max-width: 768px) 100vw, 50vw",
		priority: true,
		icon: <Users className='text-primary h-6 w-6' />,
	},
	{
		id: 2,
		title: "Comprehensive Expert Directory",
		content: "Access a wide range of professionals across various fields.",
		image: "/images/solution/expert.png",
		width: 800,
		height: 600,
		blurDataURL: "data:image/jpeg;base64,...", // Add your blur data URL
		icon: <BookOpen className='text-primary h-6 w-6' />,
	},
	{
		id: 3,
		title: "AI-Enhanced Learning Tools",
		content:
			"Benefit from recordings, transcripts, summaries, and AI chatbots.",
		image: "/images/solution/solution_4.png",
		width: 800,
		height: 600,
		blurDataURL: "data:image/jpeg;base64,...", // Add your blur data URL
		icon: <Sliders className='text-primary h-6 w-6' />,
	},
	{
		id: 4,
		title: "Interactive Learning Experience",
		content:
			"Engage with experts and peers through live chats and Q&A sessions.",
		image: "/images/solution/aichats.png",
		width: 800,
		height: 600,
		blurDataURL: "data:image/jpeg;base64,...", // Add your blur data URL
		icon: <MessageSquare className='text-primary h-6 w-6' />,
	},
];

export default function Component() {
	return (
		<Section
			title='Key Features'
			subtitle='Empowering Your Professional Growth'
		>
			<Features
				collapseDelay={5000}
				linePosition='bottom'
				data={FEATURES_DATA}
			/>
		</Section>
	);
}
