"use client";
import axios from "axios";
import { Price } from "@/types/priceItem";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type Props = {
	plan: Price;
	isBilling?: boolean;
	subscriptionPlan?: any;
};

const PriceItem = ({ plan, isBilling }: Props) => {
	const { data: session, update } = useSession();
	const user = session?.user;

	const handleSubscription = () => {
		let redirectPath = "/thank-you";
		if (user) {
			redirectPath = "/user/billing";
		}

		window.Paddle?.Checkout?.open({
			items: [
				{
					priceId: plan.priceId,
					quantity: 1,
				},
			],
			disableLogout: true,
			successUrl: `${window.location.origin}${redirectPath}`,
			cancelUrl: `${window.location.origin}${redirectPath}`,
		});
	};

	const handleChangeSubscription = async () => {
		try {
			const response = await axios.post(`/api/paddle/change-plan`, {
				priceId: plan.priceId,
				subscriptionId: (user as any)?.subscriptionId,
			});

			await update({
				...session,
				user: {
					...session?.user,
					priceId: plan.priceId,
					subscriptionId: response.data.subscriptionId,
					currentPeriodEnd: response.data.currentPeriodEnd,
				},
			});

			toast.success("Subscription changed successfully");
			window.location.reload();
		} catch {
			toast.error("Unable to change subscription");
		}
	};

	const handler = user?.priceId ? handleChangeSubscription : handleSubscription;

	const active = plan?.active;
	const isSubscribed = session && session?.user?.priceId === plan?.priceId;

	const activeStyle =
		active && !isBilling
			? "bg-white text-black"
			: "bg-primary text-white hover:bg-primary-dark";

	return (
		<div
			className={`shadow-dropdown  relative rounded-[20px] p-10 ${
				active && !isBilling ? "bg-primary" : "dark:bg-gray-dark bg-white"
			}`}
		>
			{active && (
				<span
					className={`right-4.5 top-4.5 font-satoshi absolute inline-flex rounded-[5px] px-3 py-[5px] font-medium  ${
						isBilling
							? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
							: "bg-white/10 text-white"
					}`}
				>
					Popular
				</span>
			)}

			<div className='mb-7 flex items-center gap-5'>
				<div
					className={`h-18 flex w-full max-w-[72px] items-center justify-center rounded-2xl ${
						active && !isBilling ? "bg-white/10" : "bg-primary/10"
					}`}
				>
					{plan?.icon2 && isBilling ? (
						<Image
							src={plan?.icon2}
							alt={plan?.nickname}
							width={34}
							height={34}
						/>
					) : (
						<Image
							src={plan?.icon}
							alt={plan?.nickname}
							width={34}
							height={34}
						/>
					)}
				</div>
				<div>
					<span
						className={`dark:text-gray-4 block text-lg font-medium ${
							active && !isBilling && "text-white"
						}`}
					>
						{plan?.subtitle}
					</span>
					<h3
						className={`font-satoshi text-2xl font-bold ${
							active && !isBilling ? "text-white" : "text-black dark:text-white"
						}`}
					>
						{plan.nickname}
					</h3>
				</div>
			</div>

			<p className={active && !isBilling ? "text-white" : "dark:text-gray-4"}>
				{plan?.description}
			</p>

			{/* <!-- divider --> */}
			<div
				className={`my-6 h-px w-full ${
					active && !isBilling ? "bg-white/30" : "bg-stroke dark:bg-stroke-dark"
				}`}
			></div>

			<h4
				className={`mb-4.5 font-satoshi text-heading-4 lg:text-heading-2 font-bold leading-[1.22] xl:text-[54px] ${
					active && !isBilling ? "text-white" : "text-[#170F49] dark:text-white"
				}`}
			>
				${plan?.unit_amount / 100}
				<span
					className={`ml-1 text-xl font-medium -tracking-[0.3px] ${
						active && !isBilling ? "text-white" : "text-gray-6 dark:text-white"
					}`}
				>
					/monthly
				</span>
			</h4>

			<h5
				className={`mb-7.5 font-satoshi text-lg font-bold -tracking-[0.2px] dark:text-white ${
					active && !isBilling ? "text-white" : "text-black"
				}`}
			>
				What&apos;s included
			</h5>

			<ul className='flex flex-col gap-3'>
				{plan?.includes.map((feature, key) => (
					<li className='flex items-center gap-3' key={key}>
						<span>
							<svg
								width='22'
								height='22'
								viewBox='0 0 22 22'
								fill='none'
								className={
									active && !isBilling
										? "text-white"
										: "text-primary dark:text-white"
								}
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M20.1668 11C20.1668 16.0626 16.0628 20.1667 11.0002 20.1667C5.93755 20.1667 1.8335 16.0626 1.8335 11C1.8335 5.9374 5.93755 1.83334 11.0002 1.83334C16.0628 1.83334 20.1668 5.9374 20.1668 11ZM14.6946 8.22221C14.9631 8.49069 14.9631 8.92599 14.6946 9.19448L10.1113 13.7778C9.84281 14.0463 9.40751 14.0463 9.13903 13.7778L7.30569 11.9445C7.03721 11.676 7.03721 11.2407 7.30569 10.9722C7.57418 10.7037 8.00948 10.7037 8.27797 10.9722L9.62516 12.3194L11.6738 10.2708L13.7224 8.22221C13.9908 7.95372 14.4261 7.95372 14.6946 8.22221Z'
									fill='currentColor'
								/>
							</svg>
						</span>
						<span
							className={
								active && !isBilling
									? `text-white`
									: "text-black dark:text-white"
							}
						>
							{feature}
						</span>
					</li>
				))}
			</ul>

			<button
				onClick={handler}
				className={`font-satoshi mt-9 flex w-full justify-center  rounded-full p-3.5 font-medium ${
					isSubscribed && isBilling
						? "bg-gray-3 text-dark hover:bg-gray-4"
						: activeStyle
				} ${isSubscribed && "cursor-not-allowed"}`}
				disabled={!isSubscribed ? false : true}
			>
				{isSubscribed ? "Current Plan" : `Upgrade to ${plan?.nickname}`}
			</button>

			{/* use different buttons for billing and home page  */}
		</div>
	);
};

export default PriceItem;
