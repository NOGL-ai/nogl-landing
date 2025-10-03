import React, { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import convertNumbThousand from "@/utils/convertNumbThousand";
import { UrlObject } from "url";

// Define a more precise type for href
type Href = string | UrlObject;

// Update TaxonomyType interface
export interface TaxonomyType {
	id: string;
	href: Href;
	name: string;
	taxonomy: string;
	count: number;
	thumbnail: string;
}

export interface CardCategory3Props {
	className?: string;
	taxonomy: TaxonomyType;
}

const CardCategory3: FC<CardCategory3Props> = ({
	className = "",
	taxonomy,
}) => {
	const { count, name, href = "/", thumbnail } = taxonomy;

	// Type guard function to check if href is UrlObject
	const isUrlObject = (href: Href): href is UrlObject => {
		return typeof href === "object" && href !== null;
	};

	// Process href based on its type
	const processedHref = isUrlObject(href)
		? href
		: ({
				pathname: href,
			} as UrlObject);

	return (
		<Link
			href={processedHref}
			className={`nc-CardCategory3 flex flex-col ${className}`}
		>
			<div
				className={`aspect-w-5 aspect-h-5 sm:aspect-h-6 group relative h-0 w-full flex-shrink-0 overflow-hidden rounded-2xl`}
			>
				<Image
					src={thumbnail || ""}
					className='h-full w-full rounded-2xl object-cover'
					alt='places'
					fill
					sizes='(max-width: 400px) 100vw, 300px'
				/>
				<span className='absolute inset-0 bg-black bg-opacity-10 opacity-0 transition-opacity group-hover:opacity-100'></span>
			</div>
			<div className='mt-4 truncate'>
				<h2
					className={`truncate text-base font-medium text-neutral-900 sm:text-lg dark:text-neutral-100`}
				>
					{name}
				</h2>
				<span
					className={`text-neutral-6000 mt-1.5 block text-sm dark:text-neutral-400`}
				>
					{convertNumbThousand(count || 0)} sessions
				</span>
			</div>
		</Link>
	);
};

export default CardCategory3;
