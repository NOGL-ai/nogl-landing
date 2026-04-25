"use client";
import { useState, ChangeEvent, useEffect } from "react";
import FormButton from "@/components/atoms/FormButton";
import InputGroup from "@/components/molecules/InputGroup";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import validateEmail from "@/lib/validateEmail";
import Loader from "../atoms/Loader";

export default function SigninWithMagicLink() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		if (!email) {
			setLoading(false);
			return toast.error("Please enter your email address.");
		}

		if (!validateEmail(email)) {
			setLoading(false);
			return toast.error("Please enter a valid email address.");
		}

		// Honor the active locale on the signin page so the magic-link
		// redirect lands the pilot on /<locale>/dashboard.
		const locale = pathname?.split("/")[1] || "en";

		try {
			const callback = await signIn("email", {
				email,
				redirect: false,
				callbackUrl: `${window.location.origin}/${locale}/dashboard`,
			});

			if (callback?.ok) {
				toast.success("Magic link sent! Check your email.");
				setEmail("");
			} else {
				toast.error("Something went wrong. Please try again.");
			}
		} catch {
			toast.error("Failed to send magic link");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className='mb-5 space-y-4'>
				<InputGroup
					label='Email'
					placeholder='Enter your email'
					type='email'
					name='email'
					required
					height='50px'
					value={email}
					handleChange={handleChange}
				/>

				<FormButton height='50px'>
					{loading ? (
						<>
							Sending <Loader style='border-white dark:border-dark' />
						</>
					) : (
						"Send magic link"
					)}
				</FormButton>
			</div>
		</form>
	);
}
