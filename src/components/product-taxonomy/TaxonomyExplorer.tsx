"use client";

import { useCallback, useMemo, useState } from "react";

import {
	TAXONOMY_MAX_DEPTH,
	type ProductTaxonomyNode,
	getChildren,
	formatPath,
} from "@/data/product-type-taxonomy";

export function TaxonomyExplorer() {
	const [path, setPath] = useState<ProductTaxonomyNode[]>([]);

	const columns = useMemo(() => {
		const out: ProductTaxonomyNode[][] = [];
		for (let d = 0; d < TAXONOMY_MAX_DEPTH; d++) {
			if (d === 0) {
				out.push(getChildren([]));
			} else if (path.length < d) {
				out.push([]);
			} else {
				out.push(getChildren(path.slice(0, d)));
			}
		}
		return out;
	}, [path]);

	const selectAtDepth = useCallback((depth: number, node: ProductTaxonomyNode) => {
		setPath((prev) => {
			const next = [...prev.slice(0, depth), node];
			return next;
		});
	}, []);

	const breadcrumb = formatPath(path);

	return (
		<div className="rounded-xl border border-border bg-card shadow-sm">
			<div className="border-b border-border px-4 py-3">
				<h2 className="text-base font-semibold text-foreground">Taxonomy Explorer</h2>
				<p className="mt-0.5 text-xs text-muted-foreground">
					Select a type in each column to walk the hierarchy (demo data, up to {TAXONOMY_MAX_DEPTH} levels).
				</p>
			</div>
			<div className="p-4">
				<div className="grid grid-cols-1 gap-3 md:grid-cols-5">
					{columns.map((items, depth) => {
						const selected = path[depth];
						const prevBlocked = depth > 0 && path.length < depth;
						return (
							<div key={depth} className="flex min-h-[280px] flex-col rounded-lg border border-border bg-background">
								<div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Depth {depth + 1}
								</div>
								{prevBlocked ? (
									<div className="flex flex-1 items-start p-3 text-xs leading-relaxed text-muted-foreground">
										Select a product type in the previous depth to view its subcategories here.
									</div>
								) : items.length === 0 ? (
									<div className="flex flex-1 items-start p-3 text-xs leading-relaxed text-muted-foreground">
										{depth === TAXONOMY_MAX_DEPTH - 1 && path.length === TAXONOMY_MAX_DEPTH
											? "No further product types in this branch for the demo dataset."
											: "No subcategories in this demo branch."}
									</div>
								) : (
									<ul className="m-0 max-h-[min(60vh,520px)] list-none overflow-y-auto p-0" role="listbox" aria-label={`Depth ${depth + 1}`}>
										{items.map((node) => {
											const active = selected?.id === node.id;
											return (
												<li key={node.id} role="none">
													<button
														type="button"
														role="option"
														aria-selected={active}
														onClick={() => selectAtDepth(depth, node)}
														className={`flex w-full border-b border-border px-3 py-2.5 text-left text-sm transition last:border-b-0 hover:bg-accent ${
															active ? "bg-primary/10 font-medium text-primary" : "text-foreground"
														}`}
													>
														{node.name}
													</button>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						);
					})}
				</div>
				{breadcrumb ? (
					<div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm">
						<span className="text-muted-foreground">Selected path: </span>
						<span className="font-medium text-foreground">{breadcrumb}</span>
					</div>
				) : null}
			</div>
		</div>
	);
}
