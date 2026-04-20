"use client";

type PresetKey = "discounts" | "canon" | "video-ads";

const PRESETS: Array<{ key: PresetKey; label: string }> = [
	{ key: "discounts", label: "Discount Emails" },
	{ key: "canon", label: "Canon Products" },
	{ key: "video-ads", label: "Video Ads" },
];

export function PresetChips({
	active,
	onSelect,
}: {
	active: PresetKey | null;
	onSelect: (k: PresetKey | null) => void;
}) {
	return (
		<div className='flex flex-wrap items-center gap-2'>
			<button
				type='button'
				onClick={() => onSelect(null)}
				className={`rounded-full border px-3 py-1 text-xs transition ${
					active === null
						? "border-primary bg-primary/10 text-primary"
						: "border-border bg-card text-muted-foreground hover:border-primary/50"
				}`}
			>
				All
			</button>
			{PRESETS.map((p) => (
				<button
					key={p.key}
					type='button'
					onClick={() => onSelect(p.key)}
					className={`rounded-full border px-3 py-1 text-xs transition ${
						active === p.key
							? "border-primary bg-primary/10 text-primary"
							: "border-border bg-card text-muted-foreground hover:border-primary/50"
					}`}
				>
					{p.label}
				</button>
			))}
		</div>
	);
}

export default PresetChips;
export type { PresetKey };
