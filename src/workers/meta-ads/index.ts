/* eslint-disable no-console */
import { makeWorker, QUEUE_NAMES } from "@/lib/queue";
import { MetaAdsLibraryScraperV2, SessionDeadError } from "./scraper";
import { upsertMetaAdToDb, type MetaAdJobMeta } from "./writeToDb";
import { incrementFailures, resetFailures } from "./consecutiveFailures";
import { triggerApifyFallback } from "./fallback";

export type MetaAdsScrapeJob = MetaAdJobMeta & {
	maxAds?: number;
	headlessMode?: boolean;
};

export async function runMetaAdsScrape(data: MetaAdsScrapeJob): Promise<{ total: number } | { fallback: string }> {
	const scraper = new MetaAdsLibraryScraperV2({
		searchQuery: data.searchQuery,
		country: data.country,
		maxAds: data.maxAds ?? 100,
		headlessMode: data.headlessMode ?? true,
		pageId: data.pageId,
		locale: data.locale,
	});

	try {
		const result = await scraper.run(async (ad) => {
			await upsertMetaAdToDb(ad, data);
		});
		await resetFailures(data.brandId);
		return result;
	} catch (err) {
		const failures = await incrementFailures(data.brandId);
		const sessionDead = err instanceof SessionDeadError;
		const shouldFallback = sessionDead || failures >= 3;
		console.error(
			`[meta-ads] brand=${data.brandId} failure #${failures} sessionDead=${sessionDead}: ${
				(err as Error).message
			}`,
		);
		if (shouldFallback) {
			const fb = await triggerApifyFallback({
				tenantId: data.tenantId,
				brandId: data.brandId,
				searchQuery: data.searchQuery,
				country: data.country,
				maxAds: data.maxAds,
			});
			return { fallback: fb?.runId ?? "skipped" };
		}
		throw err;
	}
}

export function startMetaAdsWorker() {
	return makeWorker<MetaAdsScrapeJob>(
		QUEUE_NAMES.metaAdsScrape,
		async (job) => runMetaAdsScrape(job.data),
		{ concurrency: 1 },
	);
}
