/* eslint-disable no-console */
import { startIngestApifyWorker } from "@/workers/ingest-apify";
import { startComputeProxiesWorker } from "@/workers/compute-proxies";
import { startScoreAestheticWorker } from "@/workers/score-aesthetic";
import { startSnapshotRefreshWorker } from "@/workers/snapshot-refresh";

// The ads-events ingest worker (ingest.worker.ts) runs as its own container
// with embedded signal handling. This script handles the lighter data-only
// workers that can share a process without shutdown conflicts.
const workers = [
	startIngestApifyWorker(),
	startComputeProxiesWorker(),
	startScoreAestheticWorker(),
	startSnapshotRefreshWorker(),
];
console.log(`[workers:data] started ${workers.length} workers`);

const shutdown = async () => {
	console.log("[workers:data] shutting down");
	await Promise.allSettled(workers.map((w) => w.close()));
	process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
