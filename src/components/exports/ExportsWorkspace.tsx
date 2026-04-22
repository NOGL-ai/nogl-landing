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
		<div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
			<p className="text-base font-semibold text-foreground">{title}</p>
			<p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
			<button
				type="button"
				onClick={onClick}
				className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
			>
				{ctaLabel}
			</button>
		</div>
	);
}

export function ExportsWorkspace({ lang }: { lang: string }) {
	const [activeTab, setActiveTab] = useState<ExportTab>("generate");

	const tabBody = useMemo(() => {
		if (activeTab === "generate") {
			return (
				<div className="space-y-6">
					<section>
						<h2 className="text-lg font-semibold text-foreground">Presets</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Apply a preset of already configured options to quickly get a report.
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{["New Products", "Product Pricing", "Monthly Competitor Sales", "SKU Sizes", "Women's Sales over Time"].map(
								(preset) => (
									<button
										key={preset}
										type="button"
										className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent"
									>
										{preset}
									</button>
								),
							)}
						</div>
					</section>

					<section className="rounded-xl border border-border bg-card">
						<div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
							Report Generation Options
						</div>
						<div className="grid gap-4 p-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
							<div className="space-y-3 rounded-lg border border-border bg-background p-3">
								<label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Competitor *
								</label>
								<select className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
									<option>All</option>
								</select>
								<label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Timeseries Aggregation *
								</label>
								<select className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
									<option>Entire Selected Period</option>
								</select>
								<label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Time Frame *
								</label>
								<input type="date" className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm" />
								<label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Datasource *
								</label>
								<select className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
									<option>Products</option>
								</select>
								<label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Columns
								</label>
								<p className="text-xs text-muted-foreground">21 columns selected</p>
								<button
									type="button"
									className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
								>
									Generate report
								</button>
							</div>
							<div id="report-preview" className="rounded-lg border border-border bg-background p-4">
								<div className="mb-3 flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Preview
									</span>
									<span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">export.csv</span>
								</div>
								<div className="overflow-x-auto rounded border border-border">
									<table className="min-w-[680px] w-full text-xs">
										<thead className="bg-muted/40 text-left text-muted-foreground">
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
											<tr className="border-t border-border">
												<td className="px-2 py-2">2026-04-01</td>
												<td className="px-2 py-2">2026-04-21</td>
												<td className="px-2 py-2">cmp_123</td>
												<td className="px-2 py-2">prod_456</td>
												<td className="px-2 py-2">Sample Co</td>
												<td className="px-2 py-2">Sample data not representative of actual report</td>
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
					<p className="text-sm text-muted-foreground">
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
			<div className="rounded-xl border border-border bg-card p-6">
				<h2 className="text-lg font-semibold text-foreground">500 credits available</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Credits are used when generating export reports. Purchase additional credits when your team needs more
					generation capacity.
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					{["+100 credits", "+500 credits", "+2000 credits"].map((pkg) => (
						<button
							key={pkg}
							type="button"
							className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-accent"
						>
							{pkg}
						</button>
					))}
				</div>
			</div>
		);
	}, [activeTab]);

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-[1180px] px-4 py-6 lg:px-8 lg:py-8">
				<div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">Exports</h1>
						<p className="mt-1 text-sm text-muted-foreground">500 credits available</p>
					</div>
					<details className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm sm:w-[280px]">
						<summary className="cursor-pointer font-medium text-foreground">How to use</summary>
						<p className="mt-2 text-muted-foreground">
							Generate new exports, browse team reports, manage scheduled reports, and purchase additional credits.
						</p>
					</details>
				</div>

				<div className="mb-6 border-b border-border">
					<div className="flex flex-wrap gap-0">
						{TAB_ITEMS.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={`border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${
									activeTab === tab.id
										? "border-primary text-foreground"
										: "border-transparent text-muted-foreground hover:text-foreground"
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

				<p className="mt-6 text-xs text-muted-foreground">
					Need deeper benchmarking?{" "}
					<Link href={`/${lang}/product-explorer`} className="text-primary underline underline-offset-2">
						Open Product Explorer
					</Link>
					.
				</p>
			</div>
		</div>
	);
}

