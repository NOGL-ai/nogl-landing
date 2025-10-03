"use client";

import { useState, useRef } from "react";

// Enhanced Icon components
interface Component1Props {
	variant?:
		| "1"
		| "2"
		| "3"
		| "4"
		| "5"
		| "6"
		| "7"
		| "8"
		| "9"
		| "10"
		| "11"
		| "12"
		| "13"
		| "14"
		| "15"
		| "16"
		| "17"
		| "18"
		| "19"
		| "20"
		| "21"
		| "22"
		| "23"
		| "24"
		| "25"
		| "26"
		| "27"
		| "28";
}

function Component1({ variant = "1" }: Component1Props) {
	const getIconContent = () => {
		switch (variant) {
			case "26":
				return (
					<svg
						className='h-4 w-4 text-blue-600'
						viewBox='0 0 16 16'
						fill='currentColor'
					>
						<circle cx='8' cy='8' r='1.5' />
						<path d='M8 2v2' />
						<path d='M14 8h2' />
						<path d='M8 14v2' />
						<path d='M2 8H0' />
					</svg>
				);
			case "27":
				return (
					<svg
						className='h-4 w-4 text-green-600'
						viewBox='0 0 16 16'
						fill='currentColor'
					>
						<path d='M13.5 2l-5 5-3-3-1.5 1.5L8.5 9l6.5-6.5L13.5 2z' />
					</svg>
				);
			case "28":
				return (
					<svg
						className='h-4 w-4 text-blue-600'
						viewBox='0 0 32 4'
						fill='currentColor'
					>
						<circle cx='16' cy='2' r='1' />
						<line
							x1='16'
							y1='2'
							x2='32'
							y2='2'
							stroke='currentColor'
							strokeWidth='1'
						/>
						<line
							x1='16'
							y1='2'
							x2='0'
							y2='2'
							stroke='currentColor'
							strokeWidth='1'
						/>
					</svg>
				);
			default:
				return (
					<svg
						className='h-5 w-5 text-gray-400'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path d='M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5z' />
					</svg>
				);
		}
	};

	return (
		<div className='flex items-center justify-center'>{getIconContent()}</div>
	);
}

// Loading spinner component
const LoadingSpinner = () => (
	<div className='h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600'></div>
);

// Product data interface
interface ProductData {
	title: string;
	price: number;
	currency: string;
	stockStatus: string;
	code: string;
	brand: string;
	imageUrl?: string;
	isValidUrl: boolean;
	errorMessage?: string;
}

export default function AddEcommerceCompetitorPage() {
	const [competitorUrl, setCompetitorUrl] = useState(
		"www.luamaya.com/products/charm-bundle"
	);
	const [isValidating, setIsValidating] = useState(false);
	const [isValid, setIsValid] = useState(true);
	const [showProduct, setShowProduct] = useState(true);
	const [productData, setProductData] = useState<ProductData | null>(null);
	const [urlError, setUrlError] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);

	// URL validation function
	const validateUrl = (
		url: string
	): { isValid: boolean; error: string; cleanUrl: string } => {
		const urlPatterns = [
			/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
			/^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?$/,
		];

		let cleanUrl = url.trim();
		if (!cleanUrl.match(/^https?:\/\//)) {
			cleanUrl = `https://${cleanUrl}`;
		}

		const isValidFormat = urlPatterns.some((pattern) => pattern.test(cleanUrl));

		const ecommercePatterns = [
			/\/product/,
			/\/item/,
			/\/goods/,
			/\/(?:buy|purchase)/,
			/\/(?:shop|store)/,
			/\/addtocart/,
			/\/cart/,
		];

		const hasEcommercePattern = ecommercePatterns.some((pattern) =>
			pattern.test(cleanUrl.toLowerCase())
		);

		if (!isValidFormat) {
			return { isValid: false, error: "Please enter a valid URL", cleanUrl };
		}

		if (
			!hasEcommercePattern &&
			!url.includes("product") &&
			!url.includes("item") &&
			!url.includes("shop")
		) {
			return {
				isValid: false,
				error: "Please enter a product or shop page URL",
				cleanUrl,
			};
		}

		return { isValid: true, error: "", cleanUrl };
	};

	// Mock product data extraction
	const extractProductData = async (url: string): Promise<ProductData> => {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		return {
			title: "Charm Bundle",
			price: 24.9,
			currency: "EUR",
			stockStatus: "Available",
			code: "2726",
			brand: "Luamaya",
			imageUrl: undefined,
			isValidUrl: true,
		};
	};

	const handleCheckUrl = async () => {
		setUrlError("");
		setIsValidating(true);
		setShowProduct(false);
		setProductData(null);

		try {
			const validation = validateUrl(competitorUrl);

			if (!validation.isValid) {
				setIsValidating(false);
				setUrlError(validation.error);
				setIsValid(false);
				return;
			}

			setCompetitorUrl(validation.cleanUrl.replace(/^https?:\/\//, ""));

			const extractedData = await extractProductData(validation.cleanUrl);

			if (!extractedData.isValidUrl) {
				setUrlError(
					extractedData.errorMessage ||
						"Unable to extract product data from this URL"
				);
				setIsValid(false);
			} else {
				setProductData(extractedData);
				setIsValid(true);
				setShowProduct(true);
			}
		} catch (error) {
			setUrlError("Error processing URL. Please try again.");
			setIsValid(false);
		} finally {
			setIsValidating(false);
		}
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newUrl = e.target.value;
		setCompetitorUrl(newUrl);

		if (urlError) setUrlError("");
		if (!isValid) setIsValid(true);
	};

	const handleBack = () => {
		if (typeof window !== "undefined") {
			window.history.back();
		}
	};

	const handleSave = () => {
		if (productData) {
			console.log("Saving competitor product:", productData);
			alert("Competitor product saved successfully!");

			if (typeof window !== "undefined") {
				window.history.back();
			}
		}
	};

	return (
		<div className='min-h-screen bg-transparent'>
			<div className='relative z-10'>
				<div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
					{/* Header Section */}
					<div className='mx-auto mb-8 w-full max-w-5xl'>
						<div className='flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:flex-row'>
							<div className='flex items-center gap-3'>
								<h1 className='text-lg font-semibold text-gray-800 sm:text-xl'>
									Competitor's Product URL
								</h1>
								<Component1 variant='26' />
							</div>
							<a
								href='https://help.nogl.io/how-to-add-a-new-competitor/'
								className='whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700'
							>
								How it works
							</a>
						</div>

						<p className='mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-gray-600 sm:text-base'>
							Please enter a page of your competitor's store which contains
							product information
						</p>
					</div>

					{/* URL Input Section */}
					<div className='mx-auto mb-8 max-w-4xl'>
						<div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8'>
							<div className='space-y-4'>
								{/* URL Input */}
								<div className='relative'>
									<div className='flex flex-col items-stretch overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 sm:flex-row'>
										<div className='flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 sm:justify-start'>
											<span className='text-sm font-medium text-white'>
												https://
											</span>
										</div>

										<div className='relative flex-1'>
											<input
												ref={inputRef}
												type='text'
												value={competitorUrl}
												onChange={handleUrlChange}
												className='w-full rounded-r-xl border-0 bg-white px-4 py-4 pr-40 text-base font-normal text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0'
												placeholder="Enter competitor's product URL"
											/>

											{/* Valid Indicator */}
											{isValid && !urlError && !isValidating && (
												<div className='absolute bottom-0 right-36 top-0 flex items-center rounded-full bg-green-100 px-2 py-1'>
													<Component1 variant='27' />
													<span className='ml-1 text-xs font-medium text-green-700'>
														Valid
													</span>
												</div>
											)}

											{/* Loading State */}
											{isValidating && (
												<div className='absolute bottom-0 right-36 top-0 flex items-center rounded-full bg-blue-100 px-2 py-1'>
													<LoadingSpinner />
													<span className='ml-1 text-xs font-medium text-blue-700'>
														Checking...
													</span>
												</div>
											)}

											{/* Check Now Button */}
											<button
												onClick={handleCheckUrl}
												disabled={isValidating || !competitorUrl.trim()}
												className='absolute bottom-2 right-2 top-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
											>
												{isValidating ? <LoadingSpinner /> : "Check Now"}
											</button>
										</div>
									</div>
								</div>

								{/* Error Message */}
								{urlError && (
									<div className='rounded-lg border-l-4 border-red-400 bg-red-50 p-4'>
										<div className='flex items-start'>
											<svg
												className='mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-400'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path
													fillRule='evenodd'
													d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z'
													clipRule='evenodd'
												/>
											</svg>
											<span className='text-sm text-red-700'>{urlError}</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Product Analysis Section */}
					{showProduct && (
						<div className='mx-auto max-w-6xl'>
							<div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl'>
								<div className='p-8'>
									{/* Section Header */}
									<div className='mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4'>
										<div className='flex items-center gap-2'>
											<h2 className='text-xl font-semibold text-gray-800 sm:text-2xl'>
												Data Fields Matching
											</h2>
											<Component1 variant='28' />
										</div>
										<a
											href='https://help.nogl.io/how-to-add-a-new-competitor/'
											className='rounded-lg px-3 py-1 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700'
										>
											How it works
										</a>
									</div>

									<div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
										{/* Product Image */}
										<div className='lg:col-span-1'>
											<div className='flex aspect-square items-center justify-center rounded-xl border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner'>
												<div className='space-y-4 p-6 text-center'>
													<div className='mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-lg'>
														<svg
															className='h-12 w-12 text-yellow-700'
															fill='currentColor'
															viewBox='0 0 20 20'
														>
															<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
														</svg>
													</div>
													<div className='text-lg font-medium text-gray-700'>
														Product Image
													</div>
													<div className='text-sm leading-relaxed text-gray-600'>
														{productData
															? `${productData.title} from ${productData.brand}`
															: "Charm Bundle from Luamaya"}
													</div>
												</div>
											</div>
										</div>

										{/* Data Fields */}
										<div className='lg:col-span-2'>
											<div className='grid gap-6'>
												{/* Title Field */}
												<div className='space-y-2'>
													<label className='text-base font-medium text-gray-800'>
														Product Title
													</label>
													<div className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700'>
														{productData ? productData.title : "Charm Bundle"}
													</div>
												</div>

												{/* Price and Stock Grid */}
												<div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
													<div className='space-y-2'>
														<label className='text-base font-medium text-gray-800'>
															Price
														</label>
														<div className='flex overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
															<div className='border-r border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 text-sm font-semibold text-blue-800'>
																{productData ? productData.currency : "EUR"}
															</div>
															<div className='bg-white px-4 py-3 text-lg font-semibold text-gray-800'>
																{productData ? productData.price : "24.90"}
															</div>
														</div>
													</div>

													<div className='space-y-2'>
														<label className='text-base font-medium text-gray-800'>
															Stock Status
														</label>
														<div className='rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-medium text-green-800'>
															<div className='flex items-center gap-2'>
																<div className='h-2 w-2 rounded-full bg-green-500'></div>
																{productData
																	? productData.stockStatus
																	: "Available"}
															</div>
														</div>
													</div>
												</div>

												{/* Code Field */}
												<div className='space-y-2'>
													<label className='text-base font-medium text-gray-800'>
														Product Code
														<span className='ml-1 text-sm font-normal text-gray-500'>
															(EAN/UPC/GTIN/MPN)
														</span>
													</label>
													<div className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-lg text-gray-700'>
														{productData ? productData.code : "2726"}
													</div>
												</div>

												{/* Brand Field */}
												<div className='space-y-2'>
													<label className='text-base font-medium text-gray-800'>
														Brand
													</label>
													<div className='rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 font-semibold text-purple-800'>
														{productData ? productData.brand : "Luamaya"}
													</div>
												</div>
											</div>

											{/* Currency Note */}
											<div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
												<div className='flex items-start gap-3'>
													<svg
														className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600'
														fill='currentColor'
														viewBox='0 0 20 20'
													>
														<path
															fillRule='evenodd'
															d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
															clipRule='evenodd'
														/>
													</svg>
													<div className='text-sm text-blue-800'>
														<strong>Currency Note:</strong> Currency is
														auto-detected and can be changed from supplier's
														profile. If you think that any of this information
														is incorrect,
														<a
															href='#'
															className='ml-1 font-medium text-blue-600 underline hover:text-blue-700'
														>
															please contact us using this form
														</a>
													</div>
												</div>
											</div>

											{/* Action Buttons */}
											<div className='mt-8 flex flex-col justify-end gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:gap-4'>
												<button
													onClick={handleBack}
													className='rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md'
												>
													Back
												</button>
												<button
													onClick={handleSave}
													className='rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-xl'
												>
													Save Competitor
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
