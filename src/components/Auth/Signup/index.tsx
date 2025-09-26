"use client";
import { useState } from "react";
import Link from "next/link";
// import GithubSigninButton from "../GithubSigninButton";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithMagicLink from "../SigninWithMagicLink";
import SignupWithPassword from "../SignupWithPassword";
import { FaMagic, FaLock } from "react-icons/fa";
import { IconType } from "react-icons";

export default function Signup() {
	const [signinOption, setSigninOption] = useState<"magic-link" | "password">("magic-link");

	const renderSignInComponent = () => {
		return signinOption === "magic-link" ? <SigninWithMagicLink /> : <SignupWithPassword />;
	};

	type SigninOption = {
		value: "magic-link" | "password";
		label: string;
		icon: IconType;
	};

	const options: SigninOption[] = [
		{
			value: "magic-link",
			label: "Magic Link",
			icon: FaMagic,
		},
		{
			value: "password",
			label: "Email & Password",
			icon: FaLock,
		},
	];

	return (
		<div className="mx-auto w-full max-w-[400px] px-4 py-10">
			{/* OAuth Sign-up Options */}
			<div className="space-y-3 pb-7.5">
				<GoogleSigninButton text="Sign up with Google" />
				{/* Uncomment if using GitHub sign-in */}
				{/* <GithubSigninButton text="Sign up with GitHub" /> */}
			</div>

			{/* Divider */}
			<div className="my-7.5 flex items-center justify-center">
				<span className="block h-px w-full bg-stroke dark:bg-stroke-dark"></span>
				<div className="inline-block bg-white px-3 text-base text-body dark:bg-[#151F34] dark:text-gray-5">OR</div>
				<span className="block h-px w-full bg-stroke dark:bg-stroke-dark"></span>
			</div>

			{/* Sign-in Option Selector */}
			<div className="mb-4.5 flex w-full items-center justify-between gap-1.5 rounded-10 border border-stroke p-1 dark:border-stroke-dark">
				{options.map((option) => {
					const Icon = option.icon;
					return (
						<button
							key={option.value}
							onClick={() => setSigninOption(option.value)}
							className={`flex items-center justify-center gap-2 h-[38px] w-full rounded-lg font-satoshi text-base font-medium tracking-[-.2px] transition-colors duration-200 cursor-pointer ${
								signinOption === option.value
									? "bg-primary/[.08] text-primary"
									: "text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							}`}
							aria-label={`Sign up with ${option.label}`}
						>
							<Icon aria-hidden="true" /> {option.label}
						</button>
					);
				})}
			</div>

			{/* Dynamic Sign-in Component */}
			<div>{renderSignInComponent()}</div>

			{/* Sign-in Link */}
			<p className="text-center font-satoshi text-base font-medium text-dark dark:text-white mt-6">
				Already have an account?{" "}
				<Link href="/auth/signin" className="ml-1 inline-block text-primary hover:underline">
					Sign In →
				</Link>
			</p>
		</div>
	);
}
