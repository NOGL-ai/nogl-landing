"use client";

type AssetNavigationRowProps = {
	activeIndex: number;
	totalForCounter: number;
	canNavigate: boolean;
	onPrev: () => void;
	onNext: () => void;
	className?: string;
};

export function AssetNavigationRow({
	activeIndex,
	totalForCounter,
	canNavigate,
	onPrev,
	onNext,
	className,
}: AssetNavigationRowProps) {
	return (
		<div className={`mb-4 flex flex-wrap items-center justify-between gap-2 text-sm ${className ?? ""}`}>
			<div className="font-medium text-text-primary">
				Asset {Math.max(activeIndex, 1)} of {totalForCounter.toLocaleString()}
			</div>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onPrev}
					disabled={!canNavigate}
					className="rounded-md border border-border-primary px-2 py-1 text-text-tertiary disabled:opacity-50"
					aria-label="Previous asset"
				>
					←
				</button>
				<button
					type="button"
					onClick={onNext}
					disabled={!canNavigate}
					className="rounded-md border border-border-primary px-2 py-1 text-text-tertiary disabled:opacity-50"
					aria-label="Next asset"
				>
					→
				</button>
				<div className="ml-2 text-text-tertiary">Use left and right arrow keys to navigate assets</div>
			</div>
		</div>
	);
}
