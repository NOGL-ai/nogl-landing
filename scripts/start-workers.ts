/* eslint-disable no-console */
import { startIngestApifyWorker } from "@/workers/ingest-apify";
import { startHomepageWorker } from "@/workers/scrape-homepages";
import { startComputeProxiesWorker } from "@/workers/compute-proxies";
import { startScoreAestheticWorker } from "@/workers/score-aesthetic";
import { startMetaAdsWorker } from "@/workers/meta-ads";

const workers = [
	startIngestApifyWorker(),
	startHomepageWorker(),
	startComputeProxiesWorker(),
	startScoreAestheticWorker(),
	startMetaAdsWorker(),
];
console.log(`[workers] started ${workers.length} workers`);

const shutdown = async () => {
	console.log("[workers] shutting down");
	await Promise.allSettled(workers.map((w) => w.close()));
	process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
