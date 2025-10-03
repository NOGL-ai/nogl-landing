import React, { useState } from "react";
import FormButton from "@/components/Common/Dashboard/FormButton";
import InputGroup from "@/components/Common/Dashboard/InputGroup";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "../Common/Loader";
// import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import validator from "validator";
// Removed DOMPurify import - using validator for sanitization instead
import zxcvbn from "zxcvbn";
import { debounce } from "lodash";

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
	// const router = useRouter();

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
			name: data.name,
			email: data.email,
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

				// Fix the callback URL encoding
				await signIn("email", {
					email: sanitizedData.email,
					redirect: false,
					// Remove any encoding as NextAuth will handle it
					callbackUrl: `${window.location.origin}`,
				});
			}
		} catch (error: any) {
			console.error("Registration error:", error);
			const errorMessage = error.response?.data
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
		<form onSubmit={handleSubmit} noValidate>
			<div className='mb-5 space-y-4'>
				<InputGroup
					label='Name'
					placeholder='Enter your username'
					maxLength={30}
					type='text'
					name='name'
					required
					height='50px'
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
					height='50px'
					handleChange={handleChange}
					value={data.email}
					error={errors.email}
				/>

				<InputGroup
					label='Password'
					placeholder='Enter your password'
					type='password'
					name='password'
					required
					height='50px'
					handleChange={handleChange}
					value={data.password}
					error={errors.password}
				/>

				{data.password && (
					<>
						<PasswordStrengthMeter password={data.password} />
						<PasswordRequirements password={data.password} />
					</>
				)}

				<FormButton
					height='50px'
					disabled={loading}
					onClick={() => console.log("Button clicked")}
				>
					{loading ? (
						<>
							Signing Up <Loader style='border-white dark:border-dark' />
						</>
					) : (
						"Sign Up"
					)}
				</FormButton>
			</div>
		</form>
	);
};

export default SignupWithPassword;

// PasswordStrengthMeter Component
const PasswordStrengthMeter = ({ password }: { password: string }) => {
	const testResult = zxcvbn(password);
	const num = (testResult.score * 100) / 4;

	const createPasswordLabel = () => {
		switch (testResult.score) {
			case 0:
				return "Very Weak";
			case 1:
				return "Weak";
			case 2:
				return "Fair";
			case 3:
				return "Good";
			case 4:
				return "Strong";
			default:
				return "";
		}
	};

	return (
		<div className='password-strength-meter'>
			<progress
				className={`strength-${testResult.score}`}
				value={num}
				max='100'
			/>
			<p>Password strength: {createPasswordLabel()}</p>
		</div>
	);
};

// Add this new component after PasswordStrengthMeter
const PasswordRequirements = ({ password }: { password: string }) => {
	const requirements = [
		{ text: "At least 8 characters", met: password.length >= 8 },
		{ text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
		{ text: "Contains lowercase letter", met: /[a-z]/.test(password) },
		{ text: "Contains number", met: /\d/.test(password) },
		{ text: "Contains special character", met: /[@$!%*?#&]/.test(password) },
	];

	return (
		<div className='mt-2 text-sm'>
			<p className='text-muted-foreground mb-1'>Password requirements:</p>
			<ul className='space-y-1'>
				{requirements.map((requirement, index) => (
					<li
						key={index}
						className={`flex items-center gap-2 ${
							requirement.met
								? "text-green-600 dark:text-green-400"
								: "text-muted-foreground"
						}`}
					>
						{requirement.met ? "✓" : "○"} {requirement.text}
					</li>
				))}
			</ul>
		</div>
	);
};
