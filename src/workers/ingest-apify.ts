import { ApifyClient } from "apify-client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prismaDb";
import { QUEUE_NAMES, makeWorker, getQueue } from "@/lib/queue";
import {
	detectActorKind,
	normalizeItem,
	type ApifyActorKind,
	type NormalizedAsset,
} from "@/lib/apify/normalize";

export type ApifyIngestJob = {
	eventType?: string;
	actorId?: string;
	actorTaskId?: string;
	actorRunId?: string;
	defaultDatasetId?: string;
	userData?: Record<string, unknown> & { tenantId?: string; brandId?: string; brandSlug?: string };
};

function kindFromEnv(actorId?: string, actorTaskId?: string): ApifyActorKind | null {
	const tasks: Array<[string | undefined, ApifyActorKind]> = [
		[process.env.APIFY_META_ADS_TASK_ID, "meta"],
		[process.env.APIFY_GOOGLE_ADS_TASK_ID, "google_youtube"],
		[process.env.APIFY_TIKTOK_ADS_TASK_ID, "tiktok"],
		[process.env.APIFY_INSTAGRAM_TASK_ID, "instagram"],
	];
	for (const [taskId, kind] of tasks) {
		if (taskId && (taskId === actorTaskId || taskId === actorId)) return kind;
	}
	if (actorId) return detectActorKind(actorId);
	return null;
}

async function resolveBrandId(userData: ApifyIngestJob["userData"]): Promise<string | null> {
	if (userData?.brandId && typeof userData.brandId === "string") return userData.brandId;
	if (userData?.brandSlug && typeof userData.brandSlug === "string") {
		const row = await prisma.company.findUnique({
			where: { slug: userData.brandSlug },
			select: { id: true },
		});
		if (row) return row.id;
	}
	return null;
}

async function writeAsset(
	tenantId: string,
	brandId: string,
	asset: NormalizedAsset,
): Promise<void> {
	await prisma.marketingAsset.upsert({
		where: { contentHash: asset.contentHash },
		create: {
			tenantId,
			brandId,
			assetType: asset.assetType,
			source: asset.source,
			capturedAt: asset.capturedAt,
			sourceUrl: asset.sourceUrl ?? null,
			title: asset.title ?? null,
			bodyText: asset.bodyText ?? null,
			language: asset.language ?? null,
			region: asset.region ?? null,
			mediaUrls: asset.mediaUrls,
			contentHash: asset.contentHash,
			payload: asset.payload as Prisma.InputJsonValue,
		},
		update: {
			capturedAt: asset.capturedAt,
			mediaUrls: asset.mediaUrls,
			payload: asset.payload as Prisma.InputJsonValue,
		},
	});
}

export async function processApifyIngest(data: ApifyIngestJob): Promise<{ created: number }> {
	const kind = kindFromEnv(data.actorId, data.actorTaskId);
	if (!kind) throw new Error(`Unknown Apify actor: ${data.actorId ?? data.actorTaskId ?? "?"}`);

	const tenantId = data.userData?.tenantId;
	if (!tenantId) throw new Error("userData.tenantId missing in webhook payload");
	const brandId = await resolveBrandId(data.userData);
	if (!brandId) throw new Error("Could not resolve brandId from userData");

	if (!data.defaultDatasetId) throw new Error("defaultDatasetId missing");

	const token = process.env.APIFY_TOKEN;
	if (!token) throw new Error("APIFY_TOKEN missing");

	const client = new ApifyClient({ token });
	const dataset = client.dataset(data.defaultDatasetId);
	const { items } = await dataset.listItems({ clean: true });

	let created = 0;
	const proxyQ = getQueue(QUEUE_NAMES.computeProxies);
	const aestheticQ = getQueue(QUEUE_NAMES.scoreAesthetic);

	for (const raw of items) {
		const asset = normalizeItem(kind, raw as Record<string, unknown>, brandId);
		await writeAsset(tenantId, brandId, asset);
		created++;

		await proxyQ.add("compute", { contentHash: asset.contentHash });
		if (asset.mediaUrls.length > 0) {
			await aestheticQ.add("score", {
				contentHash: asset.contentHash,
				mediaUrl: asset.mediaUrls[0],
			});
		}
	}

	if (data.actorRunId) {
		await prisma.assetCaptureRun.updateMany({
			where: { metadata: { path: ["apifyRunId"], equals: data.actorRunId } },
			data: { status: "completed", completedAt: new Date(), itemCount: created },
		});
	}

	return { created };
}

export function startIngestApifyWorker() {
	return makeWorker<ApifyIngestJob>(QUEUE_NAMES.apifyIngest, async (job) => processApifyIngest(job.data));
}
