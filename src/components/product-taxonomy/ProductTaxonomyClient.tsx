"use client";

import { useState } from "react";
import Link from "next/link";

import { TaxonomyExplorer } from "@/components/product-taxonomy/TaxonomyExplorer";

type Mode = "explore" | "customize";

export function ProductTaxonomyClient({ lang }: { lang: string }) {
	const [mode, setMode] = useState<Mode>("explore");

	return (
		<div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
			<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">Product Type Taxonomy</h1>
					<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
						Explore a standardized product-type hierarchy. NOGL uses a similar idea to group products for
						comparisons; this page is a working explorer backed by demo data you can replace with your own
						taxonomy feed.
					</p>
				</div>
				<div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
					<div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
						<button
							type="button"
							onClick={() => setMode("explore")}
							className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
								mode === "explore" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
							}`}
						>
							Explore
						</button>
						<button
							type="button"
							disabled
							title="Customize and extend the taxonomy on a higher plan (coming soon)."
							aria-label="Customize and extend the taxonomy to match your internal product hierarchy on a higher plan"
							className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground opacity-60"
						>
							Customize
						</button>
					</div>
					<details className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
						<summary className="cursor-pointer font-medium text-foreground">How to use</summary>
						<div className="mt-2 space-y-2 text-muted-foreground">
							<p>
								Use the columns left-to-right. Each depth lists child types under your current selection.
								This mirrors tools like Particl where PDP fields feed categorization models.
							</p>
							<p>
								To re-map real catalog products, use your product editor or ingestion pipeline — this UI is
								for exploration only until wired to your API.
							</p>
						</div>
					</details>
				</div>
			</div>

			{mode === "explore" ? (
				<>
					<section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
						<h2 className="text-sm font-semibold text-foreground">AI categorization</h2>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							In production systems like Particl, product titles, sizes, materials, and PDP keywords are passed
							through large language models and rules to assign each SKU to a{" "}
							<strong className="text-foreground">stable taxonomy path</strong>. That path powers filters,
							peer sets, and market benchmarks across retailers.
						</p>
					</section>

					<section className="mb-8 rounded-xl border border-border bg-muted/20 p-5">
						<h2 className="text-sm font-semibold text-foreground">Example mapping</h2>
						<div className="mt-3 grid gap-4 lg:grid-cols-2">
							<div className="rounded-lg border border-border bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
								<div className="mb-2 text-[10px] font-sans font-semibold uppercase tracking-wide text-muted-foreground">
									Product info
								</div>
								{"{ "}
								<br />
								&nbsp;&nbsp;<span className="text-primary">&quot;title&quot;</span>
								 {": "}
								<span className="text-emerald-600 dark:text-emerald-400">&quot;Army Boot XL&quot;</span>
								<br />
								{"}"}
							</div>
							<div className="flex flex-col justify-center rounded-lg border border-border bg-background p-4">
								<div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
									AI product type
								</div>
								<p className="mt-1 text-sm font-medium text-foreground">Shoes &gt; Boots &gt; Combat Boots</p>
							</div>
						</div>
					</section>

					<TaxonomyExplorer />

					<p className="mt-8 text-sm leading-relaxed text-muted-foreground">
						This explorer is intended to help you learn and validate a hierarchy before you customize it. To
						re-categorize live products, connect your catalog workflow or product editor. You can swap the demo
						tree in <code className="rounded bg-muted px-1 py-0.5 text-xs">src/data/product-type-taxonomy.ts</code>{" "}
						for a generated Google Product Taxonomy file or an internal API response.
					</p>

					<p className="mt-4 text-sm text-muted-foreground">
						<Link href={`/${lang}/product-explorer`} className="text-primary underline underline-offset-2">
							Open Product Explorer
						</Link>{" "}
						to search scraped SKUs by text.
					</p>
				</>
			) : (
				<p className="text-sm text-muted-foreground">Customize mode is not available yet.</p>
			)}
		</div>
	);
}
