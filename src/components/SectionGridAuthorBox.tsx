import CardAuthorBox from "@/components/CardAuthorBox";
import CardAuthorBox2 from "@/components/CardAuthorBox2";
import Heading from "@/shared/Heading";
import { DEMO_AUTHORS } from "@/data/authors";
import { AuthorType } from "@/data/types";
import React, { FC } from "react";
import PulsatingButton from "@/components/ui/pulsating-button";
import RipplingButton from "@/components/ui/ripple-button";
import Link from 'next/link';

export interface SectionGridAuthorBoxProps {
	className?: string;
	authors?: AuthorType[];
	boxCard?: "box1" | "box2";
	gridClassName?: string;
}

const DEMO_DATA = DEMO_AUTHORS.filter((_, i) => i < 10);

const SectionGridAuthorBox: FC<SectionGridAuthorBoxProps> = ({
	className = "",
	authors = DEMO_DATA,
	boxCard = "box1",
	gridClassName = "grid-cols-3 gap-3 sm:gap-4 md:gap-6 xl:grid-cols-5",
}) => {
	return (
		<section className="py-6 sm:py-10 lg:py-16 backdrop-blur-sm">
			<div className="mx-auto max-w-[600px] px-4 sm:px-6 mb-6 sm:mb-8 lg:mb-10">
				<Heading 
					desc={
						<div className="flex flex-col items-center gap-1 sm:gap-2">
							<span className="text-base sm:text-lg bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-100 bg-clip-text text-transparent">
								Find & Connect with Industry Leaders
							</span>
							<div className="flex items-center gap-2">
								<span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 text-transparent bg-clip-text animate-gradient font-semibold border border-primary/20">
									Coming Soon
								</span>
								<span className="size-2 animate-pulse bg-primary rounded-full"></span>
							</div>
						</div>
					}
					isCenter
				>
					<span className="relative">
						<span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary/80 via-primary to-primary/80 bg-clip-text text-transparent">
							Fashion Intelligence Directory
						</span>
						<span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></span>
					</span>
				</Heading>
			</div>
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6">
				<div className={`grid ${gridClassName}`}>
					{authors.map((author, index) =>
						boxCard === "box2" ? (
							<CardAuthorBox2 key={author.id} author={author} />
						) : (
							<CardAuthorBox
								index={index < 3 ? index + 1 : undefined}
								key={author.id}
								author={author}
							/>
						)
					)}
				</div>
				<div className='mt-8 sm:mt-10 lg:mt-12 flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8'>
					<Link href="/author">
						<RipplingButton 
							className="hover:transform hover:scale-105 transition-transform text-sm sm:text-base px-3 sm:px-6 py-2.5"
							disabled
						>
							Discover Specialists
						</RipplingButton>
					</Link>
					<Link href="/author">
						<PulsatingButton 
							className="hover:transform hover:scale-105 transition-transform text-sm sm:text-base px-3 sm:px-6 py-2.5"
							disabled
						>
							Join as Specialist
						</PulsatingButton>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default SectionGridAuthorBox;
