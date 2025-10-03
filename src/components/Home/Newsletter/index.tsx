"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import axios from "axios";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";

// Add this type declaration at the top of your file
declare global {
	interface Window {
		dojoRequire: ((modules: string[], callback: (loader: MailchimpLoader) => void) => void) | undefined;
		mcjs: unknown; // Add this if you're using other Mailchimp features
	}
}

interface MailchimpLoader {
	start: (config: {
		baseUrl: string;
		uuid: string;
		lid: string;
		uniqueMethods: boolean;
	}) => void;
}

interface NewsletterProps {
	dictionary: {
		newsletter: {
			title: string;
			description: string;
			emailPlaceholder: string;
			buttonText: string;
			successMessage: string;
			errorMessage: string;
			invalidEmailMessage: string;
		};
	};
}

export default function Newsletter({ dictionary }: NewsletterProps) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [hasSeenPopup, setHasSeenPopup] = useState(true); // Start true to prevent flash

	useEffect(() => {
		// Check if user has seen the popup before
		const popupSeen = Cookies.get("mailchimp_popup_seen");
		if (!popupSeen) {
			setHasSeenPopup(false);
			// Set cookie that expires in 30 days
			Cookies.set("mailchimp_popup_seen", "true", { expires: 30 });
		}
	}, []);

	// Add Mailchimp popup script
	useEffect(() => {
		if (!hasSeenPopup && window.dojoRequire) {
			window.dojoRequire(["mojo/signup-forms/Loader"], function (L) {
				L.start({
					baseUrl: "us16.list-manage.com",
					uuid: "730e2a5d4570de0714aa9bc71",
					lid: "f6c410cdc0",
					uniqueMethods: true,
				});
			});
		}
	}, [hasSeenPopup]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		if (!email || email === "") {
			toast.error(dictionary.newsletter.errorMessage);
			setIsLoading(false);
			return;
		}

		// Simple email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toast.error(dictionary.newsletter.invalidEmailMessage);
			setIsLoading(false);
			return;
		}

		try {
			const res = await axios.post("/api/newsletter", { email });

			if (res.data.status === 400) {
				toast.error(res.data?.title);
				setEmail("");
			} else {
				toast.success(dictionary.newsletter.successMessage);
				setEmail("");
			}
		} catch (error: any) {
			// Fix: handle error object safely and show appropriate error message
			const errorMessage =
				error?.response?.data?.title ||
				error?.response?.data?.message ||
				error?.response?.data ||
				dictionary.newsletter.errorMessage;
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Remove this block since it's already in layout.tsx
      {!hasSeenPopup && (
        <Script
          id="mcjs"
          strategy="afterInteractive"
          src="https://chimpstatic.com/mcjs-connected/js/users/730e2a5d4570de0714aa9bc71/c2b0a256050dd1866548b97fd.js"
          onLoad={() => {

          }}
          onError={(e) => {
            console.error('Error loading Mailchimp script:', e);
          }}
        />
      )} */}

			<section className='md:py-17.5 relative z-[5] overflow-hidden py-10 pt-32 sm:py-12 lg:py-[100px]'>
				<div className='container mx-auto flex flex-col items-center justify-center'>
					{/* Newsletter Content */}
					<div className='flex w-full max-w-2xl flex-col gap-6 px-4 sm:px-6 lg:px-0'>
						<div className='mx-auto flex max-w-[590px] flex-col gap-4 text-center'>
							<h2 className='font-satoshi mb-4 text-2xl font-bold text-black sm:mb-5 sm:text-3xl lg:text-4xl dark:text-white'>
								{dictionary.newsletter.title}
							</h2>
							<p className='mb-8 text-base text-gray-600 sm:mb-10 dark:text-gray-300'>
								{dictionary.newsletter.description}
							</p>
						</div>

						<form
							onSubmit={handleSubmit}
							className='relative mx-auto flex w-full max-w-[490px] flex-wrap'
						>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
								type='email'
								placeholder={dictionary.newsletter.emailPlaceholder}
								className='h-12 w-full rounded-full border border-gray-200 bg-gray-100 px-5 pr-[110px] text-sm text-gray-900 placeholder-gray-500 outline-none sm:pr-[120px] sm:text-base dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400'
								aria-label={dictionary.newsletter.emailPlaceholder}
							/>
							<div className='absolute right-1 top-1'>
								<AnimatedSubscribeButton
									isLoading={isLoading}
									className='h-10 min-w-[90px] bg-black text-sm text-white hover:bg-gray-800 sm:min-w-[100px] sm:text-base dark:bg-white dark:text-black dark:hover:bg-gray-100'
								>
									<span className='hidden sm:inline'>
										{dictionary.newsletter.buttonText}
									</span>
									<span className='sm:hidden'>
										{dictionary.newsletter.buttonText}
									</span>
								</AnimatedSubscribeButton>
							</div>
						</form>
					</div>
				</div>
			</section>
		</>
	);
}
