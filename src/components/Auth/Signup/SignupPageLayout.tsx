"use client";
import { useState } from "react";
import Link from "next/link";
import { Route } from "@/routers/types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
// import Image from "next/image";
import GoogleSigninButton from "../GoogleSigninButton";

// Validation schema
const signupSchema = yup.object().shape({
	firstName: yup
		.string()
		.required("Name is required")
		.min(2, "Name must be at least 2 characters")
		.max(30, "Name must be less than 30 characters"),
	lastName: yup
		.string()
		.required("Last name is required")
		.min(2, "Last name must be at least 2 characters")
		.max(30, "Last name must be less than 30 characters"),
	email: yup
		.string()
		.required("Email is required")
		.email("Please enter a valid email address")
		.max(100, "Email must be less than 100 characters"),
	password: yup
		.string()
		.required("Password is required")
		.min(8, "Password must be at least 8 characters")
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]/,
			"Password must include uppercase, lowercase, number, and special character"
		),
	termsAccepted: yup
		.boolean()
		.oneOf([true], "You must agree to the terms of use and privacy policy"),
	newsletter: yup.boolean(),
	recaptcha: yup
		.boolean()
		.oneOf([true], "Please complete the reCAPTCHA verification"),
});

type FormData = yup.InferType<typeof signupSchema>;

// NOGL Logo Component
const _NoglLogo = () => (
	<svg
		width='220'
		height='32'
		viewBox='0 0 178 40'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='flex-shrink-0'
	>
		{/* Blue path */}
		<path
			d='M18.7422 24.577C19.2754 24.577 19.9931 23.9417 23.9712 19.9657C26.5139 17.4244 28.6876 15.3545 28.7901 15.3545C28.9131 15.3545 29.1182 15.4365 29.2412 15.5184C29.3848 15.6004 29.6103 16.1743 29.7539 16.7891C29.8974 17.4039 29.9999 18.8795 29.9999 20.0682C29.9999 21.4209 29.8769 22.712 29.6513 23.5523C29.4668 24.2901 28.8926 25.7247 28.4005 26.7289C27.7648 28.0201 27.0881 29.0243 26.1038 30.09C25.3246 30.9098 24.0942 31.996 23.356 32.4879C22.6383 32.9592 21.4695 33.5946 20.7928 33.8815C20.1161 34.1479 18.7832 34.5373 17.8194 34.7422C16.5686 34.9882 15.5843 35.0497 14.2309 34.9677C13.2261 34.9062 11.8317 34.7013 11.155 34.5373C10.4783 34.3529 9.14546 33.82 8.20219 33.3486C7.1769 32.8158 5.94655 31.9755 5.14682 31.2377C4.40861 30.5614 3.46534 29.5777 3.03471 29.0448C2.48106 28.3685 2.23499 27.8561 2.23499 27.4052C2.23499 26.8109 2.68611 26.278 6.50021 22.4866C9.78115 19.1869 10.868 18.2237 11.2576 18.2237C11.6472 18.2442 12.5905 19.0435 14.9486 21.4004C17.6349 24.0646 18.2296 24.5565 18.7422 24.577Z'
			fill='#375DFB'
		/>
		{/* Cyan path */}
		<path
			d='M10.5605 5.64119C11.1142 5.45674 12.1395 5.2313 12.8162 5.12882C13.4929 5.00586 14.8257 4.96487 15.7895 5.02636C16.7533 5.06735 18.0862 5.25181 18.7629 5.41576C19.4396 5.60021 20.5469 5.9896 21.2236 6.29701C21.9003 6.62492 22.9051 7.19878 23.4792 7.56768C24.0329 7.95708 24.8736 8.5924 25.3042 9.00229C25.7554 9.39168 26.5141 10.2729 27.0062 10.9493C27.4984 11.6256 27.9085 12.3839 27.888 12.6298C27.888 12.9372 27.3343 13.675 26.3911 14.6383C25.5913 15.499 24.7506 16.1754 24.5455 16.1754C24.3405 16.1754 23.8893 15.6835 23.4587 14.9867C23.0486 14.3514 22.4744 13.5521 22.1668 13.2242C21.8798 12.8962 21.08 12.2814 20.4033 11.8305C19.7267 11.4001 18.5783 10.8468 17.8401 10.6214C17.0404 10.3754 15.9331 10.232 15.0718 10.232C14.2721 10.232 13.1648 10.3549 12.6111 10.5189C12.0369 10.6624 11.0937 11.0312 10.499 11.3182C9.92484 11.6256 9.00208 12.2609 8.46893 12.7323C7.95628 13.2242 7.23857 14.0644 6.86947 14.6383C6.52087 15.1916 6.04923 16.0729 5.86468 16.5853C5.65962 17.0976 5.41355 18.2863 5.14697 20.9916L3.34246 22.7951C2.35818 23.7788 1.37389 24.5781 1.16883 24.5781C0.984282 24.5781 0.738211 24.4142 0.635682 24.2092C0.533153 24.0248 0.3486 23.2664 0.225565 22.5286C0.102529 21.7908 0 20.6227 0 19.9054C0 19.2086 0.143541 17.9174 0.328094 17.0361C0.512647 16.1754 0.881753 14.9047 1.16883 14.2284C1.45592 13.5521 2.07109 12.4044 2.56323 11.6666C3.03487 10.9288 4.08067 9.74009 4.85989 9.00229C5.70063 8.203 6.95149 7.32175 7.91527 6.82989C8.79702 6.35851 9.98636 5.82564 10.5605 5.64119Z'
			fill='#00C8F4'
		/>
		{/* NOGL text */}
		<text
			x='42'
			y='27'
			className='font-inter fill-gray-900 text-lg font-semibold'
			style={{ fontSize: "19px", letterSpacing: "-0.006em" }}
		>
			NOGL
		</text>
	</svg>
);

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
	const getStrength = (password: string) => {
		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^A-Za-z0-9]/.test(password)) strength++;
		return strength;
	};

	const strength = getStrength(password);
	const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
	const strengthColors = [
		"bg-red-500",
		"bg-orange-500",
		"bg-yellow-500",
		"bg-blue-500",
		"bg-green-500",
	];

	if (!password) return null;

	return (
		<div className='mt-2'>
			<div className='mb-1 flex items-center gap-2'>
				<div className='h-2 flex-1 rounded-full bg-gray-200'>
					<div
						className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength - 1] || "bg-gray-200"}`}
						style={{ width: `${(strength / 5) * 100}%` }}
					/>
				</div>
				<span className='text-xs text-gray-600'>
					{strengthLabels[strength - 1] || "Very Weak"}
				</span>
			</div>
		</div>
	);
};

// Magic Link Signup Component
const MagicLinkSignup = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleMagicLinkSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		if (!email) {
			toast.error("Please enter your email address.");
			setLoading(false);
			return;
		}

		try {
			const callback = await signIn("email", {
				email,
				redirect: false,
				callbackUrl: `${window.location.origin}/onboarding`,
			});

			if (callback?.ok) {
				toast.success(
					"Magic link sent to your email! Check your inbox to complete signup."
				);
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
		<form onSubmit={handleMagicLinkSignup} className='space-y-3'>
			<div className='flex gap-2'>
				<input
					type='email'
					placeholder='Enter your email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className='font-inter h-12 flex-1 rounded-lg border border-[#CED4DA] bg-white px-4 py-1.5 text-sm font-normal leading-[21px] tracking-[0.28px] text-[#6C757D] placeholder:text-[#6C757D] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#3B82F6]'
					required
				/>
				<button
					type='submit'
					disabled={loading}
					className='h-12 rounded-lg bg-[#3B82F6] px-6 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50'
				>
					{loading ? (
						<svg
							className='h-5 w-5 animate-spin'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							></circle>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							></path>
						</svg>
					) : (
						"Send Link"
					)}
				</button>
			</div>
			<p className='text-center text-xs text-gray-500'>
				We'll send you a magic link to create your account
			</p>
		</form>
	);
};

// ReCAPTCHA Component Mock (replace with actual implementation)
const RecaptchaComponent = ({
	onChange,
}: {
	onChange: (verified: boolean) => void;
}) => {
	const [verified, setVerified] = useState(false);

	const handleCheck = () => {
		const newVerified = !verified;
		setVerified(newVerified);
		onChange(newVerified);
	};

	return (
		<div className='flex w-full max-w-[368px] items-center justify-between rounded-[10px] border border-[#E9EAEC] bg-[#F8F9FD] p-2.5'>
			<div className='flex flex-1 items-center gap-2'>
				<div className='flex items-center gap-1 p-0.5'>
					<div
						className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm transition-colors ${
							verified
								? "border border-[#3B82F6] bg-[#3B82F6]"
								: "border border-[#CED4DA] bg-white"
						}`}
						onClick={handleCheck}
					>
						{verified && (
							<svg width='10' height='7' viewBox='0 0 10 7' fill='none'>
								<path
									d='M1 3.2L2.86364 6L9 1'
									stroke='white'
									strokeWidth='1.5'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						)}
					</div>
				</div>
				<span className='font-inter line-clamp-1 text-sm font-medium tracking-[0.28px] text-[#6C757D]'>
					I'm not a robot
				</span>
			</div>
			<div className='flex flex-shrink-0 flex-col items-center justify-center gap-1'>
				<div className='flex h-3 w-[33px] items-center justify-center'>
					<span className='text-[10px] font-medium text-[#020434]'>
						reCAPTCHA
					</span>
				</div>
				<div className='flex'>
					<svg width='17' height='17' viewBox='0 0 19 19' fill='none'>
						<g filter='url(#filter0_d_8044_131347)'>
							<path
								d='M15.6386 3.97175C15.5583 3.87173 15.4756 3.77335 15.3905 3.67671C14.0303 2.13207 12.1537 1.1363 10.1121 0.875923C8.07048 0.61555 6.00398 1.10844 4.29968 2.26225L6.73958 5.86622C7.56702 5.30605 8.5703 5.06675 9.56149 5.19316C10.5527 5.31957 11.4638 5.80302 12.1242 6.55294C12.2722 6.72102 12.4053 6.89991 12.5228 7.08757L10.363 9.24731H17.5404V2.06992L15.6386 3.97175Z'
								fill='#1C3AA9'
							/>
						</g>
						<g filter='url(#filter1_d_8044_131347)'>
							<path
								d='M9.02225 0.808548H1.84485L3.72484 2.68853C2.32 3.82385 1.31015 5.38396 0.853663 7.1445C0.337101 9.13675 0.564596 11.249 1.49353 13.0856L5.37722 11.1212C4.92622 10.2296 4.81577 9.20407 5.06656 8.23683C5.31735 7.2696 5.91217 6.42697 6.73961 5.8668C6.77225 5.8447 6.80516 5.82311 6.83833 5.80201L9.02225 7.98592V0.808548Z'
								fill='#4285F4'
							/>
						</g>
						<g filter='url(#filter2_d_8044_131347)'>
							<path
								d='M0.582886 9.32619H7.76028L5.59176 11.4947C6.05159 12.2069 6.72292 12.7626 7.51655 13.0801C8.44429 13.4512 9.47552 13.4714 10.4171 13.1368C11.3586 12.8023 12.1459 12.1359 12.6314 11.2626L15.7705 14.3937C14.7806 15.6929 13.4297 16.6852 11.8743 17.2378C9.93498 17.927 7.81092 17.8854 5.90002 17.121C4.55579 16.5832 3.38191 15.7137 2.48053 14.6059L0.582886 16.5036V9.32619Z'
								fill='#ABABAB'
							/>
						</g>
						<defs>
							<filter
								id='filter0_d_8044_131347'
								x='3.70697'
								y='0.215222'
								width='14.4262'
								height='9.62481'
								filterUnits='userSpaceOnUse'
								colorInterpolationFilters='sRGB'
							>
								<feFlood floodOpacity='0' result='BackgroundImageFix' />
								<feColorMatrix
									in='SourceAlpha'
									type='matrix'
									values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
									result='hardAlpha'
								/>
								<feOffset />
								<feGaussianBlur stdDeviation='0.296358' />
								<feColorMatrix
									type='matrix'
									values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0'
								/>
								<feBlend
									mode='normal'
									in2='BackgroundImageFix'
									result='effect1_dropShadow_8044_131347'
								/>
								<feBlend
									mode='normal'
									in='SourceGraphic'
									in2='effect1_dropShadow_8044_131347'
									result='shape'
								/>
							</filter>
							<filter
								id='filter1_d_8044_131347'
								x='-0.00982946'
								y='0.215833'
								width='9.62476'
								height='13.4625'
								filterUnits='userSpaceOnUse'
								colorInterpolationFilters='sRGB'
							>
								<feFlood floodOpacity='0' result='BackgroundImageFix' />
								<feColorMatrix
									in='SourceAlpha'
									type='matrix'
									values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
									result='hardAlpha'
								/>
								<feOffset />
								<feGaussianBlur stdDeviation='0.296358' />
								<feColorMatrix
									type='matrix'
									values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0'
								/>
								<feBlend
									mode='normal'
									in2='BackgroundImageFix'
									result='effect1_dropShadow_8044_131347'
								/>
								<feBlend
									mode='normal'
									in='SourceGraphic'
									in2='effect1_dropShadow_8044_131347'
									result='shape'
								/>
							</filter>
							<filter
								id='filter2_d_8044_131347'
								x='-0.00982946'
								y='8.73347'
								width='16.3731'
								height='9.58535'
								filterUnits='userSpaceOnUse'
								colorInterpolationFilters='sRGB'
							>
								<feFlood floodOpacity='0' result='BackgroundImageFix' />
								<feColorMatrix
									in='SourceAlpha'
									type='matrix'
									values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
									result='hardAlpha'
								/>
								<feOffset />
								<feGaussianBlur stdDeviation='0.296358' />
								<feColorMatrix
									type='matrix'
									values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0'
								/>
								<feBlend
									mode='normal'
									in2='BackgroundImageFix'
									result='effect1_dropShadow_8044_131347'
								/>
								<feBlend
									mode='normal'
									in='SourceGraphic'
									in2='effect1_dropShadow_8044_131347'
									result='shape'
								/>
							</filter>
						</defs>
					</svg>
				</div>
			</div>
		</div>
	);
};

export default function SignupPageLayout() {
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [recaptchaVerified, setRecaptchaVerified] = useState(false);
	const [_passwordStrength, setPasswordStrength] = useState(0);
	const [_showSocialLogin, setShowSocialLogin] = useState(true);
	const [signupMethod, setSignupMethod] = useState<"form" | "magic-link">(
		"form"
	);
	// const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<FormData>({
		resolver: yupResolver(signupSchema),
		defaultValues: {
			termsAccepted: false,
			newsletter: false,
			recaptcha: false,
		},
	});

	const watchedTerms = watch("termsAccepted");
	const watchedNewsletter = watch("newsletter");
	const watchedPassword = watch("password");

	const onSubmit = async (data: FormData) => {
		if (!recaptchaVerified) {
			toast.error("Please complete the reCAPTCHA verification");
			return;
		}

		setLoading(true);

		try {
			const sanitizedData = {
				name: `${data.firstName} ${data.lastName}`,
				email: data.email,
				password: data.password,
			};

			// Register the user
			const res = await axios.post("/api/user/register", sanitizedData);

			if (res.status === 200) {
				toast.success(
					"Account created successfully! Please check your email for verification link."
				);

				// Sign in the user with magic link
				await signIn("email", {
					email: sanitizedData.email,
					redirect: false,
					callbackUrl: `${window.location.origin}/onboarding`,
				});
			}
		} catch (error: unknown) {
			console.error("Registration error:", error);
			const errorMessage = (error as any).response?.data
				? typeof (error as any).response.data === "string"
					? (error as any).response.data
					: JSON.stringify((error as any).response.data)
				: (error as any).message || "Registration failed. Please try again.";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen w-full bg-white'>
			{/* Left Column - Form */}
			<div className='flex min-h-screen w-full flex-col lg:w-1/2'>
				<div className='flex flex-1 flex-col items-center justify-start gap-1 px-2 py-1 sm:gap-2 sm:px-4 sm:py-2 md:gap-4 md:px-8 md:py-4 lg:gap-8 lg:px-[120px] lg:py-[80px]'>
					{/* Header */}
					<div className='flex w-full flex-col items-start gap-1 sm:gap-2 md:gap-4 lg:gap-6'>
						{/* Title */}
						<div className='flex w-full flex-col items-start gap-0.5'>
							<h1 className='font-inter text-base font-bold leading-5 tracking-[-0.28px] text-[#212121] sm:text-lg sm:leading-6 md:text-2xl md:leading-7 lg:text-[28px] lg:leading-8'>
								Create Account
							</h1>
							<p className='font-inter w-full text-xs font-normal leading-4 text-[#374151] sm:text-sm sm:leading-5 md:text-base'>
								Start monitoring competitor prices today.
							</p>
						</div>
					</div>

					{/* Social Login */}
					{showSocialLogin && (
						<div className='w-full'>
							<GoogleSigninButton text='Sign up with Google' />
						</div>
					)}

					{/* Signup Method Toggle */}
					<div className='flex w-full items-center justify-between gap-1.5 rounded-lg border border-[#CED4DA] p-1'>
						<button
							type='button'
							onClick={() => setSignupMethod("form")}
							className={`font-inter flex h-[38px] w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
								signupMethod === "form"
									? "bg-[#3B82F6] text-white"
									: "text-[#6C757D] hover:text-[#212121]"
							}`}
						>
							📝 Full Form
						</button>
						<button
							type='button'
							onClick={() => setSignupMethod("magic-link")}
							className={`font-inter flex h-[38px] w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
								signupMethod === "magic-link"
									? "bg-[#3B82F6] text-white"
									: "text-[#6C757D] hover:text-[#212121]"
							}`}
						>
							✨ Magic Link
						</button>
					</div>

					{/* Signup Content */}
					<div className='flex min-h-[180px] w-full flex-col gap-1 sm:min-h-[250px] sm:gap-2 md:min-h-[300px] md:gap-4 lg:gap-8'>
						{signupMethod === "form" ? (
							<form
								onSubmit={handleSubmit(onSubmit)}
								className='flex w-full flex-col gap-1 sm:gap-2 md:gap-4 lg:gap-8'
							>
								<div className='flex w-full flex-col gap-1 sm:gap-2 md:gap-3 lg:gap-5'>
									{/* Form Fields */}
									<div className='flex w-full flex-col gap-1 sm:gap-2 md:gap-3'>
										{/* Name Row */}
										<div className='flex w-full flex-col gap-1 sm:flex-row sm:gap-2'>
											{/* First Name */}
											<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
												<label className='font-inter text-xs font-medium leading-[18px] tracking-[0.28px] text-[#212121] sm:text-sm'>
													Name
												</label>
												<div className='flex w-full flex-col gap-0.5'>
													<div className='flex h-10 w-full items-center gap-2 rounded-lg border border-[#CED4DA] bg-white px-2 py-1 sm:h-12 sm:px-3'>
														<input
															{...register("firstName")}
															type='text'
															placeholder='Enter name'
															autoComplete='given-name'
															className='font-inter min-w-0 flex-1 border-none bg-transparent text-xs font-normal leading-[18px] tracking-[0.28px] text-[#6C757D] outline-none placeholder:text-[#6C757D] sm:text-sm'
														/>
													</div>
													{errors.firstName && (
														<span className='text-xs text-red-500 sm:text-sm'>
															{errors.firstName.message}
														</span>
													)}
												</div>
											</div>

											{/* Last Name */}
											<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
												<label className='font-inter text-xs font-medium leading-[18px] tracking-[0.28px] text-[#212121] sm:text-sm'>
													Last Name
												</label>
												<div className='flex w-full flex-col gap-0.5'>
													<div className='flex h-10 w-full items-center gap-2 rounded-lg border border-[#CED4DA] bg-white px-2 py-1 sm:h-12 sm:px-3'>
														<input
															{...register("lastName")}
															type='text'
															placeholder='Enter last name'
															autoComplete='family-name'
															className='font-inter min-w-0 flex-1 border-none bg-transparent text-xs font-normal leading-[18px] tracking-[0.28px] text-[#6C757D] outline-none placeholder:text-[#6C757D] sm:text-sm'
														/>
													</div>
													{errors.lastName && (
														<span className='text-xs text-red-500 sm:text-sm'>
															{errors.lastName.message}
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Email */}
										<div className='flex w-full flex-col gap-0.5'>
											<label className='font-inter text-xs font-medium leading-[18px] tracking-[0.28px] text-[#212121] sm:text-sm'>
												Email
											</label>
											<div className='flex w-full flex-col gap-0.5'>
												<div className='flex h-10 w-full items-center gap-2 rounded-lg border border-[#CED4DA] bg-white px-2 py-1 sm:h-12 sm:px-3'>
													<input
														{...register("email")}
														type='email'
														placeholder='yourmail@gmail.com'
														autoComplete='email'
														className='font-inter flex-1 border-none bg-transparent text-xs font-normal leading-[18px] tracking-[0.42px] text-[#6C757D] outline-none placeholder:text-[#6C757D] sm:text-sm'
													/>
												</div>
												{errors.email && (
													<span className='text-xs text-red-500 sm:text-sm'>
														{errors.email.message}
													</span>
												)}
											</div>
										</div>

										{/* Password */}
										<div className='flex w-full flex-col gap-0.5'>
											<label className='font-inter text-xs font-medium leading-[18px] tracking-[0.28px] text-[#212121] sm:text-sm'>
												Password
											</label>
											<div className='flex w-full flex-col gap-0.5'>
												<div className='flex h-10 w-full items-center gap-2 rounded-lg border border-[#CED4DA] bg-white px-2 py-1 sm:h-12 sm:px-3'>
													<input
														{...register("password")}
														type={showPassword ? "text" : "password"}
														placeholder='Enter your password'
														autoComplete='new-password'
														className='font-inter flex-1 border-none bg-transparent text-xs font-normal leading-[18px] tracking-[0.28px] text-[#6C757D] outline-none placeholder:text-[#6C757D] sm:text-sm'
													/>
													<button
														type='button'
														onClick={() => setShowPassword(!showPassword)}
														className='p-1 text-[#737373] transition-colors hover:text-[#4A5568]'
													>
														{showPassword ? (
															<svg
																width='20'
																height='20'
																viewBox='0 0 24 24'
																fill='none'
															>
																<path
																	d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
																	stroke='currentColor'
																	strokeWidth='2'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
																<circle
																	cx='12'
																	cy='12'
																	r='3'
																	stroke='currentColor'
																	strokeWidth='2'
																/>
															</svg>
														) : (
															<svg
																width='20'
																height='20'
																viewBox='0 0 24 24'
																fill='none'
															>
																<path
																	d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'
																	stroke='currentColor'
																	strokeWidth='2'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
																<line
																	x1='1'
																	y1='1'
																	x2='23'
																	y2='23'
																	stroke='currentColor'
																	strokeWidth='2'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
															</svg>
														)}
													</button>
												</div>
												{errors.password && (
													<span className='text-xs text-red-500 sm:text-sm'>
														{errors.password.message}
													</span>
												)}
												<PasswordStrengthIndicator
													password={watchedPassword || ""}
												/>
											</div>
										</div>
									</div>

									{/* Checkboxes */}
									<div className='flex w-full flex-col gap-0.5 sm:gap-1 md:gap-2'>
										{/* Terms Checkbox */}
										<div className='flex w-full items-center gap-1'>
											<div className='flex items-center gap-1 p-0.5'>
												<div className='relative h-5 w-5'>
													<div
														className={`absolute left-[2px] top-[2px] h-[16px] w-[16px] cursor-pointer rounded-sm transition-colors ${
															watchedTerms
																? "bg-[#3B82F6]"
																: "border border-[#CED4DA] bg-white"
														}`}
														onClick={() =>
															setValue("termsAccepted", !watchedTerms)
														}
													>
														{watchedTerms && (
															<svg
																width='8'
																height='5'
																viewBox='0 0 11 8'
																fill='none'
																className='absolute left-[3px] top-[4px]'
															>
																<path
																	d='M1 4.2L3.86364 7L10 1'
																	stroke='white'
																	strokeWidth='1.2'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
															</svg>
														)}
													</div>
												</div>
											</div>
											<div className='font-inter flex-1 text-xs font-normal leading-[150%] tracking-[0.28px] sm:text-sm'>
												<span className='text-[#495057]'>
													I have read and agreed to the{" "}
												</span>
												<Link
													href={"/tos" as Route<string>}
													className='text-[#212121] hover:underline'
												>
													terms of use
												</Link>
												<span className='text-[#495057]'>, and </span>
												<Link
													href={"/privacy-policy" as Route<string>}
													className='text-[#212121] hover:underline'
												>
													privacy policy
												</Link>
												<span className='text-[#212121]'>.</span>
											</div>
										</div>
										{errors.termsAccepted && (
											<span className='text-xs text-red-500 sm:text-sm'>
												{errors.termsAccepted.message}
											</span>
										)}

										{/* Newsletter Checkbox */}
										<div className='flex w-full items-center gap-1'>
											<div className='flex items-center gap-1 p-0.5'>
												<div className='relative h-5 w-5'>
													<div
														className={`absolute left-[2px] top-[2px] h-[16px] w-[16px] cursor-pointer rounded-sm border border-[#CED4DA] bg-white ${
															watchedNewsletter ? "bg-[#3B82F6]" : ""
														}`}
														onClick={() =>
															setValue("newsletter", !watchedNewsletter)
														}
													>
														{watchedNewsletter && (
															<svg
																width='8'
																height='5'
																viewBox='0 0 11 8'
																fill='none'
																className='absolute left-[3px] top-[4px]'
															>
																<path
																	d='M1 4.2L3.86364 7L10 1'
																	stroke='white'
																	strokeWidth='1.2'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																/>
															</svg>
														)}
													</div>
												</div>
											</div>
											<span className='font-inter flex-1 text-xs font-normal leading-[18px] tracking-[0.28px] text-[#495057] sm:text-sm'>
												Signup for newsletter
											</span>
										</div>
									</div>

									{/* reCAPTCHA */}
									<RecaptchaComponent
										onChange={(verified) => {
											setRecaptchaVerified(verified);
											setValue("recaptcha", verified);
										}}
									/>
									{errors.recaptcha && (
										<span className='text-xs text-red-500 sm:text-sm'>
											{errors.recaptcha.message}
										</span>
									)}
								</div>

								{/* Submit Button */}
								<button
									type='submit'
									disabled={loading}
									className='flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-2 py-2 text-xs transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-4 sm:py-3 sm:text-base'
								>
									{loading ? (
										<>
											<svg
												className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
											>
												<circle
													className='opacity-25'
													cx='12'
													cy='12'
													r='10'
													stroke='currentColor'
													strokeWidth='4'
												></circle>
												<path
													className='opacity-75'
													fill='currentColor'
													d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
												></path>
											</svg>
											<span className='font-inter text-xs font-semibold leading-6 tracking-[0.32px] text-white sm:text-base'>
												Creating Account...
											</span>
										</>
									) : (
										<span className='font-inter text-xs font-semibold leading-6 tracking-[0.32px] text-white sm:text-base'>
											Create Account
										</span>
									)}
								</button>

								{/* Sign In Link */}
								<div className='font-inter w-full text-center text-sm font-semibold leading-[150%] tracking-[0.32px] sm:text-base'>
									<span className='text-[#212121]'>
										Already have an account?{" "}
									</span>
									<Link
										href={"/auth/signin" as Route<string>}
										className='text-[#3B82F6] hover:underline'
									>
										Sign In
									</Link>
								</div>
							</form>
						) : (
							<div className='flex w-full flex-col justify-center'>
								<MagicLinkSignup />
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className='flex w-full max-w-[640px] flex-col items-start gap-1 p-1 opacity-75 sm:flex-row sm:gap-2 sm:p-2 md:gap-3 md:p-4 lg:p-6'>
					<div className='font-inter flex-1 text-sm font-normal leading-5 tracking-[-0.084px] text-[#676869]'>
						© 2025 - NOGL
					</div>
					<div className='flex items-center gap-1.5'>
						<span className='h-5 w-5 text-[#676869]'>📧</span>
						<span className='font-inter text-sm font-normal leading-5 tracking-[-0.084px] text-[#676869]'>
							Support@nogl.io
						</span>
					</div>
				</div>
			</div>

			{/* Right Column - Modern Design */}
			<div className='relative hidden min-h-screen flex-1 overflow-hidden bg-[#0c2441] lg:flex'>
				{/* Background Pattern */}
				<div className='absolute inset-0 opacity-[0.036]'>
					<div
						className='absolute inset-0'
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
							backgroundSize: "60px 60px",
						}}
					/>
				</div>

				{/* Content */}
				<div className='relative z-10 flex h-full flex-col items-center justify-center px-16 py-20'>
					{/* Main Content */}
					<div className='flex max-w-md flex-col items-center text-center'>
						{/* Title */}
						<h2 className='mb-6 text-4xl font-bold leading-tight text-white'>
							Join thousands of businesses
						</h2>

						{/* Subtitle */}
						<p className='mb-12 text-lg leading-relaxed text-blue-200'>
							Monitor competitor prices and stay ahead of the market with our
							powerful analytics platform.
						</p>

						{/* Stats */}
						<div className='mb-16 grid grid-cols-3 gap-8'>
							<div className='text-center'>
								<div className='mb-2 text-3xl font-bold text-white'>10K+</div>
								<div className='text-sm text-blue-200'>Active Users</div>
							</div>
							<div className='text-center'>
								<div className='mb-2 text-3xl font-bold text-white'>50M+</div>
								<div className='text-sm text-blue-200'>Products Tracked</div>
							</div>
							<div className='text-center'>
								<div className='mb-2 text-3xl font-bold text-white'>99.9%</div>
								<div className='text-sm text-blue-200'>Uptime</div>
							</div>
						</div>

						{/* Company Logos */}
						<div className='w-full'>
							<p className='mb-6 text-sm text-blue-200'>
								Trusted by leading companies
							</p>
							<div className='flex flex-wrap items-center justify-center gap-8 opacity-60'>
								{/* Company logos would go here */}
								<div className='text-sm font-medium text-white'>Walmart</div>
								<div className='text-sm font-medium text-white'>Amazon</div>
								<div className='text-sm font-medium text-white'>Target</div>
								<div className='text-sm font-medium text-white'>Best Buy</div>
							</div>
						</div>
					</div>

					{/* Testimonial */}
					<div className='mt-16 max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm'>
						<div className='mb-4 flex items-center'>
							<div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-lg font-bold text-white'>
								JD
							</div>
							<div className='ml-4'>
								<div className='font-semibold text-white'>John Doe</div>
								<div className='text-sm text-blue-200'>CEO, TechCorp</div>
							</div>
						</div>
						<p className='text-sm leading-relaxed text-blue-100'>
							"NOGL has revolutionized how we track competitor pricing. The
							insights have helped us increase our market share by 25%."
						</p>
					</div>
				</div>

				{/* Decorative Elements */}
				<div className='absolute right-20 top-20 h-32 w-32 rounded-full bg-blue-500/20 blur-xl'></div>
				<div className='absolute bottom-20 left-20 h-24 w-24 rounded-full bg-purple-500/20 blur-xl'></div>
				<div className='absolute right-10 top-1/2 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl'></div>
			</div>
		</div>
	);
}
