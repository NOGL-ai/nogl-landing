"use client";
import React from "react";
import { CheckIcon } from "lucide-react";
import ShimmerButton from "@/components/ui/shimmer-button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { pricingData } from "@/pricing/pricingData";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Price } from "@/types/priceItem";
import { useRouter } from "next/navigation";
import { Route } from "next";

interface SubscriptionProps {
	priceId?: string;
	userId?: string;
	isSubscribed?: boolean;
}

const PlanCard = ({
	plan,
	isBilling: _isBilling = false,
}: {
	plan: Price;
	isBilling?: boolean;
}) => {
	const { data: session } = useSession();
	const user = session?.user;
	const router = useRouter();

	const handleClick = () => {
		router.push("/auth/sign-up" as Route);
	};

	const handleSubscription = async () => {
		let subsProp: SubscriptionProps = {
			priceId: plan.priceId,
		};

		if (session) {
			const isSubscribed: boolean = !!(
				user?.priceId &&
				user?.currentPeriodEnd &&
				user?.currentPeriodEnd.getTime() + 86_400_000 > Date.now()
			);

			subsProp = {
				userId: session?.user?.id,
				priceId: plan.priceId,
				isSubscribed,
			};
		}

		try {
			const res = await axios.post("/api/stripe/payment", subsProp);
			const checkOutSession = res.data;
			if (checkOutSession?.url) {
				window.location.href = checkOutSession.url;
			}
		} catch (err) {
			console.error((err as Error).message);
		}
	};

	const isSubscribed = session && user?.priceId === plan.priceId;
	const active = plan?.active;

	return (
		<Card className={`relative ${active ? "border-primary border-2" : ""}`}>
			{active && (
				<div className='bg-primary text-primary-foreground absolute right-0 top-0 rounded-bl-lg rounded-tr-lg px-3 py-1'>
					Coming Soon
				</div>
			)}
			<CardHeader>
				<CardTitle>{plan.nickname}</CardTitle>
				<CardDescription>{plan.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='mb-6 flex items-baseline'>
					<span className='text-4xl font-bold'>
						{plan.unit_amount === 0 ? "Free" : `$${plan.unit_amount / 100}`}
					</span>
					{plan.unit_amount > 0 && (
						<span className='text-muted-foreground ml-2 text-sm'>/month</span>
					)}
				</div>
				<ul className='mb-8 space-y-2'>
					{plan.includes.map((feature, i) => (
						<li key={i} className='flex items-center'>
							<CheckIcon className='text-primary mr-2 h-5 w-5' />
							<span className='font-medium'>{feature}</span>
						</li>
					))}
				</ul>
				<ShimmerButton
					className='w-full text-white dark:text-white'
					onClick={() => (window.location.href = "/auth/signup")}
				>
					{plan.unit_amount === 0
						? "Start Your Journey Free →"
						: "Start Growing Today →"}
				</ShimmerButton>
			</CardContent>
		</Card>
	);
};

export function Pricing({ isBilling = false }: { isBilling?: boolean }) {
	const regularPlans = pricingData.slice(0, 2);
	const expertPlan = pricingData[2];

	return (
		<section id='pricing'>
			{!isBilling && (
				<div className='mx-auto space-y-4 py-6 text-center'>
					<h2 className='text-primary font-mono text-[42px] font-medium tracking-tighter'>
						Start Free, Go Pro, or Join Community
					</h2>
					<h4 className='text-muted-foreground mx-auto mb-2 max-w-3xl text-balance text-[16px] font-normal'>
						Choose the plan that suits your learning style. Start for free,
						subscribe for more features, or purchase individual sessions as
						needed.
					</h4>
				</div>
			)}
			<div className='mx-auto flex max-w-5xl flex-col items-center justify-center gap-y-5 py-12 md:py-20'>
				<div className='w-full px-4 md:px-6'>
					<div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
						{regularPlans.map((plan, index) => (
							<PlanCard key={index} plan={plan} isBilling={isBilling} />
						))}
					</div>
				</div>
				<div className='w-full px-4 md:px-6'>
					<Card className='flex items-center justify-between overflow-hidden'>
						<CardContent className='p-6 md:p-8'>
							<CardTitle className='mb-2 text-2xl'>
								{expertPlan.nickname}
							</CardTitle>
							<CardDescription className='mb-6'>
								{expertPlan.description}
							</CardDescription>
							<ShimmerButton
								className='text-white dark:text-white'
								onClick={() =>
									(window.location.href = "https://empowhernetwork.de")
								}
							>
								Join Our Community →
							</ShimmerButton>
						</CardContent>
						<div className="relative isolate hidden h-[240px] w-full before:absolute before:left-32 before:top-0 before:z-[-1] before:h-full before:w-full before:skew-x-[-45deg] before:border-l before:border-gray-200 before:bg-gray-100 before:content-[''] md:block lg:w-2/3 dark:before:border-gray-800 dark:before:bg-gray-900">
							<div className='ml-12 flex h-full w-full flex-col items-center justify-center gap-y-0.5'>
								<h1 className='text-4xl font-bold'>Join Our Community</h1>
								<p className='text-center text-gray-500 dark:text-gray-400'>
									Continuous guidance from forecasting specialists
									<br />
									in our private WhatsApp community
								</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</section>
	);
}

export default Pricing;
