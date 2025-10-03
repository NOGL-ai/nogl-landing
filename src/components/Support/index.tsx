"use client";
import React from "react";
import Breadcrumbs from "../Common/Breadcrumbs";
import Image from "next/image";

const Support = () => {
	return (
		<section className='lg:ub-pb-22.5 pb-17.5 pt-35 xl:pb-27.5 overflow-hidden'>
			{/* <!-- ===== Breadcrumb Section Start ===== --> */}
			<Breadcrumbs title={"Support"} pages={["Home", "Support"]} />
			{/* <!-- ===== Breadcrumb Section End ===== --> */}

			<div className='mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				<div className='bg-gray-1 flex flex-col overflow-hidden rounded-[20px] md:flex-row dark:bg-black'>
					<div className='sm:px-7.5 w-full px-4 py-16 lg:px-10 xl:px-16'>
						<form>
							<div className='mb-5 w-full'>
								<label
									htmlFor='fullName'
									className='font-satoshi text-dark mb-2.5 block font-medium -tracking-[0.2px] dark:text-white'
								>
									Full Name
								</label>

								<input
									type='text'
									name='fullName'
									id='fullName'
									placeholder='Enter your full name'
									className='border-stroke placeholder:text-dark-5 focus:shadow-input focus:ring-primary/20 dark:border-stroke-dark w-full rounded-[10px] border bg-white px-6 py-3 outline-none duration-200 focus:border-transparent focus:ring-2 dark:bg-black'
								/>
							</div>

							<div className='mb-5 w-full'>
								<label
									htmlFor='email'
									className='font-satoshi text-dark mb-2.5 block font-medium -tracking-[0.2px] dark:text-white'
								>
									Email
								</label>

								<input
									type='email'
									name='email'
									id='email'
									placeholder='Enter your Email'
									className='border-stroke placeholder:text-dark-5 focus:shadow-input focus:ring-primary/20 dark:border-stroke-dark w-full rounded-[10px] border bg-white px-6 py-3 outline-none duration-200 focus:border-transparent focus:ring-2 dark:bg-black'
								/>
							</div>

							<div className='mb-7.5'>
								<label
									htmlFor='message'
									className='font-satoshi text-dark mb-2.5 block font-medium -tracking-[0.2px] dark:text-white'
								>
									Message
								</label>

								<textarea
									name='message'
									id='message'
									rows={5}
									placeholder='Type your message'
									className='border-stroke placeholder:text-dark-5 focus:shadow-input focus:ring-primary/20 dark:border-stroke-dark w-full rounded-[10px] border bg-white px-6 py-3 outline-none duration-200 focus:border-transparent focus:ring-2 dark:bg-black'
								></textarea>
							</div>

							<button
								type='submit'
								className='bg-primary font-satoshi hover:bg-primary-dark flex w-full justify-center rounded-full p-[13px] font-medium text-white duration-200 ease-out'
							>
								Send Message
							</button>
						</form>
					</div>

					<div className='z-1 py-15 sm:p-7.5 relative flex w-full max-w-[570px] items-center justify-center bg-black p-4'>
						{/* <!-- bg shapes --> */}
						<div>
							<div className='-z-1 absolute bottom-0 left-0'>
								<Image
									src='/images/support/support-grid-01.svg'
									alt='grid'
									width={364}
									height={364}
								/>
							</div>
							<div className='-z-1 absolute right-0 top-0'>
								<Image
									src='/images/support/support-grid-02.svg'
									alt='grid'
									width={368}
									height={368}
								/>
							</div>
							<div className='-z-1 absolute bottom-0 left-0'>
								<Image
									src='/images/support/support-shape-01.svg'
									alt='shape'
									width={343}
									height={391}
								/>
							</div>
							<div className='-z-1 absolute right-0 top-0'>
								<Image
									src='/images/support/support-shape-02.svg'
									alt='shape'
									width={421}
									height={538}
								/>
							</div>
						</div>

						<div>
							<h2 className='font-satoshi text-custom-3xl mb-5 max-w-[357px] font-bold -tracking-[1.3px] text-white'>
								Need any help? Just open a support ticket
							</h2>
							<p className='text-gray-5 max-w-[270px]'>
								Our support team will get back to as soon as they can.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Support;
