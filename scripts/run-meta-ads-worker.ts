/* eslint-disable no-console */
import { startMetaAdsWorker } from "@/workers/meta-ads";

const worker = startMetaAdsWorker();
console.log("[meta-ads] worker started");

const shutdown = async () => {
	console.log("[meta-ads] shutting down");
	await worker.close();
	process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
