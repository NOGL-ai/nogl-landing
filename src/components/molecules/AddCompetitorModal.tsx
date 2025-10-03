"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ModalCloseButton from "../atoms/ModalCloseButton";

interface AddCompetitorModalProps {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	onMarketplaceClick: () => void;
	onEcommerceClick: () => void;
}

export default function AddCompetitorModal({
	showModal,
	setShowModal,
	onMarketplaceClick,
	onEcommerceClick,
}: AddCompetitorModalProps) {
	const router = useRouter();

	// ===== click outside of dropdown =====
	const divRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (typeof window !== "undefined") {
			const handleClickOutside = (event: MouseEvent) => {
				if (divRef.current && !divRef.current.contains(event.target as Node)) {
					setShowModal(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	});

	return (
		<>
			{showModal && (
				<div className='py-7.6 z-99999 dark:bg-dark/70 fixed left-0 top-0 flex h-screen w-full items-center justify-center bg-black/90 px-4 sm:px-8'>
					<div
						ref={divRef}
						className='shadow-7 relative h-auto max-h-[calc(100vh-60px)] w-full max-w-2xl scale-100 transform overflow-y-auto rounded-[25px] bg-white transition-all dark:bg-black'
					>
						<ModalCloseButton closeModal={setShowModal} />

						{/* Header */}
						<div className='gap-5.5 border-stroke dark:border-stroke-dark sm:p-7.5 flex flex-wrap border-b p-4 xl:p-10'>
							<h3 className='font-satoshi text-custom-2xl text-dark mb-1.5 font-bold tracking-[-.5px] dark:text-white'>
								Add Competitor
							</h3>
						</div>

						{/* Content */}
						<div className='sm:p-7.5 p-4 xl:p-10'>
							{/* Instructions */}
							<p className='mb-8 text-sm leading-relaxed text-gray-600'>
								Please choose the kind of competitor you want to add.
								Marketplace for competitors like Amazon, eBay and Google
								Shopping or eCommerce Website for any other online store.
							</p>

							{/* Selection Panels */}
							<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
								{/* Marketplace Panel */}
								<div
									onClick={onMarketplaceClick}
									className='group flex cursor-pointer flex-col items-center justify-center rounded-lg bg-blue-50 p-8 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
								>
									<h3 className='mb-6 text-center text-lg font-semibold text-gray-900 dark:text-white'>
										Marketplace
									</h3>

									<div className='mb-6 flex flex-wrap items-center justify-center gap-4'>
										{/* Amazon Logo */}
										<div className='flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600'>
											<svg
												className='h-8 w-8 text-gray-600 dark:text-gray-300'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M6.5 2c-.9 0-1.6.7-1.6 1.6v16.8c0 .9.7 1.6 1.6 1.6.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6zm1.1 15.5l6.4-3.5c.3-.2.5-.5.5-.9V8c0-.4-.2-.8-.5-1L10 3.5c-.3-.2-.7-.2-1 0L2.6 7c-.3.2-.5.5-.5 1v3.1c0 .4.2.7.5.9l6.4 3.5.3-.3-.3.3c.3-.2.7-.2 1 0z' />
											</svg>
										</div>

										{/* Google Logo */}
										<div className='flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600'>
											<svg
												className='h-8 w-8 text-gray-600 dark:text-gray-300'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
												<path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
												<path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z' />
												<path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
											</svg>
										</div>

										{/* eBay Logo */}
										<div className='flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600'>
											<svg
												className='h-8 w-8 text-gray-600 dark:text-gray-300'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M12 2C5.373 2 0 7.373 0 14s5.373 12 12 12 12-5.373 12-12S18.627 2 12 2zm0 22C6.486 24 2 19.514 2 14S6.486 4 12 4s10 4.486 10 10-4.486 10-10 10z' />
												<path d='M8 8h8v2H8zm0 4h8v2H8zm0 4h5v2H8z' />
											</svg>
										</div>
									</div>

									<div className='text-sm font-medium text-blue-600 underline hover:no-underline dark:text-blue-400'>
										Start monitoring a marketplace
									</div>
								</div>

								{/* eCommerce Website Panel */}
								<div
									onClick={() => {
										setShowModal(false);
										router.push("/en/competitors/add-ecommerce");
									}}
									className='group flex cursor-pointer flex-col items-center justify-center rounded-lg bg-blue-50 p-8 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
								>
									<h3 className='mb-6 text-center text-lg font-semibold text-gray-900 dark:text-white'>
										eCommerce Website
									</h3>

									<div className='mb-6 flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 transition-colors group-hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600'>
										{/* Storefront Icon */}
										<svg
											className='h-12 w-12 text-gray-600 dark:text-gray-300'
											viewBox='0 0 24 24'
											fill='currentColor'
										>
											<path d='M12 2L3 7v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-9-5zM8 11v6h8v-6H8zm10 6v-6h2v6h-2zm-12 0v-6h2v6H6z' />
										</svg>
									</div>

									<div className='text-sm font-medium text-blue-600 underline hover:no-underline dark:text-blue-400'>
										Start monitoring an ecommerce website
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
