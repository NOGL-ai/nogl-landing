"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FormButton from "@/components/atoms/FormButton";
import InputGroup from "@/components/molecules/InputGroup";
import axios from "axios";
import { FaEnvelope, FaSpinner } from "react-icons/fa";
import validateEmail from "@/lib/validateEmail";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const emailInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		emailInputRef.current?.focus();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email) {
			toast.error("Please enter your email address.");
			return;
		}

		if (!validateEmail(email)) {
			toast.error("Please enter a valid email address.");
			return;
		}

		try {
			setLoading(true);
			const res = await axios.post("/api/forgot-password/reset", {
				email,
			});

			if (res.status === 404) {
				toast.error("User not found.");
				setEmail("");
				setLoading(false);
				return;
			}

			if (res.status === 200) {
				toast.success(res.data);
				setLoading(false);
				setEmail("");
			}
		} catch (error: unknown) {
			setLoading(false);
			toast.error(
				error.response?.data || "An error occurred. Please try again."
			);
		}
	};

	return (
		<div className='mx-auto w-full max-w-[400px] py-10'>
			<div className='mb-7.5 text-center'>
				<h3 className='font-satoshi text-heading-5 text-dark mb-4 font-bold dark:text-white'>
					Forgot Password?
				</h3>
				<p className='dark:text-gray-5 text-base'>
					Enter your email address and we'll send you a link to reset your
					password.
				</p>
			</div>

			<form onSubmit={handleSubmit}>
				<div className='space-y-4.5 mb-5'>
					<InputGroup
						label='Email'
						placeholder='Enter your email'
						type='email'
						name='email'
						height='50px'
						handleChange={handleChange}
						value={email}
						icon={<FaEnvelope className='text-tertiary' aria-hidden='true' />}
						ref={emailInputRef}
					/>

					<FormButton height='50px' disabled={loading}>
						{loading ? (
							<>
								Sending
								<FaSpinner className='ml-2 animate-spin' aria-hidden='true' />
							</>
						) : (
							"Send Reset Link"
						)}
					</FormButton>
				</div>

				<p className='font-satoshi text-dark text-center text-base font-medium dark:text-white'>
					Already have an account?{" "}
					<Link href='/auth/signin' className='text-primary ml-1 inline-block'>
						Sign In →
					</Link>
				</p>
			</form>
		</div>
	);
}
