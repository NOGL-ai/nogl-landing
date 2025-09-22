"use client";
import React, { useState } from "react";
import FaqItem from "./FaqItem";
import SectionHeader from "@/components/Common/SectionHeader";

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
		<section className='overflow-hidden py-17.5 lg:py-22.5 xl:py-27.5'>
			{/* <!-- section title --> */}
			<SectionHeader
				title={dictionary.faq.title}
				description={dictionary.faq.description}
			/>

			<div className='mx-auto w-full max-w-[662px] px-4 sm:px-8 xl:px-0'>
				<div className='flex flex-col gap-4'>
					{/* <!-- Accordion Item --> */}
					{dictionary.faq.items?.map((faq, key) => (
						<div key={key} className="bg-white backdrop-blur-sm border border-gray-100 shadow-[0px_5px_15px_0px_rgba(7,10,46,0.04)] rounded-lg dark:bg-white/5 dark:border-gray-800">
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
