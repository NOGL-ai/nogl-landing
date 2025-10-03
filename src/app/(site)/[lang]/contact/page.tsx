import React, { FC } from "react";
import { SectionSubscribe2 } from "@/components/organisms";
import SocialsList from "@/shared/SocialsList";
import { Label } from "@/components/atoms";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import ButtonPrimary from "@/shared/ButtonPrimary";

export interface PageContactProps {
	[key: string]: unknown;
}

const info = [
	{
		title: "🗺 ADDRESS",
		desc: "Photo booth tattooed prism, portland taiyaki hoodie neutra typewriter",
	},
	{
		title: "💌 EMAIL",
		desc: "nc.example@example.com",
	},
	{
		title: "☎ PHONE",
		desc: "000-123-456-7890",
	},
];

const PageContact: FC<PageContactProps> = () => {
	return (
		<div className={`nc-PageContact overflow-hidden`}>
			<div className='mb-24 lg:mb-32'>
				<h2 className='my-16 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 sm:my-20 md:text-5xl md:leading-[115%] dark:text-neutral-100'>
					Contact
				</h2>
				<div className='container mx-auto max-w-7xl'>
					<div className='grid flex-shrink-0 grid-cols-1 gap-12 sm:grid-cols-2 '>
						<div className='max-w-sm space-y-8'>
							{info.map((item, index) => (
								<div key={index}>
									<h3 className='text-sm font-semibold uppercase tracking-wider dark:text-neutral-200'>
										{item.title}
									</h3>
									<span className='mt-2 block text-neutral-500 dark:text-neutral-400'>
										{item.desc}
									</span>
								</div>
							))}
							<div>
								<h3 className='text-sm font-semibold uppercase tracking-wider dark:text-neutral-200'>
									🌏 SOCIALS
								</h3>
								<SocialsList className='mt-2' />
							</div>
						</div>
						<div>
							<form className='grid grid-cols-1 gap-6' action='#' method='post'>
								<label className='block'>
									<Label>Full name</Label>

									<Input
										placeholder='Example Doe'
										type='text'
										className='mt-1'
									/>
								</label>
								<label className='block'>
									<Label>Email address</Label>

									<Input
										type='email'
										placeholder='example@example.com'
										className='mt-1'
									/>
								</label>
								<label className='block'>
									<Label>Message</Label>

									<Textarea className='mt-1' rows={6} />
								</label>
								<div>
									<ButtonPrimary type='submit'>Send Message</ButtonPrimary>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>

			{/* OTHER SECTIONS */}
			<div className='container'>
				<SectionSubscribe2 className='pb-24 lg:pb-32' />
			</div>
		</div>
	);
};

export default PageContact;
