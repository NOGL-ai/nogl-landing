import crypto from "node:crypto";
import { chromium, type Browser } from "playwright";

import { prisma } from "@/lib/prismaDb";
import { QUEUE_NAMES, makeWorker, getQueue } from "@/lib/queue";
import { selectorsFor } from "@/lib/cookie-consent-selectors";
import { putObject } from "@/lib/storage/r2";
import { pHash, hammingDistance } from "@/lib/image/phash";

export type HomepageJob = {
	runId?: string;
	tenantId: string;
	brandId: string;
	brandSlug: string;
	brandDomain: string;
	assetType: "HOMEPAGE" | "HOMEPAGE_MOBILE";
};

const VIEWPORTS = {
	HOMEPAGE: { width: 1440, height: 900, deviceScaleFactor: 1 },
	HOMEPAGE_MOBILE: { width: 390, height: 844, deviceScaleFactor: 2 },
} as const;

async function acceptCookies(page: import("playwright").Page, url: string): Promise<void> {
	for (const selector of selectorsFor(url)) {
		try {
			const btn = await page.waitForSelector(selector, { timeout: 1500 });
			if (btn) {
				await btn.click({ timeout: 1500 }).catch(() => undefined);
				await page.waitForTimeout(500);
				return;
			}
		} catch {
			// try next selector
		}
	}
}

export async function captureHomepage(
	browser: Browser,
	job: HomepageJob,
): Promise<{ contentHash: string; diffFromPrev: number } > {
	const viewport = VIEWPORTS[job.assetType];
	const context = await browser.newContext({ viewport, userAgent:
		"Mozilla/5.0 (compatible; NOGL-Intel/1.0; +https://nogl.ai/bot)" });
	const page = await context.newPage();

	const url = job.brandDomain.startsWith("http") ? job.brandDomain : `https://${job.brandDomain}`;
	try {
		await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
		await acceptCookies(page, url);
		await page.waitForTimeout(1500);

		const screenshot = await page.screenshot({ fullPage: true });
		const html = await page.content();

		const hash = await pHash(screenshot);

		// Diff against the most-recent same-viewport capture
		const prev = await prisma.marketingAsset.findFirst({
			where: {
				brandId: job.brandId,
				assetType: job.assetType,
				source: "PLAYWRIGHT_SELF_HOSTED",
			},
			orderBy: { capturedAt: "desc" },
			select: { payload: true },
		});
		const prevHash = (prev?.payload as { phash?: string } | null)?.phash;
		const diff = prevHash ? hammingDistance(prevHash, hash) : -1;

		const now = new Date();
		const captureId = crypto.randomUUID();
		const pngKey = `marketing-assets/homepages/${job.brandId}/${captureId}-${job.assetType}.png`;
		const htmlKey = `marketing-assets/homepages/${job.brandId}/${captureId}-${job.assetType}.html`;

		await Promise.all([
			putObject({ key: pngKey, body: screenshot, contentType: "image/png" }),
			putObject({ key: htmlKey, body: html, contentType: "text/html; charset=utf-8" }),
		]);

		const contentHash = crypto
			.createHash("sha256")
			.update(`${job.assetType}:PLAYWRIGHT_SELF_HOSTED:${job.brandId}:${hash}`)
			.digest("hex");

		await prisma.marketingAsset.upsert({
			where: { contentHash },
			create: {
				tenantId: job.tenantId,
				brandId: job.brandId,
				assetType: job.assetType,
				source: "PLAYWRIGHT_SELF_HOSTED",
				capturedAt: now,
				sourceUrl: url,
				title: `${url} (${job.assetType})`,
				mediaUrls: [pngKey],
				contentHash,
				payload: {
					phash: hash,
					htmlKey,
					pngKey,
					viewport,
					diffFromPrev: diff,
				},
			},
			update: {
				capturedAt: now,
				mediaUrls: [pngKey],
				payload: { phash: hash, htmlKey, pngKey, viewport, diffFromPrev: diff },
			},
		});

		if (job.runId) {
			await prisma.assetCaptureRun.update({
				where: { id: job.runId },
				data: { status: "completed", completedAt: now, itemCount: 1 },
			});
		}

		const proxyQ = getQueue(QUEUE_NAMES.computeProxies);
		await proxyQ.add("compute", { contentHash });
		const aestheticQ = getQueue(QUEUE_NAMES.scoreAesthetic);
		await aestheticQ.add("score", { contentHash, mediaUrl: pngKey });

		return { contentHash, diffFromPrev: diff };
	} finally {
		await context.close();
	}
}

export function startHomepageWorker() {
	let browser: Browser | null = null;
	const ensureBrowser = async () => {
		if (browser) return browser;
		browser = await chromium.launch({ headless: true });
		return browser;
	};

	const worker = makeWorker<HomepageJob>(QUEUE_NAMES.homepageCapture, async (job) => {
		const b = await ensureBrowser();
		return captureHomepage(b, job.data);
	}, { concurrency: 1 });

	worker.on("closing", async () => {
		if (browser) await browser.close();
	});
	return worker;
}
