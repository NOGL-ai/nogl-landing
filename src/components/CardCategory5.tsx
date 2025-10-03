import React, { FC } from "react";
import { TaxonomyType } from "@/data/types";
import convertNumbThousand from "@/utils/convertNumbThousand";
import Link from "next/link";
import Image from "next/image";
import { Route } from "@/routers/types";

export interface CardCategory5Props {
	className?: string;
	taxonomy: TaxonomyType;
}

const CardCategory5: FC<CardCategory5Props> = ({
	className = "",
	taxonomy,
}) => {
	const { count, name, href = "/", thumbnail } = taxonomy;
	return (
		<Link
			href={href as Route}
			className={`nc-CardCategory5 flex flex-col ${className}`}
			data-nc-id='CardCategory5'
		>
			<div
				className={`aspect-w-4 aspect-h-3 group relative h-0 w-full flex-shrink-0 overflow-hidden rounded-2xl`}
			>
				<Image
					fill
					alt=''
					src={thumbnail || ""}
					className='h-full w-full rounded-2xl object-cover'
					sizes='(max-width: 400px) 100vw, 400px'
				/>
				<span className='absolute inset-0 bg-black bg-opacity-10 opacity-0 transition-opacity group-hover:opacity-100'></span>
			</div>
			<div className='mt-4 truncate px-3'>
				<h2
					className={`truncate text-base font-medium text-neutral-900 sm:text-lg dark:text-neutral-100`}
				>
					{name}
				</h2>
				<span
					className={`text-neutral-6000 mt-2 block text-sm dark:text-neutral-400`}
				>
					{convertNumbThousand(count)} sessions
				</span>
			</div>
		</Link>
	);
};

export default CardCategory5;
