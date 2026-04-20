/**
 * Thin Qdrant wrapper used by the engagement-proxy worker.
 * Uses fetch against the REST API (no extra client dep).
 */

const COLLECTION = "marketing-assets-embeddings";
const VECTOR_SIZE = 1536; // text-embedding-3-small

function baseUrl(): string {
	const url = process.env.QDRANT_URL;
	if (!url) throw new Error("QDRANT_URL missing");
	return url.replace(/\/$/, "");
}

function headers(): HeadersInit {
	const apiKey = process.env.QDRANT_API_KEY;
	return {
		"Content-Type": "application/json",
		...(apiKey ? { "api-key": apiKey } : {}),
	};
}

export async function ensureCollection(): Promise<void> {
	const res = await fetch(`${baseUrl()}/collections/${COLLECTION}`, { headers: headers() });
	if (res.status === 200) return;
	await fetch(`${baseUrl()}/collections/${COLLECTION}`, {
		method: "PUT",
		headers: headers(),
		body: JSON.stringify({ vectors: { size: VECTOR_SIZE, distance: "Cosine" } }),
	});
}

export async function upsertPoint(
	id: string,
	vector: number[],
	payload: Record<string, unknown>,
): Promise<void> {
	await fetch(`${baseUrl()}/collections/${COLLECTION}/points?wait=true`, {
		method: "PUT",
		headers: headers(),
		body: JSON.stringify({ points: [{ id, vector, payload }] }),
	});
}

export type SearchResult = {
	id: string | number;
	score: number;
	payload: Record<string, unknown>;
};

export async function searchNearest(
	vector: number[],
	limit = 8,
	filter?: Record<string, unknown>,
): Promise<SearchResult[]> {
	const res = await fetch(`${baseUrl()}/collections/${COLLECTION}/points/search`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ vector, limit, filter, with_payload: true }),
	});
	if (!res.ok) return [];
	const json = (await res.json()) as { result?: SearchResult[] };
	return json.result ?? [];
}
