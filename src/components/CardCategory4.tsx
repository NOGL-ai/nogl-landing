import React, { FC } from "react";
import { TaxonomyType } from "@/data/types";
import convertNumbThousand from "@/utils/convertNumbThousand";
import Link from "next/link";
import Image from "next/image";
import { Route } from "@/routers/types";

export interface CardCategory4Props {
	className?: string;
	taxonomy: TaxonomyType;
}

const CardCategory4: FC<CardCategory4Props> = ({
	className = "",
	taxonomy,
}) => {
	const { count, name, href = "/", thumbnail } = taxonomy;
	return (
		<Link
			href={href as Route}
			className={`nc-CardCategory4 flex flex-col ${className}`}
			data-nc-id='CardCategory4'
		>
			<div
				className={`aspect-w-5 aspect-h-5 sm:aspect-h-6 group relative h-0 w-full flex-shrink-0 overflow-hidden rounded-2xl`}
			>
				<Image
					src={thumbnail || ""}
					className='h-full w-full rounded-2xl object-cover'
					fill
					alt='archive'
					sizes='(max-width: 400px) 100vw, 400px'
				/>
				<span className='absolute inset-0 bg-black bg-opacity-10 opacity-0 transition-opacity group-hover:opacity-100'></span>
			</div>
			<div className='mt-4 truncate px-2 text-center'>
				<h2
					className={`truncate text-base font-medium text-neutral-900 sm:text-lg dark:text-neutral-100`}
				>
					{name}
				</h2>
				<span
					className={`text-neutral-6000 mt-2 block text-sm dark:text-neutral-400`}
				>
					{convertNumbThousand(count || 0)} sessions
				</span>
			</div>
		</Link>
	);
};

export default CardCategory4;
