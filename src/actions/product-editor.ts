"use server";

import { z } from "zod";

import { prisma } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";
import type {
	ProductEditorBulkUpdatePayload,
	ProductEditorBulkUpdateResult,
	ProductEditorItem,
	ProductEditorListParams,
	ProductEditorListResponse,
} from "@/types/product-editor";

const listParamsSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(200).default(24),
	company: z.string().trim().optional(),
	productType: z.string().trim().optional(),
	title: z.string().trim().optional(),
});

const bulkUpdateSchema = z.object({
	productIds: z.array(z.string().trim().min(1)).min(1),
	productType: z.string().trim().optional(),
	addTags: z.array(z.string().trim().min(1)).optional(),
	removeTags: z.array(z.string().trim().min(1)).optional(),
});

async function requireUser(): Promise<void> {
	const session = await getAuthSession();
	if (!session?.user?.id) throw new Error("Unauthorized");
}

function asTagArray(raw: unknown): string[] {
	if (!raw) return [];
	if (Array.isArray(raw)) {
		return raw
			.filter((x): x is string => typeof x === "string")
			.map((x) => x.trim())
			.filter(Boolean);
	}
	if (typeof raw === "string") {
		return raw
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);
	}
	return [];
}

function dedupeLower(tags: string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const t of tags) {
		const key = t.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(t);
	}
	return out;
}

function toItem(row: {
	id: number;
	product_id: string;
	product_title: string | null;
	product_brand: string | null;
	product_category: string | null;
	product_tags: unknown;
}): ProductEditorItem {
	return {
		id: String(row.id),
		productId: row.product_id,
		title: row.product_title?.trim() || "Untitled",
		company: row.product_brand?.trim() || "Unknown",
		productType: row.product_category?.trim() || "Uncategorized",
		tags: asTagArray(row.product_tags),
	};
}

export async function listProductEditorItems(
	params: ProductEditorListParams,
): Promise<ProductEditorListResponse> {
	await requireUser();
	const parsed = listParamsSchema.parse(params);

	const where = {
		...(parsed.company ? { product_brand: parsed.company } : {}),
		...(parsed.productType ? { product_category: parsed.productType } : {}),
		...(parsed.title
			? { product_title: { contains: parsed.title, mode: "insensitive" as const } }
			: {}),
	};

	const [total, rows, companyRows, typeRows] = await Promise.all([
		prisma.products.count({ where }),
		prisma.products.findMany({
			where,
			select: {
				id: true,
				product_id: true,
				product_title: true,
				product_brand: true,
				product_category: true,
				product_tags: true,
			},
			orderBy: { extraction_timestamp: "desc" },
			skip: (parsed.page - 1) * parsed.pageSize,
			take: parsed.pageSize,
		}),
		prisma.products.findMany({
			where: { product_brand: { not: null } },
			select: { product_brand: true },
			distinct: ["product_brand"],
			orderBy: { product_brand: "asc" },
			take: 500,
		}),
		prisma.products.findMany({
			where: { product_category: { not: null } },
			select: { product_category: true },
			distinct: ["product_category"],
			orderBy: { product_category: "asc" },
			take: 500,
		}),
	]);

	return {
		items: rows.map(toItem),
		total,
		page: parsed.page,
		pageSize: parsed.pageSize,
		totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
		companies: companyRows.map((r) => r.product_brand || "").filter(Boolean),
		productTypes: typeRows.map((r) => r.product_category || "").filter(Boolean),
	};
}

export async function bulkUpdateProducts(
	payload: ProductEditorBulkUpdatePayload,
): Promise<ProductEditorBulkUpdateResult> {
	await requireUser();
	const parsed = bulkUpdateSchema.parse(payload);
	const addTags = dedupeLower(parsed.addTags ?? []);
	const removeSet = new Set((parsed.removeTags ?? []).map((x) => x.toLowerCase()));

	const rows = await prisma.products.findMany({
		where: { product_id: { in: parsed.productIds } },
		select: { id: true, product_tags: true },
	});

	let updatedCount = 0;
	for (const row of rows) {
		const current = asTagArray(row.product_tags);
		const nextTags = dedupeLower([...current.filter((t) => !removeSet.has(t.toLowerCase())), ...addTags]);
		await prisma.products.update({
			where: { id: row.id },
			data: {
				...(parsed.productType ? { product_category: parsed.productType } : {}),
				product_tags: nextTags,
			},
		});
		updatedCount += 1;
	}

	return { updatedCount };
}
