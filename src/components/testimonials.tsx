"use client";

import Marquee from "@/components/magicui/marquee";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export const Highlight = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<span
			className={cn(
				"bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary p-1 py-0.5 font-bold",
				className
			)}
		>
			{children}
		</span>
	);
};

export interface TestimonialCardProps {
	name: string;
	role: string;
	img?: string;
	description: React.ReactNode;
	className?: string;
	[key: string]: unknown;
}

export const TestimonialCard = ({
	description,
	name,
	img,
	role,
	className,
	...props // Capture the rest of the props
}: TestimonialCardProps) => (
	<div
		className={cn(
			"mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
			// light styles
			" border border-neutral-200 bg-white",
			// dark styles
			"dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
			className
		)}
		{...props} // Spread the rest of the props here
	>
		<div className='select-none text-sm font-normal text-neutral-700 dark:text-neutral-400'>
			{description}
			<div className='flex flex-row py-1'>
				<Star className='size-4 fill-yellow-500 text-yellow-500' />
				<Star className='size-4 fill-yellow-500 text-yellow-500' />
				<Star className='size-4 fill-yellow-500 text-yellow-500' />
				<Star className='size-4 fill-yellow-500 text-yellow-500' />
				<Star className='size-4 fill-yellow-500 text-yellow-500' />
			</div>
		</div>

		<div className='flex w-full select-none items-center justify-start gap-5'>
			<Image
				width={40}
				height={40}
				src={img || ""}
				alt={name}
				className='ring-border h-10 w-10 rounded-full ring-1 ring-offset-4'
			/>

			<div>
				<p className='font-medium text-neutral-500'>{name}</p>
				<p className='text-xs font-normal text-neutral-400'>{role}</p>
			</div>
		</div>
	</div>
);

const testimonials = [
	{
		name: "Viola Weller",
		role: "Founder of VLACE",
		img: "https://i.ibb.co/BBxkzfY/Viola-Weller-KWERLE-final-1-jpg.webp",
		description: (
			<p>
				The Content Creation Strategy session gave me a clear direction for
				social media.
				<Highlight>
					Communicating authentically and getting better responses.
				</Highlight>
			</p>
		),
	},
	{
		name: "Amy Jedlička",
		role: "Co-Founder of MOLLY SUH",
		img: "https://i.ibb.co/ct8rWm8/1697392942839.jpg",
		description: (
			<p>
				Email Automation Masterclass simplified our workflow.
				<Highlight>Emails are more personal without extra effort.</Highlight>
			</p>
		),
	},
	{
		name: "Madlin Kennedy",
		role: "Founder of BREAZO",
		img: "https://i.ibb.co/s24jh8K/1712779350731.jpg",
		description: (
			<p>
				The SEO workshop was eye-opening!
				<Highlight>More traffic with minimal effort.</Highlight>
			</p>
		),
	},
	{
		name: "Polina Sergeeva",
		role: "Co-Founder of Menstruflow",
		img: "https://i.ibb.co/bs1DRJV/1724417376702.jpg",
		description: (
			<p>
				Conversion Rate Mastery improved our landing pages.
				<Highlight>Great feedback from team and clients.</Highlight>
			</p>
		),
	},
	{
		name: "Naomi Lara Dirlewanger",
		role: "Founder of Hera Organics",
		img: "https://i.ibb.co/56C3fN0/1718294820201.jpg",
		description: (
			<p>
				Email Automation Masterclass eased our process.
				<Highlight>Everything flows better now.</Highlight>
			</p>
		),
	},
	{
		name: "Marie Luise Janknecht",
		role: "Founder of Malunt",
		img: "https://i.ibb.co/GC7JgW5/1698068243925.jpg",
		description: (
			<p>
				SEO workshop was mind-blowing.
				<Highlight>Increased traffic with simple changes.</Highlight>
			</p>
		),
	},
	{
		name: "Marcus Chen",
		role: "Founder of TechFlow",
		img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
		description: (
			<p>
				Pitch Deck Workshop transformed our fundraising.
				<Highlight>Secured seed round in 3 weeks.</Highlight>
			</p>
		),
	},
	{
		name: "Emma Rodriguez",
		role: "CEO of SwiftOps",
		img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
		description: (
			<p>
				Operations Excellence Program streamlined everything.
				<Highlight>Cut costs by 30% instantly.</Highlight>
			</p>
		),
	},
	{
		name: "David Park",
		role: "Founder of InnovateLab",
		img: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg",
		description: (
			<p>
				Financial Modeling Bootcamp was eye-opening.
				<Highlight>Clear path to profitability now.</Highlight>
			</p>
		),
	},
	{
		name: "Sophie Weber",
		role: "Co-Founder of TeamSync",
		img: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
		description: (
			<p>
				Remote Team Management training changed everything.
				<Highlight>Productivity up 45%.</Highlight>
			</p>
		),
	},
	{
		name: "Michael Thompson",
		role: "Founder of ScaleUp",
		img: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
		description: (
			<p>
				Product Strategy Workshop refined our roadmap.
				<Highlight>Launch time cut in half.</Highlight>
			</p>
		),
	},
	{
		name: "James Wilson",
		role: "CEO of VentureX",
		img: "https://images.pexels.com/photos/2379006/pexels-photo-2379006.jpeg",
		description: (
			<p>
				Sales Pipeline Mastery exceeded expectations.
				<Highlight>Doubled conversion rate.</Highlight>
			</p>
		),
	},
];

export default function Testimonials() {
	return (
		<Section
			title='Testimonials'
			subtitle='What our customers are saying'
			className='max-w-8xl'
		>
			<div className='relative mt-6 max-h-screen overflow-hidden'>
				<div className='gap-4 md:columns-2 xl:columns-3 2xl:columns-4'>
					{Array(Math.ceil(testimonials.length / 3))
						.fill(0)
						.map((_, i) => (
							<Marquee
								vertical
								key={i}
								className={cn({
									"[--duration:60s]": i === 1,
									"[--duration:30s]": i === 2,
									"[--duration:70s]": i === 3,
								})}
							>
								{testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
									<motion.div
										key={idx}
										initial={{ opacity: 0 }}
										whileInView={{ opacity: 1 }}
										viewport={{ once: true }}
										transition={{
											delay: Math.random() * 0.8,
											duration: 1.2,
										}}
									>
										<TestimonialCard {...card} />
									</motion.div>
								))}
							</Marquee>
						))}
				</div>
				<div className='from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-20%'></div>
				<div className='from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-20%'></div>
			</div>
		</Section>
	);
}
