"use client";

import { Button } from "@/components/base/buttons/button";
import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export interface UntitledPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	siblingCount?: number;
	className?: string;
}

function generatePaginationItems(
	currentPage: number,
	totalPages: number,
	siblingCount: number = 1
) {
	const items: (number | "ellipsis")[] = [];
	const totalPageNumbers = siblingCount * 2 + 5;

	if (totalPageNumbers >= totalPages) {
		for (let i = 1; i <= totalPages; i++) {
			items.push(i);
		}
	} else {
		const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
		const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

		const showLeftEllipsis = leftSiblingIndex > 2;
		const showRightEllipsis = rightSiblingIndex < totalPages - 1;

		if (!showLeftEllipsis && showRightEllipsis) {
			const leftItemCount = siblingCount * 2 + 3;
			for (let i = 1; i <= leftItemCount; i++) {
				items.push(i);
			}
			items.push("ellipsis");
			items.push(totalPages);
		} else if (showLeftEllipsis && !showRightEllipsis) {
			const rightItemCount = siblingCount * 2 + 3;
			items.push(1);
			items.push("ellipsis");
			for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
				items.push(i);
			}
		} else if (showLeftEllipsis && showRightEllipsis) {
			items.push(1);
			items.push("ellipsis");
			for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
				items.push(i);
			}
			items.push("ellipsis");
			items.push(totalPages);
		}
	}

	return items;
}

export function UntitledPagination({
	currentPage,
	totalPages,
	onPageChange,
	siblingCount = 1,
	className,
}: UntitledPaginationProps) {
	const items = generatePaginationItems(currentPage, totalPages, siblingCount);
	const isPrevDisabled = currentPage <= 1;
	const isNextDisabled = currentPage >= totalPages;

	return (
		<div
			className={cx(
				"flex items-center justify-center gap-3 border-t border-border px-6 py-3",
				className
			)}
		>
			{/* Previous Button */}
			<div className="flex-1">
				<Button
					size="sm"
					color="secondary"
					isDisabled={isPrevDisabled}
					onClick={() => !isPrevDisabled && onPageChange(currentPage - 1)}
					iconLeading={ArrowLeft}
					className={cx(
						isPrevDisabled && "opacity-50 cursor-not-allowed"
					)}
				>
					Previous
				</Button>
			</div>

			{/* Page Numbers */}
			<div className="flex items-center gap-0.5">
				{items.map((item, index) => {
					if (item === "ellipsis") {
						return (
							<span
								key={`ellipsis-${index}`}
								className="flex h-10 w-10 items-center justify-center text-sm text-secondary"
								aria-hidden="true"
							>
								...
							</span>
						);
					}

					const isActive = item === currentPage;

					return (
						<button
							key={item}
							onClick={() => onPageChange(item)}
							aria-label={`Page ${item}`}
							aria-current={isActive ? "page" : undefined}
							className={cx(
								"flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
								isActive
									? "bg-gray-50 text-gray-700"
									: "text-gray-700 hover:bg-gray-50"
							)}
						>
							{item}
						</button>
					);
				})}
			</div>

			{/* Next Button */}
			<div className="flex flex-1 justify-end">
				<Button
					size="sm"
					color="secondary"
					isDisabled={isNextDisabled}
					onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
					iconTrailing={ArrowRight}
					className={cx(
						isNextDisabled && "opacity-50 cursor-not-allowed"
					)}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
