/* eslint-disable no-console */
import { prisma } from "@/lib/prismaDb";
import { getQueue, QUEUE_NAMES } from "@/lib/queue";
import { getCalumetTenantId } from "@/lib/tenant";
import type { MetaAdsScrapeJob } from "@/workers/meta-ads";

async function main() {
	const tenantId = await getCalumetTenantId();
	const competitors = await prisma.company.findMany({
		where: { tracking_status: "TRACKED" },
		select: { id: true, name: true, slug: true, domain: true },
	});
	const queue = getQueue<MetaAdsScrapeJob>(QUEUE_NAMES.metaAdsScrape);

	for (const c of competitors) {
		const job: MetaAdsScrapeJob = {
			tenantId,
			brandId: c.id,
			searchQuery: c.name ?? c.slug ?? c.domain ?? "",
			country: "DE",
			maxAds: 100,
		};
		const jobId = `meta-ads-${c.id}`;
		await queue.add("scrape", job, {
			jobId,
			repeat: { pattern: "0 3 * * *" },
			removeOnComplete: 100,
			removeOnFail: 50,
		});
		console.log(`[meta-ads] scheduled ${c.name} (${c.id})`);
	}
	await queue.close();
}

main().catch((e) => {
	console.error("[meta-ads] schedule failed", e);
	process.exit(1);
});
