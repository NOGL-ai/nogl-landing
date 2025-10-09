"use client";
import React, { useState } from "react";
import FormButton from "@/components/atoms/FormButton";
import InputGroup from "@/components/molecules/InputGroup";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "../atoms/Loader";
import { signIn } from "next-auth/react";
import validator from "validator";
import { debounce } from "lodash";
import { GoogleSigninButton } from "../atoms";

const SignupWithPassword = () => {
	const [data, setData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [loading, setLoading] = useState(false);

	// Handle input changes and validation
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setData((prev) => ({ ...prev, [name]: value }));
		validateField(name, value);

		if (name === "email") {
			validateEmailDebounced(value);
		}
	};

	// Validate individual fields
	const validateField = (name: string, value: string) => {
		let error = "";

		switch (name) {
			case "name":
				if (!value.trim()) {
					error = "Name is required.";
				} else if (value.trim().length < 2) {
					error = "Name must be at least 2 characters long.";
				} else if (value.trim().length > 30) {
					error = "Name must be less than 30 characters.";
				} else if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
					error =
						"Name can only contain letters, numbers, spaces, hyphens and underscores.";
				}
				break;
			case "email":
				if (!value) {
					error = "Email is required.";
				} else if (!validator.isEmail(value)) {
					error = "Please enter a valid email address.";
				} else if (value.length > 100) {
					error = "Email must be less than 100 characters.";
				}
				break;
			case "password":
				if (!value) {
					error = "Password is required.";
				} else if (value.length < 8) {
					error = "Password must be at least 8 characters long.";
				} else if (!isStrongPassword(value)) {
					error =
						"Password must include uppercase, lowercase, number, and special character.";
				}
				break;
			default:
				break;
		}

		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	// Validate the entire form
	const isFormValid = () => {
		const { name, email, password } = data;
		const newErrors = {
			name: "",
			email: "",
			password: "",
		};

		let isValid = true;

		if (!name.trim()) {
			newErrors.name = "Name is required.";
			isValid = false;
		} else if (name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters long.";
			isValid = false;
		}

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
		} else if (!isStrongPassword(password)) {
			newErrors.password =
				"Password must include uppercase, lowercase, number, and special character.";
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	// Check password strength
	const isStrongPassword = (password: string) => {
		const strongPasswordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
		return strongPasswordRegex.test(password);
	};

	// Sanitize data before submission
	const sanitizeData = () => {
		return {
			name: data.name.trim(),
			email: data.email.trim(),
			password: data.password,
		};
	};

	// Add debounced email validation
	const validateEmailDebounced = debounce(async (email: string) => {
		if (validator.isEmail(email)) {
			try {
				const response = await axios.get(
					`/api/user/check-email?email=${encodeURIComponent(email)}`
				);
				if (response.data.exists) {
					setErrors((prev) => ({
						...prev,
						email: "This email is already registered.",
					}));
				}
			} catch (error) {
				console.error("Email validation error:", error);
			}
		}
	}, 500);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isFormValid()) {
			return;
		}

		setLoading(true);

		try {
			const sanitizedData = sanitizeData();

			// Register the user
			const res = await axios.post("/api/user/register", sanitizedData);

			if (res.status === 200) {
				toast.success("Please check your email for verification link");
				setData({ name: "", email: "", password: "" });
				setErrors({ name: "", email: "", password: "" });

				// Sign in with magic link
				await signIn("email", {
					email: sanitizedData.email,
					redirect: false,
					callbackUrl: `${window.location.origin}`,
				});
			}
		} catch (error: unknown) {
			console.error("Registration error:", error);
			const errorMessage = axios.isAxiosError(error) && error.response?.data
				? typeof error.response.data === "string"
					? error.response.data
					: JSON.stringify(error.response.data)
				: "An error occurred during registration";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className='flex w-full flex-col gap-6' onSubmit={handleSubmit} noValidate>
			<div className='flex w-full flex-col gap-5'>
				{errors.name && errors.email && errors.password && (
					<div className='rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'>
						Please fix the errors below
					</div>
				)}

				<InputGroup
					label='Name'
					placeholder='Enter your name'
					maxlength={30}
					type='text'
					name='name'
					required
					height='44px'
					handleChange={handleChange}
					value={data.name}
					error={errors.name}
				/>

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

				<div className='flex w-full flex-col gap-1.5'>
					<InputGroup
						label='Password'
						placeholder='Create a password'
						type='password'
						name='password'
						required
						height='44px'
						handleChange={handleChange}
						value={data.password}
						error={errors.password}
					/>
					<p className='text-[14px] font-normal leading-5 text-[#535862] dark:text-gray-300'>
						Must be at least 8 characters.
					</p>
				</div>
			</div>

			<div className='flex w-full flex-col gap-4'>
				<FormButton height='44px' disabled={loading}>
					{loading ? (
						<>
							Get started <Loader style='dark:border-primary border-white' />
						</>
					) : (
						"Get started"
					)}
				</FormButton>

				<GoogleSigninButton text="Sign up with Google" />
			</div>
		</form>
	);
};

export default SignupWithPassword;
