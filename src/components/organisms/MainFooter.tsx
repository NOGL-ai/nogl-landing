import React from "react";
import Logo from "@/shared/Logo";
import { Route } from "@/routers/types";
import Link from "next/link";
import Image from "next/image";

const Footer = ({ lang = "en" }: { lang?: string }) => {
	return (
		<footer className='z-1 py-17.5 lg:py-22.5 xl:py-27.5 relative mt-auto overflow-hidden bg-black'>
			<div className='mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				{/* <!-- footer menu start --> */}
				<div className='flex flex-wrap gap-10 lg:justify-between xl:flex-nowrap xl:gap-20'>
					<div className='w-full max-w-[275px]'>
						<Logo variant='dark' size='lg' />
						<p className='text-gray-5 mt-5'>
							© Nogl- Professional Services Platform
						</p>

						<ul className='mt-11 flex items-center gap-2'>
							<li>
								<a
									href='https://twitter.com/noglai'
									aria-label='Twitter'
									className='flex duration-200 ease-out hover:text-white'
								>
									<svg
										className='fill-current'
										width='32'
										height='32'
										viewBox='0 0 32 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path d='M13.063 9L16.558 13.475L20.601 9H23.055L17.696 14.931L24 23H19.062L15.196 18.107L10.771 23H8.316L14.051 16.658L8 9H13.063ZM12.323 10.347H10.866L19.741 21.579H21.101L12.323 10.347Z' />
									</svg>
								</a>
							</li>

							<li>
								<a
									href='https://facebook.com/noglai'
									aria-label='Facebook'
									className='flex duration-200 ease-out hover:text-white'
								>
									<svg
										className='fill-current'
										width='32'
										height='32'
										viewBox='0 0 32 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path d='M12.29 14.3C12.1722 14.2039 12.026 14.1494 11.874 14.145H11.251V17.872H11.874C12.0261 17.8674 12.1724 17.8125 12.29 17.716C12.3606 17.6615 12.4166 17.5905 12.4533 17.5093C12.4899 17.428 12.5059 17.3389 12.5 17.25V14.762C12.5049 14.6738 12.4884 14.5856 12.4518 14.5052C12.4152 14.4247 12.3597 14.3543 12.29 14.3ZM22.432 8H9.568C8.704 8 8.002 8.7 8 9.564V22.436C8.00106 22.8512 8.16673 23.249 8.46067 23.5422C8.75461 23.8354 9.15283 24 9.568 24H22.432C23.296 24 23.998 23.3 24 22.436V9.564C23.9989 9.14883 23.8333 8.75103 23.5393 8.45784C23.2454 8.16465 22.8472 8 22.432 8ZM13.507 17.257C13.5152 17.4842 13.4758 17.7106 13.3914 17.9216C13.307 18.1327 13.1794 18.3238 13.0168 18.4826C12.8542 18.6415 12.6601 18.7646 12.4471 18.844C12.2342 18.9235 12.0069 18.9575 11.78 18.944H10.123V13.035H11.815C12.0392 13.0265 12.2628 13.0643 12.4718 13.1461C12.6807 13.2279 12.8705 13.352 13.0293 13.5105C13.1882 13.669 13.3125 13.8586 13.3947 14.0674C13.4769 14.2762 13.5151 14.4998 13.507 14.724V17.257ZM17.1 14.09H15.2V15.462H16.363V16.519H15.2V17.89H17.1V18.946H14.883C14.7884 18.9487 14.6943 18.9327 14.6059 18.8989C14.5175 18.8652 14.4367 18.8144 14.3679 18.7493C14.2992 18.6843 14.244 18.6064 14.2054 18.5201C14.1668 18.4337 14.1456 18.3406 14.143 18.246V13.775C14.1382 13.5843 14.2091 13.3994 14.3403 13.2609C14.4715 13.1224 14.6523 13.0415 14.843 13.036H17.1V14.09ZM20.8 18.208C20.329 19.308 19.484 19.088 19.106 18.208L17.734 13.036H18.9L19.958 17.1L21.014 13.038H22.178L20.8 18.208Z' />
									</svg>
								</a>
							</li>

							<li>
								<a
									href='https://youtube.com/@noglai'
									aria-label='YouTube'
									className='flex duration-200 ease-out hover:text-white'
								>
									<svg
										className='fill-current'
										width='32'
										height='32'
										viewBox='0 0 32 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path d='M27 12.3c-.2-1.6-1.6-2.9-3.2-3.1C21.6 9 16 9 16 9s-5.6 0-7.8.2C6.6 9.4 5.2 10.7 5 12.3 4.8 14.3 4.8 18 4.8 18s0 3.7.2 5.7c.2 1.6 1.6 2.9 3.2 3.1C10.4 27 16 27 16 27s5.6 0 7.8-.2c1.6-.2 3-1.5 3.2-3.1.2-2 .2-5.7.2-5.7s0-3.7-.2-5.7zM14 21v-6l6 3-6 3z' />
									</svg>
								</a>
							</li>
							<li>
								<a
									href='https://instagram.com/noglai'
									aria-label='Instagram'
									className='flex duration-200 ease-out hover:text-white'
								>
									<svg
										className='fill-current'
										width='32'
										height='32'
										viewBox='0 0 32 32'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path d='M20 8H12C9.8 8 8 9.8 8 12V20C8 22.2 9.8 24 12 24H20C22.2 24 24 22.2 24 20V12C24 9.8 22.2 8 20 8ZM22 20C22 21.1 21.1 22 20 22H12C10.9 22 10 21.1 10 20V12C10 10.9 10.9 10 12 10H20C21.1 10 22 10.9 22 12V20ZM21 12.5C21 12.8 20.8 13 20.5 13H19.5C19.2 13 19 12.8 19 12.5V11.5C19 11.2 19.2 11 19.5 11H20.5C20.8 11 21 11.2 21 11.5V12.5ZM16 12C13.8 12 12 13.8 12 16C12 18.2 13.8 20 16 20C18.2 20 20 18.2 20 16C20 13.8 18.2 12 16 12ZM16 18.5C14.6 18.5 13.5 17.4 13.5 16C13.5 14.6 14.6 13.5 16 13.5C17.4 13.5 18.5 14.6 18.5 16C18.5 17.4 17.4 18.5 16 18.5Z' />
									</svg>
								</a>
							</li>
						</ul>
					</div>

					<div className='flex w-full flex-col justify-between gap-10 sm:w-auto sm:flex-row xl:gap-20'>
						<div className='w-full sm:w-auto'>
							<h2 className='font-satoshi mb-5 text-lg font-bold -tracking-[0.2px] text-white'>
								Products
							</h2>

							<ul className='flex flex-col gap-3'>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Features
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Integrations
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Pricing & Plans
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Changelog
									</a>
								</li>
							</ul>
						</div>

						<div className='w-full sm:w-auto'>
							<h2 className='font-satoshi mb-5 text-lg font-bold -tracking-[0.2px] text-white'>
								Resources
							</h2>

							<ul className='flex flex-col gap-3'>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Our Blog
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Heatmaps
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Affiliate Program
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Integrations
									</a>
								</li>
							</ul>
						</div>

						<div className='w-full sm:w-auto'>
							<h2 className='font-satoshi mb-5 text-lg font-bold -tracking-[0.2px] text-white'>
								Products
							</h2>

							<ul className='flex flex-col gap-3'>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Features
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Integrations
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Pricing & Plans
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Changelog
									</a>
								</li>
							</ul>
						</div>

						<div className='w-full sm:w-auto'>
							<h2 className='font-satoshi mb-5 text-lg font-bold -tracking-[0.2px] text-white'>
								Company
							</h2>

							<ul className='flex flex-col gap-3'>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										About Us
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Our Story
									</a>
								</li>
								<li>
									<a
										className='text-gray-5 duration-200 ease-out hover:text-white'
										href='#'
									>
										Work With Us
									</a>
								</li>
							</ul>
						</div>

						<div className='w-full sm:w-auto'>
							<h2 className='font-satoshi mb-5 text-lg font-bold -tracking-[0.2px] text-white'>
								Legal
							</h2>

							<ul className='flex flex-col gap-3'>
								<li>
									<Link
										href={lang === "de" ? "/datenschutz" : "/privacy-policy"}
										className='text-gray-5 duration-200 ease-out hover:text-white'
									>
										{lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
									</Link>
								</li>
								<li>
									<Link
										href={lang === "de" ? "/agb" : "/tos"}
										className='text-gray-5 duration-200 ease-out hover:text-white'
									>
										{lang === "de"
											? "Allgemeine Geschäftsbedingungen"
											: "Terms of Service"}
									</Link>
								</li>
								{lang === "de" && (
									<li>
										<Link
											href='/impressum'
											className='text-gray-5 duration-200 ease-out hover:text-white'
										>
											Impressum
										</Link>
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>
				{/* <!-- footer menu end --> */}
			</div>

			{/* <!-- bg shapes --> */}
			<div className='hidden sm:block'>
				<div className='-z-1 absolute bottom-0 left-0'>
					<Image
						src='/images/footer/footer-grid-01.svg'
						alt='grid'
						width={305}
						height={305}
					/>
				</div>
				<div className='-z-1 absolute right-0 top-0'>
					<Image
						src='/images/footer/footer-grid-02.svg'
						alt='grid'
						width={305}
						height={305}
					/>
				</div>
				
				{/* Logo.dev Attribution */}
			</div>
		</footer>
	);
};

export default Footer;
