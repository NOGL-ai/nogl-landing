"use client";

import React, { useState } from "react";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import toast from "react-hot-toast";
import axios from "axios";

export interface SimpleNewsletterProps {
	title?: string;
	description?: string;
	placeholder?: string;
	buttonText?: string;
	className?: string;
	// Styling variants
	variant?: "default" | "glassmorphic" | "minimal";
	// Layout options
	layout?: "stacked" | "inline";
}

const SimpleNewsletter: React.FC<SimpleNewsletterProps> = ({
	title = "Stay Updated",
	description = "Get the latest updates and insights delivered to your inbox.",
	placeholder = "Enter your email",
	buttonText = "Subscribe",
	className = "",
	variant = "default",
	layout = "stacked",
}) => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		if (!email || email === "") {
			toast.error("Please enter your email address");
			setIsLoading(false);
			return;
		}

		// Simple email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toast.error("Please enter a valid email address");
			setIsLoading(false);
			return;
		}

		try {
			const res = await axios.post("/api/newsletter", { email });

			if (res.data.status === 400) {
				toast.error(res.data?.title || "Something went wrong");
				setEmail("");
			} else {
				toast.success("Successfully subscribed to newsletter!");
				setEmail("");
			}
		} catch (error: unknown) {
			toast.error(
				error.response?.data?.message ||
					"Failed to subscribe. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Variant styles
	const getVariantStyles = () => {
		switch (variant) {
			case "glassmorphic":
				return {
					container:
						"bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-8",
					title: "text-white dark:text-white",
					description: "text-white/80 dark:text-white/70",
					input:
						"bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 text-white dark:text-white placeholder-white/60 dark:placeholder-white/50 backdrop-blur-sm",
				};
			case "minimal":
				return {
					container: "bg-transparent",
					title: "text-primary",
					description: "text-tertiary dark:text-tertiary",
					input:
						"bg-white dark:bg-secondary_bg border-border dark:border-border text-primary placeholder:text-tertiary",
				};
			default:
				return {
					container: "bg-secondary_bg dark:bg-secondary_bg rounded-2xl p-8",
					title: "text-primary",
					description: "text-tertiary dark:text-tertiary",
					input:
						"bg-white border-border dark:border-border text-primary placeholder:text-tertiary",
				};
		}
	};

	const styles = getVariantStyles();

	return (
		<div className={`${styles.container} ${className}`}>
			<div
				className={
					layout === "stacked"
						? "text-center"
						: "flex items-center justify-between gap-8"
				}
			>
				<div className={layout === "stacked" ? "mb-6" : "flex-1"}>
					<h3 className={`mb-2 text-2xl font-bold ${styles.title}`}>{title}</h3>
					<p className={`${styles.description}`}>{description}</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className={`${layout === "stacked" ? "mx-auto flex max-w-md flex-col gap-4 sm:flex-row" : "flex flex-shrink-0 gap-4"}`}
				>
					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder={placeholder}
						className={`focus:ring-primary-500 flex-1 rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 ${styles.input}`}
						required
					/>
					<button
						type='submit'
						disabled={isLoading}
						className='bg-primary-600 hover:bg-primary-700 whitespace-nowrap rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200 disabled:opacity-50'
					>
						{buttonText}
					</button>
				</form>
			</div>
		</div>
	);
};

export default SimpleNewsletter;
