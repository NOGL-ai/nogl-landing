"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ProductEditorItem, ProductEditorListResponse } from "@/types/product-editor";

export function ProductEditorClient({ lang }: { lang: string }) {
	const [items, setItems] = useState<ProductEditorItem[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(24);
	const [companies, setCompanies] = useState<string[]>([]);
	const [types, setTypes] = useState<string[]>([]);
	const [company, setCompany] = useState("");
	const [productType, setProductType] = useState("");
	const [title, setTitle] = useState("");
	const [titleInput, setTitleInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [selected, setSelected] = useState<Record<string, boolean>>({});
	const [newType, setNewType] = useState("");
	const [addTags, setAddTags] = useState("");
	const [removeTags, setRemoveTags] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setTitle(titleInput.trim()), 250);
		return () => clearTimeout(t);
	}, [titleInput]);

	const selectedIds = useMemo(
		() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
		[selected],
	);

	const hasMore = items.length < total;

	const load = useCallback(
		async (nextPage: number, mode: "replace" | "append") => {
			if (mode === "replace") setLoading(true);
			else setLoadingMore(true);
			setError(null);

			const sp = new URLSearchParams();
			sp.set("page", String(nextPage));
			sp.set("pageSize", String(pageSize));
			if (company) sp.set("company", company);
			if (productType) sp.set("productType", productType);
			if (title) sp.set("title", title);

			try {
				const res = await fetch(`/api/product-editor?${sp.toString()}`);
				if (!res.ok) throw new Error(`Failed (${res.status})`);
				const data = (await res.json()) as ProductEditorListResponse;
				setTotal(data.total);
				setPage(data.page);
				setCompanies(data.companies);
				setTypes(data.productTypes);
				if (mode === "append") setItems((prev) => [...prev, ...data.items]);
				else {
					setItems(data.items);
					setSelected({});
				}
			} catch (e) {
				setError((e as Error).message);
				if (mode === "replace") {
					setItems([]);
					setTotal(0);
				}
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[company, pageSize, productType, title],
	);

	useEffect(() => {
		void load(1, "replace");
	}, [load]);

	const toggleSelect = (id: string) => {
		setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const toggleAllVisible = () => {
		const allOn = items.every((x) => selected[x.productId]);
		setSelected((prev) => {
			const next = { ...prev };
			for (const it of items) next[it.productId] = !allOn;
			return next;
		});
	};

	const applyBulk = async () => {
		if (selectedIds.length === 0) return;
		setSaving(true);
		setError(null);
		try {
			const payload = {
				productIds: selectedIds,
				productType: newType.trim() || undefined,
				addTags: addTags
					.split(",")
					.map((x) => x.trim())
					.filter(Boolean),
				removeTags: removeTags
					.split(",")
					.map((x) => x.trim())
					.filter(Boolean),
			};
			const res = await fetch("/api/product-editor/bulk-update", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error(`Bulk update failed (${res.status})`);
			await load(1, "replace");
			setNewType("");
			setAddTags("");
			setRemoveTags("");
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-text-primary">Product Editor</h1>
					<p className="mt-1 max-w-2xl text-sm text-text-tertiary">
						Bulk edit the product types and product tags associated with competitor products.
					</p>
				</div>
				<details className="w-full shrink-0 rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-sm sm:max-w-xs">
					<summary className="cursor-pointer font-medium text-text-primary">How to use</summary>
					<p className="mt-2 text-text-tertiary">
						Filter products by company/type/title, select rows, then apply type/tag updates in one batch.
					</p>
				</details>
			</div>

			<div className="mb-4 rounded-xl border border-border-primary bg-bg-primary p-4">
				<div className="mb-3 flex flex-wrap items-end gap-3 text-xs font-medium uppercase tracking-wide text-text-tertiary">
					<div className="flex min-w-36 flex-col gap-1 normal-case">
						<span className="text-xs uppercase tracking-wide">Companies</span>
						<select
							value={company}
							onChange={(e) => setCompany(e.target.value)}
							className="h-9 rounded-md border border-border-primary bg-bg-primary px-2 text-sm text-text-primary"
						>
							<option value="">All companies</option>
							{companies.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
					<div className="flex min-w-36 flex-col gap-1 normal-case">
						<span className="text-xs uppercase tracking-wide">Product Type</span>
						<select
							value={productType}
							onChange={(e) => setProductType(e.target.value)}
							className="h-9 rounded-md border border-border-primary bg-bg-primary px-2 text-sm text-text-primary"
						>
							<option value="">All Competitor Products</option>
							{types.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
					<div className="flex min-w-60 flex-1 flex-col gap-1 normal-case">
						<span className="text-xs uppercase tracking-wide">Title</span>
						<input
							type="search"
							value={titleInput}
							onChange={(e) => setTitleInput(e.target.value)}
							placeholder="Search product title…"
							className="h-9 rounded-md border border-border-primary bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-quaternary"
						/>
					</div>
				</div>
				<p className="text-sm text-text-tertiary">
					<span className="font-medium text-text-primary">{total.toLocaleString()}</span> products match filters.
				</p>
			</div>

			<div className="mb-4 rounded-xl border border-border-primary bg-bg-primary p-4">
				<h2 className="mb-2 text-sm font-semibold text-text-primary">Bulk Edit Products</h2>
				<p className="mb-3 text-sm text-text-tertiary">
					Selected: <span className="font-medium text-text-primary">{selectedIds.length}</span>
				</p>
				<div className="grid gap-3 md:grid-cols-3">
					<input
						type="text"
						value={newType}
						onChange={(e) => setNewType(e.target.value)}
						placeholder="New product type (optional)"
						className="h-9 rounded-md border border-border-primary bg-bg-primary px-3 text-sm text-text-primary"
					/>
					<input
						type="text"
						value={addTags}
						onChange={(e) => setAddTags(e.target.value)}
						placeholder="Add tags (comma separated)"
						className="h-9 rounded-md border border-border-primary bg-bg-primary px-3 text-sm text-text-primary"
					/>
					<input
						type="text"
						value={removeTags}
						onChange={(e) => setRemoveTags(e.target.value)}
						placeholder="Remove tags (comma separated)"
						className="h-9 rounded-md border border-border-primary bg-bg-primary px-3 text-sm text-text-primary"
					/>
				</div>
				<button
					type="button"
					disabled={saving || selectedIds.length === 0}
					onClick={() => void applyBulk()}
					className="mt-3 inline-flex h-9 items-center rounded-lg bg-bg-brand-solid px-4 text-sm font-medium text-white disabled:opacity-60"
				>
					{saving ? "Applying…" : "Apply bulk edit"}
				</button>
			</div>

			{error ? (
				<div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			) : null}

			<div className="overflow-hidden rounded-xl border border-border-primary bg-bg-primary">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[860px] text-sm">
						<thead className="bg-bg-secondary text-left text-xs uppercase tracking-wide text-text-tertiary">
							<tr>
								<th className="w-10 px-3 py-2">
									<input
										type="checkbox"
										onChange={toggleAllVisible}
										checked={items.length > 0 && items.every((x) => selected[x.productId])}
										aria-label="Select all visible rows"
									/>
								</th>
								<th className="px-3 py-2">Company</th>
								<th className="px-3 py-2">Product Type</th>
								<th className="px-3 py-2">Title</th>
								<th className="px-3 py-2">Tags</th>
							</tr>
						</thead>
						<tbody>
							{loading && items.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-3 py-10 text-center text-text-tertiary">
										Loading products…
									</td>
								</tr>
							) : items.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-3 py-10 text-center text-text-tertiary">
										No products found.
									</td>
								</tr>
							) : (
								items.map((it) => (
									<tr key={it.productId} className="border-t border-border-primary align-top">
										<td className="px-3 py-3">
											<input
												type="checkbox"
												checked={!!selected[it.productId]}
												onChange={() => toggleSelect(it.productId)}
												aria-label={`Select ${it.title}`}
											/>
										</td>
										<td className="px-3 py-3 text-text-primary">{it.company}</td>
										<td className="px-3 py-3 text-text-tertiary">{it.productType}</td>
										<td className="px-3 py-3 text-text-primary">{it.title}</td>
										<td className="px-3 py-3">
											<div className="flex flex-wrap gap-1">
												{it.tags.length > 0 ? (
													it.tags.map((t) => (
														<span
															key={`${it.productId}-${t}`}
															className="rounded bg-bg-secondary px-1.5 py-0.5 text-xs text-text-tertiary"
														>
															{t}
														</span>
													))
												) : (
													<span className="text-xs text-text-tertiary">No tags</span>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{hasMore ? (
					<div className="border-t border-border-primary p-3">
						<button
							type="button"
							disabled={loadingMore}
							onClick={() => void load(page + 1, "append")}
							className="w-full rounded-lg bg-bg-brand-solid py-2 text-sm font-medium text-white disabled:opacity-60"
						>
							{loadingMore ? "Loading…" : "Load more"}
						</button>
					</div>
				) : null}
			</div>
			<p className="mt-4 text-xs text-text-tertiary">Locale: {lang}</p>
		</div>
	);
}
