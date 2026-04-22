"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ExportTab = "generate" | "all-exports" | "scheduled" | "credits";

const TAB_ITEMS: Array<{ id: ExportTab; label: string }> = [
	{ id: "generate", label: "Generate" },
	{ id: "all-exports", label: "All Exports" },
	{ id: "scheduled", label: "Scheduled" },
	{ id: "credits", label: "Purchase More Credits" },
];

type PresetKey =
	| "new-products"
	| "product-pricing"
	| "monthly-sales"
	| "sku-sizes"
	| "womens-sales";

const PRESETS: Array<{ key: PresetKey; label: string }> = [
	{ key: "new-products", label: "New Products" },
	{ key: "product-pricing", label: "Product Pricing" },
	{ key: "monthly-sales", label: "Monthly Competitor Sales" },
	{ key: "sku-sizes", label: "SKU Sizes" },
	{ key: "womens-sales", label: "Women's Sales over Time" },
];

const PRESET_CONFIG: Record<
	PresetKey,
	{ aggregation: string; datasource: string; columnsCount: number; previewFile: string; sampleNote: string }
> = {
	"new-products": {
		aggregation: "Entire Selected Period",
		datasource: "Products",
		columnsCount: 21,
		previewFile: "new_products_export.csv",
		sampleNote: "Newly observed products in the selected period.",
	},
	"product-pricing": {
		aggregation: "Daily",
		datasource: "Products",
		columnsCount: 24,
		previewFile: "product_pricing_export.csv",
		sampleNote: "Price and discount snapshots for tracked SKUs.",
	},
	"monthly-sales": {
		aggregation: "Monthly",
		datasource: "Products",
		columnsCount: 18,
		previewFile: "monthly_competitor_sales.csv",
		sampleNote: "Monthly grouped sales and assortment movement.",
	},
	"sku-sizes": {
		aggregation: "Entire Selected Period",
		datasource: "Products",
		columnsCount: 16,
		previewFile: "sku_sizes_export.csv",
		sampleNote: "Size-level SKU coverage and availability.",
	},
	"womens-sales": {
		aggregation: "Weekly",
		datasource: "Products",
		columnsCount: 20,
		previewFile: "womens_sales_over_time.csv",
		sampleNote: "Women's segment sales trend over time.",
	},
};

function EmptyState({
	title,
	description,
	ctaLabel,
	onClick,
}: {
	title: string;
	description: string;
	ctaLabel: string;
	onClick: () => void;
}) {
	return (
		<div className="rounded-xl border border-dashed border-border-primary bg-bg-primary px-6 py-16 text-center">
			<p className="text-base font-semibold text-text-primary">{title}</p>
			<p className="mx-auto mt-2 max-w-2xl text-sm text-text-tertiary">{description}</p>
			<button
				type="button"
				onClick={onClick}
				className="mt-5 inline-flex h-9 items-center rounded-lg bg-bg-brand-solid px-4 text-sm font-medium text-white"
			>
				{ctaLabel}
			</button>
		</div>
	);
}

export function ExportsWorkspace({ lang }: { lang: string }) {
	const [activeTab, setActiveTab] = useState<ExportTab>("generate");
	const [selectedPreset, setSelectedPreset] = useState<PresetKey>("new-products");

	const tabBody = useMemo(() => {
		if (activeTab === "generate") {
			const cfg = PRESET_CONFIG[selectedPreset];
			return (
				<div className="space-y-6">
					<section>
						<h2 className="text-lg font-semibold text-text-primary">Presets</h2>
						<p className="mt-1 text-sm text-text-tertiary">
							Apply a preset of already configured options to quickly get a report.
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{PRESETS.map((preset) => (
									<button
										key={preset.key}
										type="button"
										onClick={() => setSelectedPreset(preset.key)}
										aria-pressed={selectedPreset === preset.key}
										className={`rounded-full border px-3 py-1.5 text-sm transition ${
											selectedPreset === preset.key
												? "border-border-brand bg-brand-50 text-text-brand"
												: "border-border-primary bg-bg-primary text-text-primary hover:bg-bg-secondary"
										}`}
									>
										{preset.label}
									</button>
								))}
						</div>
					</section>

					<section className="rounded-xl border border-border-primary bg-bg-primary">
						<div className="border-b border-border-primary px-4 py-3 text-sm font-semibold text-text-primary">
							Report Generation Options
						</div>
						<div className="grid gap-4 p-4 lg:grid-cols-2">
							<div className="space-y-3 rounded-lg border border-border-primary bg-bg-primary p-3">
								<label className="block text-xs font-medium uppercase tracking-wide text-text-tertiary">
									Competitor *
								</label>
								<select className="h-9 w-full rounded-md border border-border-primary bg-bg-primary px-2 text-sm text-text-primary">
									<option>All</option>
								</select>
								<label className="block text-xs font-medium uppercase tracking-wide text-text-tertiary">
									Timeseries Aggregation *
								</label>
								<select className="h-9 w-full rounded-md border border-border-primary bg-bg-primary px-2 text-sm text-text-primary">
									<option>{cfg.aggregation}</option>
								</select>
								<label className="block text-xs font-medium uppercase tracking-wide text-text-tertiary">
									Time Frame *
								</label>
								<input type="date" className="h-9 w-full rounded-md border border-border-primary bg-bg-primary px-2 text-sm text-text-primary" />
								<label className="block text-xs font-medium uppercase tracking-wide text-text-tertiary">
									Datasource *
								</label>
								<select className="h-9 w-full rounded-md border border-border-primary bg-bg-primary px-2 text-sm text-text-primary">
									<option>{cfg.datasource}</option>
								</select>
								<label className="block text-xs font-medium uppercase tracking-wide text-text-tertiary">
									Columns
								</label>
								<p className="text-xs text-text-tertiary">{cfg.columnsCount} columns selected</p>
								<button
									type="button"
									className="inline-flex h-9 items-center rounded-lg bg-bg-brand-solid px-4 text-sm font-medium text-white"
								>
									Generate {PRESETS.find((p) => p.key === selectedPreset)?.label}
								</button>
							</div>
							<div id="report-preview" className="rounded-lg border border-border-primary bg-bg-primary p-4">
								<div className="mb-3 flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
										Preview
									</span>
									<span className="rounded bg-bg-secondary px-2 py-0.5 text-xs text-text-tertiary">{cfg.previewFile}</span>
								</div>
								<div className="overflow-x-auto rounded border border-border-primary">
									<table className="min-w-full w-full text-xs">
										<thead className="bg-bg-secondary text-left text-text-tertiary">
											<tr>
												{[
													"start_date",
													"end_date",
													"company_id",
													"product_id",
													"company_name",
													"product_title",
												].map((h) => (
													<th key={h} className="px-2 py-2 font-medium">
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											<tr className="border-t border-border-primary">
												<td className="px-2 py-2">2026-04-01</td>
												<td className="px-2 py-2">2026-04-21</td>
												<td className="px-2 py-2">cmp_123</td>
												<td className="px-2 py-2">prod_456</td>
												<td className="px-2 py-2">Sample Co</td>
												<td className="px-2 py-2">{cfg.sampleNote}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</section>
				</div>
			);
		}

		if (activeTab === "all-exports") {
			return (
				<EmptyState
					title="No reports have been generated"
					description="Reports generated from the Generate tab are stored here and accessible to other members of your team."
					ctaLabel="Go to Generate"
					onClick={() => setActiveTab("generate")}
				/>
			);
		}

		if (activeTab === "scheduled") {
			return (
				<div className="space-y-4">
					<p className="text-sm text-text-tertiary">
						Reports that you have scheduled from tools within the app are visible here. To subscribe to a report,
						use Share or Subscribe actions where available.
					</p>
					<EmptyState
						title="Your Scheduled Reports"
						description="No report subscriptions were found for your account yet."
						ctaLabel="Browse reports"
						onClick={() => setActiveTab("all-exports")}
					/>
				</div>
			);
		}

		return (
			<div className="rounded-xl border border-border-primary bg-bg-primary p-6">
				<h2 className="text-lg font-semibold text-text-primary">500 credits available</h2>
				<p className="mt-2 text-sm text-text-tertiary">
					Credits are used when generating export reports. Purchase additional credits when your team needs more
					generation capacity.
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					{["+100 credits", "+500 credits", "+2000 credits"].map((pkg) => (
						<button
							key={pkg}
							type="button"
							className="rounded-lg border border-border-primary bg-bg-primary px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary"
						>
							{pkg}
						</button>
					))}
				</div>
			</div>
		);
	}, [activeTab, selectedPreset]);

	return (
		<div className="min-h-screen bg-bg-primary">
			<div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
				<div className="mb-4 flex flex-col gap-3 border-b border-border-primary pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-text-primary">Exports</h1>
						<p className="mt-1 text-sm text-text-tertiary">500 credits available</p>
					</div>
					<details className="w-full rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-sm sm:max-w-sm">
						<summary className="cursor-pointer font-medium text-text-primary">How to use</summary>
						<div className="mt-2 space-y-2 text-text-tertiary">
							<p>
								Generate new exports, browse team reports, manage scheduled reports, and purchase additional credits.
							</p>
							<div className="rounded-md border border-border-primary bg-bg-primary p-3">
								<p className="text-sm font-medium text-text-primary">Help</p>
								<p className="mt-1 text-xs text-text-tertiary">
									Running into issues? Email us at{" "}
									<a className="text-text-brand underline underline-offset-2" href="mailto:support@nogl.tech">
										support@nogl.tech
									</a>{" "}
									or use the links below.
								</p>
								<div className="mt-2 flex flex-wrap gap-2">
									<Link href="/en/help-center" className="text-xs text-text-brand underline underline-offset-2">
										Help Center
									</Link>
									<Link href="/en/settings" className="text-xs text-text-brand underline underline-offset-2">
										Settings
									</Link>
									<Link href="/en/user/billing" className="text-xs text-text-brand underline underline-offset-2">
										Billing
									</Link>
									<a
										href="https://github.com/NOGL-ai/nogl-landing/commits/main"
										target="_blank"
										rel="noreferrer"
										className="text-xs text-text-brand underline underline-offset-2"
									>
										Changelog
									</a>
									<a href="mailto:support@nogl.tech" className="text-xs text-text-brand underline underline-offset-2">
										Email Support
									</a>
								</div>
							</div>
						</div>
					</details>
				</div>

				<div className="mb-6 border-b border-border-primary">
					<div className="flex flex-wrap gap-0">
						{TAB_ITEMS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${
									activeTab === tab.id
										? "border-border-brand text-text-primary"
										: "border-transparent text-text-tertiary hover:text-text-primary"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				<main id="page-container" className="space-y-4">
					{tabBody}
				</main>

				<p className="mt-6 text-xs text-text-tertiary">
					Need deeper benchmarking?{" "}
					<Link href={`/${lang}/product-explorer`} className="text-text-brand underline underline-offset-2">
						Open Product Explorer
					</Link>
					.
				</p>
			</div>
		</div>
	);
}

