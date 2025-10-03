"use client";
import { useState } from "react";
import Link from "next/link";
// import GithubSigninButton from "../../atoms/GithubSigninButton";
import GoogleSigninButton from "../../atoms/GoogleSigninButton";
import SigninWithMagicLink from "../../molecules/SigninWithMagicLink";
import SignupWithPassword from "../../molecules/SignupWithPassword";
import { FaMagic, FaLock } from "react-icons/fa";
import { IconType } from "react-icons";

export default function Signup() {
	const [signinOption, setSigninOption] = useState<"magic-link" | "password">(
		"magic-link"
	);

	const renderSignInComponent = () => {
		return signinOption === "magic-link" ? (
			<SigninWithMagicLink />
		) : (
			<SignupWithPassword />
		);
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
		<div className='mx-auto w-full max-w-[400px] px-4 py-10'>
			{/* OAuth Sign-up Options */}
			<div className='pb-7.5 space-y-3'>
				<GoogleSigninButton text='Sign up with Google' />
				{/* Uncomment if using GitHub sign-in */}
				{/* <GithubSigninButton text="Sign up with GitHub" /> */}
			</div>

			{/* Divider */}
			<div className='my-7.5 flex items-center justify-center'>
				<span className='bg-stroke dark:bg-stroke-dark block h-px w-full'></span>
				<div className='text-body dark:text-gray-5 inline-block bg-white px-3 text-base dark:bg-[#151F34]'>
					OR
				</div>
				<span className='bg-stroke dark:bg-stroke-dark block h-px w-full'></span>
			</div>

			{/* Sign-in Option Selector */}
			<div className='mb-4.5 rounded-10 border-stroke dark:border-stroke-dark flex w-full items-center justify-between gap-1.5 border p-1'>
				{options.map((option) => {
					const Icon = option.icon;
					return (
						<button
							key={option.value}
							onClick={() => setSigninOption(option.value)}
							className={`font-satoshi flex h-[38px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-base font-medium tracking-[-.2px] transition-colors duration-200 ${
								signinOption === option.value
									? "bg-primary/[.08] text-primary"
									: "text-dark hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
							}`}
							aria-label={`Sign up with ${option.label}`}
						>
							<Icon aria-hidden='true' /> {option.label}
						</button>
					);
				})}
			</div>

			{/* Dynamic Sign-in Component */}
			<div>{renderSignInComponent()}</div>

			{/* Sign-in Link */}
			<p className='font-satoshi text-dark mt-6 text-center text-base font-medium dark:text-white'>
				Already have an account?{" "}
				<Link
					href='/auth/signin'
					className='text-primary ml-1 inline-block hover:underline'
				>
					Sign In →
				</Link>
			</p>
		</div>
	);
}
