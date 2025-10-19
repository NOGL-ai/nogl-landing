"use client";
import React, { useState } from "react";
import FaqItem from "./FaqItem";
import SectionHeader from "@/components/molecules/SectionHeader";

interface FAQProps {
	dictionary: {
		faq: {
			title: string;
			description: string;
			items: Array<{
				id: number;
				question: string;
				answer: string;
			}>;
		};
	};
}

const FAQ: React.FC<FAQProps> = ({ dictionary }) => {
	const [activeFaq, setActiveFaq] = useState<number | string>(1);

	const handleFaqToggle = (id: number | string) => {
		activeFaq === id ? setActiveFaq(0) : setActiveFaq(id);
	};

	return (
		<section className='py-17.5 lg:py-22.5 xl:py-27.5 overflow-hidden'>
			{/* <!-- section title --> */}
			<SectionHeader
				title={dictionary.faq.title}
				description={dictionary.faq.description}
			/>

			<div className='mx-auto w-full max-w-[662px] px-4 sm:px-8 xl:px-0'>
				<div className='flex flex-col gap-4'>
					{/* <!-- Accordion Item --> */}
					{dictionary.faq.items?.map((faq, key) => (
						<div
							key={key}
							className='rounded-lg border border-border bg-white shadow-[0px_5px_15px_0px_rgba(7,10,46,0.04)] backdrop-blur-sm dark:border-border dark:bg-white/5'
						>
							<FaqItem
								faq={faq}
								handleFaqToggle={handleFaqToggle}
								activeFaq={activeFaq}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FAQ;
