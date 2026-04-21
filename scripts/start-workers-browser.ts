/* eslint-disable no-console */
import { startMetaAdsWorker } from "@/workers/meta-ads";
import { startHomepageWorker } from "@/workers/scrape-homepages";

const workers = [startMetaAdsWorker(), startHomepageWorker()];
console.log(`[workers:browser] started ${workers.length} workers`);

const shutdown = async () => {
	console.log("[workers:browser] shutting down");
	await Promise.allSettled(workers.map((w) => w.close()));
	process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
