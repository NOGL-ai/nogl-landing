import React, { FC } from "react";
import { TaxonomyType } from "@/data/types";
import Link from "next/link";
import Image from "next/image";
import convertNumbThousand from "@/utils/convertNumbThousand";
import { Route } from "@/routers/types";

export interface CategoryCardProps {
	className?: string;
	taxonomy: TaxonomyType;
	variant?: "default" | "detailed" | "minimal" | "featured";
	size?: "large" | "normal" | "small";
}

const CategoryCard: FC<CategoryCardProps> = ({
	className = "",
	taxonomy,
	variant = "default",
	size = "normal",
}) => {
	const { count, name, href = "/", thumbnail } = taxonomy;

	if (variant === "detailed") {
		return (
			<Link
				href={href as Route}
				className={`nc-CardCategory3 group relative flex flex-col items-center justify-center text-center p-4 sm:p-6 [ nc-box-1 ] [ nc-dark-box-bg ] ${className}`}
				data-nc-id="CardCategory3"
			>
				{/* Background Image */}
				<Image
					alt=""
					fill
					sizes="(max-width: 400px) 100vw, 400px"
					className="absolute inset-0 object-cover rounded-3xl"
					src={thumbnail || ""}
				/>
				<div className="absolute inset-0 bg-black/20 rounded-3xl"></div>

				{/* Content */}
				<div className="relative flex flex-col items-center justify-center text-center">
					<div className="text-2xl font-semibold text-white">{name}</div>
					<div className="text-sm text-white/70">
						{convertNumbThousand(count)} articles
					</div>
				</div>
			</Link>
		);
	}

	if (variant === "minimal") {
		return (
			<Link
				href={href as Route}
				className={`nc-CardCategory1 flex items-center ${className}`}
				data-nc-id="CardCategory1"
			>
				<div
					className={`relative flex-shrink-0 ${
						size === "large" ? "h-20 w-20" : size === "small" ? "h-8 w-8" : "h-12 w-12"
					} mr-4 overflow-hidden rounded-lg`}
				>
					<Image alt="" fill src={thumbnail || ""} />
				</div>
				<div className="flex-1">
					<h2 className="text-base font-semibold">{name}</h2>
					<span className="block mt-1 text-sm text-neutral-500 dark:text-neutral-400">
						{convertNumbThousand(count)} articles
					</span>
				</div>
			</Link>
		);
	}

	// Default variant
	return (
		<Link
			href={href as Route}
			className={`nc-CardCategory group relative flex flex-col items-center justify-center text-center p-4 sm:p-6 [ nc-box-1 ] [ nc-dark-box-bg ] ${className}`}
		>
			<div
				className={`relative flex-shrink-0 ${
					size === "large" ? "h-20 w-20" : size === "small" ? "h-8 w-8" : "h-12 w-12"
				} mb-4 overflow-hidden rounded-lg`}
			>
				<Image alt="" fill src={thumbnail || ""} />
			</div>
			<div className="text-center">
				<h2 className="text-base font-semibold">{name}</h2>
				<span className="block mt-1 text-sm text-neutral-500 dark:text-neutral-400">
					{convertNumbThousand(count)} articles
				</span>
			</div>
		</Link>
	);
};

export default CategoryCard;
