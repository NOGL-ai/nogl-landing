"use client";

import { useState, useId, useRef } from "react";
import { Clock, HelpCircle, Mail01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { RichTextEditor } from "@/components/base/rich-text-editor/rich-text-editor";
import { FileUploadDropZone } from "@/components/application/file-upload/file-upload-base";
import { Avatar } from "@/components/base/avatar/avatar";

interface PersonalInfoFormData {
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	country: string;
	timezone: string;
	bio: string;
}

const countryOptions = [
	{ id: "de", label: "Germany", icon: () => <span className="text-xl">🇩🇪</span> },
	{ id: "us", label: "United States", icon: () => <span className="text-xl">🇺🇸</span> },
	{ id: "uk", label: "United Kingdom", icon: () => <span className="text-xl">🇬🇧</span> },
	{ id: "fr", label: "France", icon: () => <span className="text-xl">🇫🇷</span> },
];

const timezoneOptions = [
	{ id: "cet", label: "Central European Time (CET)", supportingText: "UTC+01:00" },
	{ id: "est", label: "Eastern Standard Time (EST)", supportingText: "UTC-05:00" },
	{ id: "pst", label: "Pacific Standard Time (PST)", supportingText: "UTC-08:00" },
	{ id: "jst", label: "Japan Standard Time (JST)", supportingText: "UTC+09:00" },
];

export function PersonalInfoTab() {
	// SSR-safe ID generation
	const idPrefix = useId();
	const fileCounterRef = useRef(0);

	const [formData, setFormData] = useState<PersonalInfoFormData>({
		firstName: "",
		lastName: "Tim",
		email: "tim.bibow@julie-grace.de",
		role: "Product Designer",
		country: "de",
		timezone: "cet",
		bio: "I'm a Jewellery Product Manager based in Geneva, Switzerland. I specialize in product strategy, brand development, and supply chain optimization.",
	});

	const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: number; progress: number; status: "uploading" | "complete" }>>([
		{ id: "1", name: "Brand voice guidelines.pdf", size: 204800, progress: 100, status: "complete" },
		{ id: "2", name: "Jewelry ad shooting.mp4", size: 16777216, progress: 40, status: "uploading" }, // 16 MB total
		{ id: "3", name: "New styles guide.fig", size: 4404019, progress: 80, status: "uploading" }, // 4.2 MB total
	]);

	const handleInputChange = (field: keyof PersonalInfoFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileUpload = (files: FileList) => {
		const newFiles = Array.from(files).map((file) => {
			fileCounterRef.current += 1;
			return {
				id: `${idPrefix}-file-${fileCounterRef.current}`,
				name: file.name,
				size: file.size,
				progress: 0,
				status: "uploading" as const,
			};
		});

		setUploadedFiles((prev) => [...prev, ...newFiles]);

		// Simulate upload progress
		newFiles.forEach((file) => {
			const interval = setInterval(() => {
				setUploadedFiles((prev) =>
					prev.map((f) => {
						if (f.id === file.id) {
							const newProgress = Math.min(f.progress + 10, 100);
							return {
								...f,
								progress: newProgress,
								status: newProgress === 100 ? "complete" : "uploading",
							};
						}
						return f;
					})
				);
			}, 500);

			setTimeout(() => clearInterval(interval), 5000);
		});
	};

	const handleRemoveFile = (id: string) => {
		setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
	};

	const getFileIcon = (fileName: string) => {
		const ext = fileName.split(".").pop()?.toLowerCase();
		const iconMap: Record<string, { bg: string; text: string }> = {
			pdf: { bg: "bg-red-600", text: "PDF" },
			mp4: { bg: "bg-blue-600", text: "MP4" },
			fig: { bg: "bg-purple-600", text: "FIG" },
			jpg: { bg: "bg-purple-600", text: "JPG" },
			png: { bg: "bg-purple-600", text: "PNG" },
		};
		return iconMap[ext || ""] || { bg: "bg-gray-600", text: ext?.toUpperCase() || "FILE" };
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Section */}
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-6 px-8">
					{/* Section Header */}
					<div className="flex flex-col gap-5">
						<div className="flex flex-wrap items-start gap-x-4 gap-y-5">
							<div className="flex min-w-[320px] flex-1 flex-col gap-1">
								<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
									Personal info
								</h2>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Update your photo and personal details here.
								</p>
							</div>
							
						{/* Mobile: Show buttons at top */}
						<div className="flex w-full items-center gap-3 lg:hidden">
							<Button size="md" color="secondary" className="flex-1">
								Cancel
							</Button>
							<Button size="md" color="primary" className="flex-1">
								Save
							</Button>
						</div>
						
						{/* Desktop: Show buttons on right */}
						<div className="hidden items-center gap-3 lg:flex">
							<Button size="md" color="secondary">
								Cancel
							</Button>
							<Button size="md" color="primary">
								Save
							</Button>
						</div>
						</div>
						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
					</div>

					{/* Form */}
					<div className="flex flex-col gap-5">
						{/* Name */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<div className="flex items-center gap-0.5">
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</p>
									<span className="text-sm font-semibold text-brand-600">*</span>
								</div>
							</div>
							<div className="flex w-full flex-col items-start gap-5 lg:min-w-[480px] lg:max-w-[512px] lg:flex-1 lg:flex-row lg:gap-6">
								<Input
									size="md"
									value={formData.firstName}
									onChange={(value) => handleInputChange("firstName", value)}
									className="w-full lg:flex-1"
								/>
								<Input
									size="md"
									value={formData.lastName}
									onChange={(value) => handleInputChange("lastName", value)}
									className="w-full lg:flex-1"
								/>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Email Address */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<div className="flex items-center gap-0.5">
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email address</p>
									<span className="text-sm font-semibold text-brand-600">*</span>
								</div>
							</div>
							<div className="flex w-full lg:min-w-[480px] lg:max-w-[512px] lg:flex-1">
								<Input
									size="md"
									icon={Mail01}
									value={formData.email}
									onChange={(value) => handleInputChange("email", value)}
									className="w-full"
								/>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Your Photo */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<div className="flex items-center gap-0.5">
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your photo</p>
									<span className="text-sm font-semibold text-brand-600">*</span>
									<button type="button" className="ml-0.5 flex size-4 items-center justify-center">
										<HelpCircle className="size-4 text-gray-400 dark:text-gray-500" />
									</button>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									This will be displayed on your profile.
								</p>
							</div>
							<div className="flex w-full flex-col items-center gap-5 lg:min-w-[480px] lg:max-w-[512px] lg:flex-1 lg:flex-row lg:items-start">
								{/* Mobile: 64px avatar */}
								<Avatar size="lg" src="https://i.pravatar.cc/300" alt="User Avatar" className="lg:hidden" />
								{/* Desktop: 96px avatar */}
								<Avatar size="2xl" src="https://i.pravatar.cc/300" alt="User Avatar" className="hidden lg:block" />
								
								<div className="flex w-full lg:flex-1">
									<FileUploadDropZone
										hint="SVG, PNG, JPG or GIF (max. 800x400px)"
										accept="image/*"
										onDropFiles={handleFileUpload}
										className="w-full border-2 border-dashed border-brand-600 bg-white hover:bg-brand-50 dark:bg-gray-900 dark:hover:bg-gray-800"
									/>
								</div>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Role */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role</p>
							</div>
							<div className="flex w-full lg:min-w-[480px] lg:max-w-[512px] lg:flex-1">
								<Input
									size="md"
									value={formData.role}
									onChange={(value) => handleInputChange("role", value)}
									className="w-full"
								/>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Country */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Country</p>
							</div>
							<div className="flex w-full lg:min-w-[480px] lg:max-w-[512px] lg:flex-1">
								<Select
									size="md"
									selectedKey={formData.country}
									onSelectionChange={(key) => handleInputChange("country", key as string)}
									items={countryOptions}
									className="w-full"
								>
									{(item) => <Select.Item {...item}>{item.label}</Select.Item>}
								</Select>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Timezone */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<div className="flex items-center gap-0.5">
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timezone</p>
									<button type="button" className="ml-0.5 flex size-4 items-center justify-center">
										<HelpCircle className="size-4 text-gray-400 dark:text-gray-500" />
									</button>
								</div>
							</div>
							<div className="flex w-full lg:min-w-[480px] lg:max-w-[512px] lg:flex-1">
								<Select
									size="md"
									placeholderIcon={Clock}
									selectedKey={formData.timezone}
									onSelectionChange={(key) => handleInputChange("timezone", key as string)}
									items={timezoneOptions}
									className="w-full"
								>
									{(item) => <Select.Item {...item}>{item.label}</Select.Item>}
								</Select>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Bio */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<div className="flex items-center gap-0.5">
									<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bio</p>
									<span className="text-sm font-semibold text-brand-600">*</span>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Write a short introduction.
								</p>
							</div>
							<div className="flex w-full lg:min-w-[480px] lg:max-w-[512px] lg:flex-1">
								<RichTextEditor
									value={formData.bio}
									onChange={(value) => handleInputChange("bio", value)}
									maxLength={1000}
									className="w-full"
								/>
							</div>
						</div>

						<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />

						{/* Knowledge Uploads */}
						<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start lg:gap-y-4 lg:gap-x-8">
							<div className="flex flex-col lg:min-w-[200px] lg:max-w-[280px] lg:flex-1">
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Knowledge uploads</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Add files to the knowledge base.
								</p>
							</div>
							<div className="flex w-full flex-col gap-4 lg:min-w-[480px] lg:max-w-[512px] lg:flex-1">
								<FileUploadDropZone
									hint="SVG, PNG, JPG, or PDF (max. 10MB)"
									accept=".pdf,.jpg,.png,.svg,.mp4,.fig"
									maxSize={10 * 1024 * 1024}
									onDropFiles={handleFileUpload}
								/>

								{/* File Queue */}
								{uploadedFiles.length > 0 && (
									<div className="flex flex-col gap-3">
										{uploadedFiles.map((file) => {
											const fileIcon = getFileIcon(file.name);
											return (
												<div
													key={file.id}
													className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
												>
													{/* File Icon */}
													<div className="relative size-10">
														<div className="flex size-8 items-center justify-center rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
															<div className={`absolute bottom-0 left-0 flex h-4 items-center justify-center rounded-sm px-1 text-[10px] font-bold text-white ${fileIcon.bg}`}>
																{fileIcon.text}
															</div>
														</div>
													</div>

													{/* File Content */}
													<div className="flex flex-1 flex-col gap-1">
														<div className="flex flex-col gap-0.5">
															<p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
																{file.name}
															</p>
															<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
																<span>
																	{formatFileSize(file.size * (file.progress / 100))} of {formatFileSize(file.size)}
																</span>
																<span className="text-gray-300 dark:text-gray-700">|</span>
																<div className="flex items-center gap-1">
																	{file.status === "complete" ? (
																		<>
																			<svg className="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
																			</svg>
																			<span className="text-sm font-medium text-green-600">Complete</span>
																		</>
													) : (
														<>
															<svg className="size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
															</svg>
															<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploading...</span>
														</>
													)}
																</div>
															</div>
														</div>

														{/* Progress Bar */}
														<div className="flex items-center gap-3">
															<div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-800">
																<div
																	className="h-2 rounded-full bg-brand-600 transition-all"
																	style={{ width: `${file.progress}%` }}
																/>
															</div>
															<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
																{file.progress}%
															</span>
														</div>
													</div>

													{/* Delete Button */}
													<button
														type="button"
														onClick={() => handleRemoveFile(file.id)}
														className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
													>
														<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

			{/* Section Footer */}
			<div className="flex flex-col items-center gap-5">
				<div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
				<div className="flex w-full items-center justify-end gap-5 px-8">
					<div className="flex w-full items-center justify-end gap-3 lg:w-auto">
						<Button size="md" color="secondary" className="flex-1 lg:flex-initial">
							Cancel
						</Button>
						<Button size="md" color="primary" className="flex-1 lg:flex-initial">
							Save
						</Button>
					</div>
				</div>
			</div>
			</div>
		</div>
	);
}
