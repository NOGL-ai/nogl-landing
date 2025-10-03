import React from "react";
import twFocusClass from "@/utils/twFocusClass";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	className = "",
}: PaginationProps) {
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<nav className={`inline-flex space-x-1 text-base font-medium ${className}`}>
			{pages.map((page) => (
				<button
					key={page}
					onClick={() => onPageChange(page)}
					className={`
						inline-flex h-11 w-11 items-center justify-center rounded-full
						transition-colors duration-200
						${
							page === currentPage
								? "bg-primary-6000 text-white"
								: "text-neutral-6000 border border-neutral-200 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
						}
						${twFocusClass()}
					`}
				>
					{page}
				</button>
			))}
		</nav>
	);
}
