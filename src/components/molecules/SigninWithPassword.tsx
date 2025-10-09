"use client";
import { useState } from "react";
import Link from "next/link";
import FormButton from "@/components/atoms/FormButton";
import InputGroup from "@/components/molecules/InputGroup";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "../atoms/Loader";
import validator from "validator";
// Removed DOMPurify import - using validator for sanitization instead

export default function SigninWithPassword() {
	const [data, setData] = useState({
		email: "",
		password: "",
		remember: false,
	});

	const [errors, setErrors] = useState({
		email: "",
		password: "",
		general: "",
	});

	const [loading, setLoading] = useState(false);

	const router = useRouter();

	// Handle input changes and validation
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, checked, type } = e.target;
		const fieldValue = type === "checkbox" ? checked : value;
		setData((prev) => ({ ...prev, [name]: fieldValue }));
		validateField(name, fieldValue);
	};

	// Validate individual fields
	const validateField = (name: string, value: string | boolean) => {
		let error = "";

		if (name === "email") {
			if (!value) {
				error = "Email is required.";
			} else if (!validator.isEmail(value as string)) {
				error = "Invalid email address.";
			}
		} else if (name === "password") {
			if (!value) {
				error = "Password is required.";
			} else if ((value as string).length < 8) {
				error = "Password must be at least 8 characters long.";
			}
		}

		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	// Validate the entire form
	const isFormValid = () => {
		const { email, password } = data;
		const newErrors = {
			email: "",
			password: "",
			general: "",
		};

		let isValid = true;

		if (!email) {
			newErrors.email = "Email is required.";
			isValid = false;
		} else if (!validator.isEmail(email)) {
			newErrors.email = "Invalid email address.";
			isValid = false;
		}

		if (!password) {
			newErrors.password = "Password is required.";
			isValid = false;
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters long.";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	// Sanitize data before submission
	const sanitizeData = () => {
		return {
			email: data.email,
			password: data.password,
			remember: data.remember,
		};
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isFormValid()) return;

		setLoading(true);
		setErrors((prev) => ({ ...prev, general: "" }));

		const sanitizedData = sanitizeData();

		const callback = await signIn("credentials", {
			...sanitizedData,
			redirect: false,
		});

		if (callback?.error) {
			setErrors((prev) => ({ ...prev, general: callback.error || "" }));
			setLoading(false);
		}

		if (callback?.ok && !callback?.error) {
			toast.success("Logged in successfully");
			setLoading(false);
			setData({ email: "", password: "", remember: false });
			setErrors({ email: "", password: "", general: "" });
			router.push("/admin");
		}
	};

	return (
		<form className='flex w-full flex-col gap-5' onSubmit={handleSubmit} noValidate>
			{errors.general && (
				<div className='rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
					{errors.general}
				</div>
			)}

			<InputGroup
				label='Email'
				placeholder='Enter your email'
				type='email'
				name='email'
				required
				height='44px'
				handleChange={handleChange}
				value={data.email}
				error={errors.email}
			/>

			<InputGroup
				label='Password'
				placeholder='••••••••'
				type='password'
				name='password'
				required
				height='44px'
				handleChange={handleChange}
				value={data.password}
				error={errors.password}
			/>

			<div className='flex w-full items-center justify-between'>
				<label
					htmlFor='remember'
					className='flex cursor-pointer select-none items-center gap-2'
				>
					<input
						type='checkbox'
						name='remember'
						id='remember'
						className='peer sr-only'
						onChange={handleChange}
						checked={data.remember}
					/>
					<span
						className={`flex size-4 items-center justify-center rounded border border-[#d5d7da] bg-white dark:border-stroke-dark dark:bg-white/5 ${
							data.remember ? "border-[#7f56d9] bg-[#7f56d9]" : ""
						}`}
					>
						{data.remember && (
							<svg
								className="size-3"
								viewBox="0 0 12 12"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10 3L4.5 8.5L2 6"
									stroke="white"
									strokeWidth="1.6666"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						)}
					</span>
					<span className='text-sm font-medium leading-5 text-[#414651] dark:text-white'>
						Remember for 30 days
					</span>
				</label>

				<Link
					href='/auth/forgot-password'
					className='text-sm font-semibold leading-5 text-[#6941c6] hover:underline'
				>
					Forgot password
				</Link>
			</div>

			<FormButton height='44px' disabled={loading}>
				{loading ? (
					<>
						Signing in <Loader style='dark:border-primary border-white' />
					</>
				) : (
					"Sign in"
				)}
			</FormButton>
		</form>
	);
}
