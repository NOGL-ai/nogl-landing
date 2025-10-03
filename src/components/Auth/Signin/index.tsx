"use client";
import Link from "next/link";
import { useState } from "react";
import GoogleSigninButton from "../GoogleSigninButton";
// import GithubSigninButton from "../GithubSigninButton";
import SigninWithMagicLink from "../SigninWithMagicLink";
import SigninWithPassword from "../SigninWithPassword";
import DemoSignin from "./DemoSignin";
import { FaMagic, FaLock } from "react-icons/fa";
import { IconType } from "react-icons";

export default function Signin() {
	const [signinOption, setSigninOption] = useState<"magic-link" | "password">(
		"magic-link"
	);

	const renderSignInComponent = () => {
		return signinOption === "magic-link" ? (
			<SigninWithMagicLink />
		) : (
			<SigninWithPassword />
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
		<>
			<div className='mx-auto w-full max-w-[400px] px-4 py-10'>
				<div className='pb-7.5 space-y-3'>
					<GoogleSigninButton text='Sign in' />

					{/* <GithubSigninButton text="Sign in" /> */}
				</div>
				<div className='mb-7.5 flex items-center justify-center'>
					<span className='bg-stroke dark:bg-stroke-dark block h-px w-full'></span>
					<div className='text-body dark:text-gray-5 inline-block bg-white px-3 text-base dark:bg-[#151F34]'>
						OR
					</div>
					<span className='bg-stroke dark:bg-stroke-dark block h-px w-full'></span>
				</div>

				<div className='mb-4.5 rounded-10 border-stroke dark:border-stroke-dark flex w-full items-center justify-between gap-1.5 border p-1'>
					{options.map((option) => {
						const Icon = option.icon;
						return (
							<button
								key={option.value}
								onClick={() => setSigninOption(option.value)}
								className={`font-satoshi flex h-[38px] w-full items-center justify-center gap-2 rounded-lg text-base font-medium tracking-[-.2px] ${
									signinOption === option.value
										? "bg-primary/[.08] text-primary"
										: "text-dark dark:text-white"
								}`}
							>
								<Icon /> {option.label}
							</button>
						);
					})}
				</div>

				<div>{renderSignInComponent()}</div>

				<p className='font-satoshi text-dark mt-6 text-center text-base font-medium dark:text-white'>
					Don't have an account?{" "}
					<Link
						href='/auth/signup'
						className='text-primary ml-1 inline-block hover:underline'
					>
						Sign Up →
					</Link>
				</p>

				<span className='bg-stroke dark:bg-stroke-dark my-10 block h-px w-full '></span>

				<DemoSignin />
			</div>
		</>
	);
}
