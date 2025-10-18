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
							© {new Date().getFullYear()} Nogl - AI-Powered Fashion Intelligence Platform
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
									href='https://linkedin.com/company/noglai'
									aria-label='LinkedIn'
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
										<path d='M20.447 20.452h-2.893v-4.518c0-1.082-.021-2.473-1.507-2.473-1.508 0-1.739 1.177-1.739 2.393v4.598h-2.893V11.988h2.777v1.274h.039c.387-.732 1.331-1.505 2.74-1.505 2.93 0 3.476 1.93 3.476 4.44v4.255zM9.362 10.712a1.68 1.68 0 1 1 .001-3.361 1.68 1.68 0 0 1-.001 3.361zM7.916 20.452h2.893V11.988H7.916v8.464zM22.993 6H9.005C7.898 6 7 6.883 7 7.972v16.056C7 25.117 7.898 26 9.005 26h13.988C24.102 26 25 25.117 25 24.028V7.972C25 6.883 24.102 6 22.993 6z' />
									</svg>
								</a>
							</li>
						</ul>
					</div>

					<div className='flex w-full flex-col justify-between gap-10 sm:w-auto sm:flex-row xl:gap-20'>
						<div className='w-full sm:w-auto'>
							<h2 className='font-satoshi mb-5 text-lg font-bold -tracking-[0.2px] text-white'>
								Resources
							</h2>

							<ul className='flex flex-col gap-3'>
								<li>
									<Link
										href='/blog'
										className='text-gray-5 duration-200 ease-out hover:text-white'
									>
										Help Center
									</Link>
								</li>
								<li>
									<Link
										href='/dashboard'
										className='text-gray-5 duration-200 ease-out hover:text-white'
									>
										Dashboard
									</Link>
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
								<li>
									<Link
										href='/impressum'
										className='text-gray-5 duration-200 ease-out hover:text-white'
									>
										Impressum
									</Link>
								</li>
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
