"use client";

export type PresetKey =
	| "discounts"
	| "warehouse-sales"
	| "restock-alerts"
	| "luggage"
	| "exclude-cart-emails"
	| "canon"
	| "video-ads";

const PRESETS: Array<{ key: PresetKey; label: string }> = [
	{ key: "discounts", label: "Discount Emails" },
	{ key: "warehouse-sales", label: "Warehouse Sales" },
	{ key: "restock-alerts", label: "Restock Alerts" },
	{ key: "luggage", label: "Luggage" },
	{ key: "exclude-cart-emails", label: "Exclude Cart Emails" },
	{ key: "canon", label: "Canon Products" },
	{ key: "video-ads", label: "Video Ads" },
];

export function PresetChips({
	active,
	onSelect,
	disabled,
}: {
	active: PresetKey | null;
	onSelect: (k: PresetKey | null) => void;
	disabled?: boolean;
}) {
	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-border-primary pb-3">
			<button
				type="button"
				disabled={disabled}
				onClick={() => onSelect(null)}
				className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
					active === null
						? "border-border-brand bg-brand-50 text-text-brand"
						: "border-border-primary bg-bg-primary text-text-tertiary hover:border-border-secondary hover:text-text-primary"
				}`}
			>
				All
			</button>
			{PRESETS.map((p) => (
				<button
					key={p.key}
					type="button"
					disabled={disabled}
					onClick={() => onSelect(p.key)}
					className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
						active === p.key
							? "border-border-brand bg-brand-50 text-text-brand"
							: "border-border-primary bg-bg-primary text-text-tertiary hover:border-border-secondary hover:text-text-primary"
					}`}
				>
					{p.label}
				</button>
			))}
		</div>
	);
}

export default PresetChips;
