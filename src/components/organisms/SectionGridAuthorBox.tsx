import { UserCard } from "@/components/molecules";

// Alias for CardAuthorBox components
const CardAuthorBox = UserCard;
const CardAuthorBox2 = UserCard;
import Heading from "@/shared/Heading";
import { DEMO_AUTHORS } from "@/data/authors";
import { AuthorType } from "@/data/types";
import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
		<section className='py-6 backdrop-blur-sm sm:py-10 lg:py-16'>
			<div className='mx-auto mb-6 max-w-[600px] px-4 sm:mb-8 sm:px-6 lg:mb-10'>
				<Heading
					desc={
						<div className='flex flex-col items-center gap-1 sm:gap-2'>
							<span className='bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 bg-clip-text text-base text-transparent sm:text-lg dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-100'>
								Find & Connect with Industry Leaders
							</span>
							<div className='flex items-center gap-2'>
								<span className='from-primary/60 via-primary to-primary/60 animate-gradient border-primary/20 rounded-full border bg-gradient-to-r bg-clip-text px-3 py-1 text-xs font-semibold text-transparent sm:text-sm'>
									Coming Soon
								</span>
								<span className='bg-primary size-2 animate-pulse rounded-full'></span>
							</div>
						</div>
					}
					isCenter
				>
					<span className='relative'>
						<span className='from-primary/80 via-primary to-primary/80 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-3xl'>
							Fashion Intelligence Directory
						</span>
						<span className='via-primary/50 absolute -bottom-2 left-0 h-[1px] w-full bg-gradient-to-r from-transparent to-transparent'></span>
					</span>
				</Heading>
			</div>
			<div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
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
				<div className='mt-8 flex flex-row items-center justify-center gap-4 sm:mt-10 sm:gap-6 md:gap-8 lg:mt-12'>
					<Link href='/author'>
						<Button
							variant='outline'
							className='px-3 py-2.5 text-sm transition-transform hover:scale-105 hover:transform sm:px-6 sm:text-base'
							disabled
						>
							Discover Specialists
						</Button>
					</Link>
					<Link href='/author'>
						<Button
							className='px-3 py-2.5 text-sm transition-transform hover:scale-105 hover:transform sm:px-6 sm:text-base'
							disabled
						>
							Join as Specialist
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default SectionGridAuthorBox;
