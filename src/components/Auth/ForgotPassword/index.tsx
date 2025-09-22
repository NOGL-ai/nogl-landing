"use client";
import { toast } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FormButton from "@/components/Common/Dashboard/FormButton";
import InputGroup from "@/components/Common/Dashboard/InputGroup";
import axios from "axios";
import { FaEnvelope, FaSpinner } from "react-icons/fa";
import validateEmail from "@/libs/validateEmail";

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
		} catch (error: any) {
			setLoading(false);
			toast.error(error.response?.data || "An error occurred. Please try again.");
		}
	};

	return (
		<div className='mx-auto w-full max-w-[400px] py-10'>
			<div className='mb-7.5 text-center'>
				<h3 className='mb-4 font-satoshi text-heading-5 font-bold text-dark dark:text-white'>
					Forgot Password?
				</h3>
				<p className='text-base dark:text-gray-5'>
					Enter your email address and we'll send you a link to reset your password.
				</p>
			</div>

			<form onSubmit={handleSubmit}>
				<div className='mb-5 space-y-4.5'>
					<InputGroup
						label='Email'
						placeholder='Enter your email'
						type='email'
						name='email'
						height='50px'
						handleChange={handleChange}
						value={email}
						icon={<FaEnvelope className="text-gray-400" aria-hidden="true" />}
						ref={emailInputRef}
					/>

					<FormButton height='50px' disabled={loading}>
						{loading ? (
							<>
								Sending
								<FaSpinner className='animate-spin ml-2' aria-hidden="true" />
							</>
						) : (
							"Send Reset Link"
						)}
					</FormButton>
				</div>

				<p className='text-center font-satoshi text-base font-medium text-dark dark:text-white'>
					Already have an account?{" "}
					<Link
						href='/auth/signin'
						className='ml-1 inline-block text-primary'
					>
						Sign In →
					</Link>
				</p>
			</form>
		</div>
	);
}
