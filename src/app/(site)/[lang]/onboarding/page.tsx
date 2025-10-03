// src/app/(site)/onboarding/page.tsx

// Constants
"use client";

const DEFAULT_USER_ROLE = "USER";
const DEFAULT_FORM_VALUES = {
	isCommunityMember: false,
	displayName: "",
	bio: "",
	image: null,
	linkedin: "",
	website: "",
	portfolio: "",
};
const R2_BUCKET_URL = "https://pub-beabd1ed711d4df3bbda9b37465d8b04.r2.dev";
const VALIDATION_MESSAGES = {
	displayName: {
		required: "Display name is required",
		minLength: "Display name must be at least 2 characters",
		maxLength: "Display name must be less than 50 characters",
	},
	bio: {
		required: "Bio is required",
		minLength: "Bio must be at least 10 characters",
		maxLength: "Bio must be less than 500 characters",
	},
	userType: {
		required: "Please select who you are",
	},
	referralSource: {
		required: "Please tell us how you found us",
	},
	image: {
		size: "Image must be less than 2MB",
		format: "Only JPG, JPEG, and PNG files are allowed",
	},
};

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession, signIn } from "next-auth/react";
import { getSignedURL } from "@/actions/upload";

interface OnboardingFormData {
	isCommunityMember: boolean;
	displayName: string;
	bio?: string;
	image?: File | null;
	userType?: string;
	referralSource?: string;
	otherReferralSource?: string;
	linkedin?: string;
	website?: string;
	portfolio?: string;
}

export default function OnboardingPage() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const [formData, setFormData] =
		useState<OnboardingFormData>(DEFAULT_FORM_VALUES);
	const [loading, setLoading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [profilePhoto, setProfilePhoto] = useState("");

	// Pre-fill the form if the user's data is available
	useEffect(() => {
		if (session?.user) {
			setFormData((prev) => ({
				...prev,
				displayName: session.user.name || "",
				bio: session.user.bio || "",
				isCommunityMember: session.user.isCommunityMember || false,
			}));
			if (session.user.image) {
				setProfilePhoto(session.user.image);
			}
		}
	}, [session]);

	// Redirect based on authentication status and onboarding state
	useEffect(() => {
		if (status === "authenticated") {
			if (session.user?.onboardingCompleted) {
				router.push("/"); // Redirect to homepage
				return;
			}
		} else if (status === "unauthenticated") {
			signIn();
		}
	}, [session, status, router]);

	// Validate the form before submission
	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		// Display Name validation
		if (!formData.displayName.trim()) {
			errors.displayName = VALIDATION_MESSAGES.displayName.required;
		} else if (formData.displayName.length < 2) {
			errors.displayName = VALIDATION_MESSAGES.displayName.minLength;
		} else if (formData.displayName.length > 50) {
			errors.displayName = VALIDATION_MESSAGES.displayName.maxLength;
		}

		// Bio validation (now mandatory)
		if (!formData.bio?.trim()) {
			errors.bio = VALIDATION_MESSAGES.bio.required;
		} else if (formData.bio.length < 10) {
			errors.bio = VALIDATION_MESSAGES.bio.minLength;
		} else if (formData.bio.length > 500) {
			errors.bio = VALIDATION_MESSAGES.bio.maxLength;
		}

		// User Type validation
		if (!formData.userType) {
			errors.userType = VALIDATION_MESSAGES.userType.required;
		}

		// Referral Source validation
		if (!formData.referralSource) {
			errors.referralSource = VALIDATION_MESSAGES.referralSource.required;
		} else if (
			formData.referralSource === "Other" &&
			!formData.otherReferralSource?.trim()
		) {
			errors.otherReferralSource = "Please specify how you found us";
		}

		// Image validation (if file is selected)
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				// 2MB in bytes
				errors.image = VALIDATION_MESSAGES.image.size;
			}
			const validTypes = ["image/jpeg", "image/jpg", "image/png"];
			if (!validTypes.includes(file.type)) {
				errors.image = VALIDATION_MESSAGES.image.format;
			}
		}

		// Display all errors if any
		if (Object.keys(errors).length > 0) {
			Object.values(errors).forEach((error) => {
				toast.error(error);
			});
			return false;
		}

		return true;
	};

	// Handle image selection and preview
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target?.files?.[0];
		if (selectedFile) {
			setProfilePhoto(URL.createObjectURL(selectedFile));
			setFile(selectedFile);
			setFormData({ ...formData, image: selectedFile });
		}
	};

	// Upload the selected file to the server
	const handleFileUpload = async (file: File) => {
		if (!file) {
			return null;
		}

		try {
			const signedUrl = await getSignedURL(file.type, file.size);

			if (signedUrl.success) {
				const url = signedUrl.success.url;

				const res = await fetch(url, {
					method: "PUT",
					headers: {
						"Content-Type": file.type || "application/octet-stream",
					},
					body: file,
				});

				if (res.status === 200) {
					// Return the key to construct the image URL
					return signedUrl.success.key;
				} else {
					toast.error("Failed to upload profile photo");
					return null;
				}
			} else {
				toast.error(signedUrl.failure || "Failed to get signed URL");
				setFile(null);
				setProfilePhoto("");
				return null;
			}
		} catch (error) {
			console.error("Error uploading profile photo:", error);
			toast.error("Failed to upload profile photo");
			return null;
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		setLoading(true);

		let uploadedImageKey = null;
		if (file) {
			uploadedImageKey = await handleFileUpload(file);
			if (!uploadedImageKey) {
				setLoading(false);
				return;
			}
		}

		const requestBody = {
			email: session?.user?.email || "",
			name: formData.displayName,
			image: uploadedImageKey
				? `${uploadedImageKey}`
				: session?.user?.image || "",
			bio: formData.bio,
			role: DEFAULT_USER_ROLE,
			isCommunityMember: formData.isCommunityMember,
			userType: formData.userType,
			referralSource: formData.referralSource,
			otherReferralSource: formData.otherReferralSource,
			socialLinks: formData.linkedin
				? { professionalLink: formData.linkedin }
				: null,
			onboardingCompleted: true,
		};

		try {
			const res = await fetch("/api/user/update", {
				method: "POST",
				body: JSON.stringify(requestBody),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (res.status === 200) {
				const updatedUser = await res.json();
				toast.success("Profile updated successfully!");

				// Update the session with the new user data
				await update({
					...session,
					user: {
						...session?.user,
						...updatedUser,
						onboardingCompleted: true,
					},
				});

				router.push("/"); // Redirect to homepage after onboarding
			} else {
				const errorData = await res.json();
				toast.error(
					errorData.error || "Something went wrong. Please try again."
				);
			}
		} catch (error) {
			console.error("Submission error:", error);
			toast.error("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Render loading state
	if (status === "loading") {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
			</div>
		);
	}

	// Render if user is not authenticated
	if (!session?.user) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<p>Please sign in to continue</p>
			</div>
		);
	}

	// Main component render
	return (
		<div className='flex min-h-screen flex-col justify-center bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 md:py-12 lg:px-8 dark:bg-gray-900'>
			{/* Header */}
			<div className='mx-auto w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl'>
				<h2 className='text-center text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white'>
					Welcome to Nogl! 🎯
				</h2>
				<div className='mt-3 text-center text-xs text-gray-500 sm:text-sm dark:text-gray-400'>
					This will help us match you with the right opportunities
				</div>
			</div>

			{/* Form */}
			<div className='mx-auto mt-6 w-full max-w-xs sm:mt-8 sm:max-w-xl md:max-w-2xl lg:max-w-4xl'>
				<div className='bg-white shadow sm:rounded-lg dark:bg-gray-800'>
					<form
						onSubmit={handleSubmit}
						className='space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8 lg:p-10'
					>
						{/* Grid layout for form fields */}
						<div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2'>
							{/* Left Column */}
							<div className='space-y-4 sm:space-y-6'>
								{/* Profile Image Upload */}
								<div className='flex flex-col items-center rounded-lg bg-gray-50 p-4 dark:bg-gray-900'>
									<div className='relative mb-4 h-32 w-32'>
										{profilePhoto ? (
											<img
												src={
													profilePhoto.startsWith("http")
														? profilePhoto
														: URL.createObjectURL(file!)
												}
												alt='Profile'
												className='h-full w-full rounded-full object-cover'
											/>
										) : (
											<div className='flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700'>
												<span className='text-gray-500 dark:text-gray-300'>
													No Image
												</span>
											</div>
										)}
									</div>

									<label
										htmlFor='profilePhoto'
										className='cursor-pointer rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600'
									>
										{file ? "Change Photo" : "Upload Photo"}
										<input
											type='file'
											name='profilePhoto'
											id='profilePhoto'
											className='sr-only'
											onChange={handleImageChange}
											accept='image/png, image/jpg, image/jpeg'
										/>
									</label>

									<div className='mt-2 space-y-1 text-center'>
										<p className='text-xs text-gray-500'>
											Recommended: 300px × 300px
										</p>
										<p className='text-xs text-gray-500'>
											JPG, JPEG, or PNG • Max 2MB
										</p>
									</div>
								</div>

								{/* Display Name */}
								<div className='mt-4'>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Display Name <span className='text-red-500'>*</span>
									</label>
									<input
										type='text'
										value={formData.displayName}
										onChange={(e) =>
											setFormData({ ...formData, displayName: e.target.value })
										}
										placeholder='Enter your display name'
										className={`mt-1 block w-full py-2 pl-3 pr-10 text-sm
                              ${!formData.displayName.trim() ? "border-red-500" : "border-gray-300"}
                              rounded-md focus:border-green-500 focus:outline-none
                              focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700`}
									/>
									{!formData.displayName.trim() && (
										<p className='mt-1 text-xs text-red-500'>
											{VALIDATION_MESSAGES.displayName.required}
										</p>
									)}
								</div>

								{/* Bio */}
								<div className='mt-4'>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Bio <span className='text-red-500'>*</span>
									</label>
									<textarea
										value={formData.bio}
										onChange={(e) =>
											setFormData({ ...formData, bio: e.target.value })
										}
										placeholder='Tell us about yourself (minimum 10 characters)'
										maxLength={500}
										rows={3}
										style={{ minHeight: "100px", resize: "none" }}
										className={`mt-1 block w-full py-2 pl-3 pr-10 text-sm
                              ${!formData.bio?.trim() ? "border-red-500" : "border-gray-300"}
                              h-auto overflow-hidden rounded-md
                              focus:border-green-500 focus:outline-none focus:ring-green-500
                              dark:border-gray-600 dark:bg-gray-700`}
										onInput={(e) => {
											const target = e.target as HTMLTextAreaElement;
											target.style.height = "auto";
											target.style.height = `${target.scrollHeight}px`;
										}}
										required
									/>
									<div className='mt-1 flex justify-between text-xs'>
										<p
											className={`${!formData.bio?.trim() ? "text-red-500" : "text-gray-500"}`}
										>
											{!formData.bio?.trim()
												? VALIDATION_MESSAGES.bio.required
												: ""}
										</p>
										<p
											className={`${formData.bio && formData.bio.length > 500 ? "text-red-500" : "text-gray-500"}`}
										>
											{formData.bio?.length || 0}/500
										</p>
									</div>
								</div>
							</div>

							{/* Right Column */}
							<div className='space-y-4 sm:space-y-6'>
								{/* Who Are You */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Who Are You? <span className='text-red-500'>*</span>
									</label>
									<select
										value={formData.userType || ""}
										onChange={(e) =>
											setFormData({ ...formData, userType: e.target.value })
										}
										className={`mt-1 block w-full py-2 pl-3 pr-10 text-base 
                                ${!formData.userType ? "border-red-500" : "border-gray-300"}
                                rounded-md focus:border-green-500 focus:outline-none
                                focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700`}
									>
										<option value=''>Select who you are</option>
										<option value='Student'>Student</option>
										<option value='Professional'>Professional</option>
										<option value='Entrepreneur'>Entrepreneur</option>
										<option value='Educator'>Educator</option>
										<option value='Other'>Other</option>
									</select>
									{!formData.userType && (
										<p className='mt-1 text-sm text-red-500'>
											{VALIDATION_MESSAGES.userType.required}
										</p>
									)}
								</div>

								{/* How Did You Hear About Us */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										How Did You Hear About Us?{" "}
										<span className='text-red-500'>*</span>
									</label>
									<select
										value={formData.referralSource}
										onChange={(e) =>
											setFormData({
												...formData,
												referralSource: e.target.value,
											})
										}
										className={`mt-1 block w-full py-2 pl-3 pr-10 text-base 
                                ${!formData.referralSource ? "border-red-500" : "border-gray-300"}
                                rounded-md focus:border-green-500 focus:outline-none
                                focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700`}
									>
										<option value=''>Select an option</option>
										<option value='Google'>Google/Search Engine</option>
										<option value='Social'>Social Media</option>
										<option value='Friend'>Friend or Colleague</option>
										<option value='Event'>Event or Conference</option>
										<option value='Other'>Other</option>
									</select>
									{!formData.referralSource && (
										<p className='mt-1 text-sm text-red-500'>
											{VALIDATION_MESSAGES.referralSource.required}
										</p>
									)}
									{formData.referralSource === "Other" && (
										<input
											type='text'
											placeholder='Please specify'
											value={formData.otherReferralSource}
											onChange={(e) =>
												setFormData({
													...formData,
													otherReferralSource: e.target.value,
												})
											}
											className='mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10
                                 text-base focus:border-green-500 focus:outline-none
                                 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700'
										/>
									)}
								</div>

								{/* Professional Link */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Professional Link (Optional)
									</label>
									<div className='mt-1'>
										<input
											type='url'
											placeholder='Add your LinkedIn, Website, or Portfolio URL'
											value={formData.linkedin || ""}
											onChange={(e) =>
												setFormData({ ...formData, linkedin: e.target.value })
											}
											className='block w-full rounded-md border-gray-300 py-2 pl-3 pr-10
                                text-base focus:border-green-500 focus:outline-none
                                focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700'
										/>
										<p className='mt-1 text-xs text-gray-500'>
											Add your best professional profile (LinkedIn recommended)
										</p>
									</div>
								</div>

								{/* EmpowHerCircle Membership - Now at the end */}
								<div className='rounded-xl bg-green-50 p-4 sm:p-6 dark:bg-green-900'>
									<div className='flex items-center'>
										<input
											id='community-member'
											name='community-member'
											type='checkbox'
											checked={formData.isCommunityMember}
											onChange={(e) =>
												setFormData({
													...formData,
													isCommunityMember: e.target.checked,
												})
											}
											className='h-5 w-5 rounded border-gray-300 text-green-500 focus:ring-green-500'
										/>
										<label
											htmlFor='community-member'
											className='ml-3 block text-lg font-semibold text-gray-900 dark:text-gray-100'
										>
											I am a member of the EmpowHerCircle
										</label>
									</div>
									<p className='ml-8 mt-2 text-sm text-gray-600 dark:text-gray-300'>
										Join our exclusive community to access special features and
										connect with other members
									</p>
								</div>
							</div>
						</div>

						{/* Submit Button - Full Width */}
						<div className='mt-6 sm:mt-8'>
							<button
								type='submit'
								disabled={loading}
								className='flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 
                         py-2 text-sm font-medium text-white shadow-sm transition-colors 
                         duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 
                         focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                         disabled:opacity-50 sm:py-3 sm:text-base'
							>
								{loading ? (
									<div className='flex items-center'>
										<div className='mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
										Completing Setup...
									</div>
								) : (
									"Complete Profile"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
