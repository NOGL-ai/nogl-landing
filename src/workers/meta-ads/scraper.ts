/* eslint-disable no-console */
import { chromium, type Browser, type Page } from "playwright";
import { ModernAntiDetection } from "./stealth";

export type MetaAdsScrapeInput = {
	searchQuery?: string;
	country?: string;
	adType?: string;
	maxAds?: number;
	pageId?: string;
	headlessMode?: boolean;
	delayBetweenRequests?: number;
};

export type MetaAd = {
	adId?: string | null;
	pageId?: string | null;
	pageName?: string | null;
	adContent?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	spend?: string | null;
	impressions?: string | null;
	reach?: string | null;
	demographics?: unknown;
	platforms?: unknown;
	adCreative?: unknown;
	targetingInfo?: unknown;
	currency?: string | null;
	isActive?: boolean | null;
	scrapedAt: string;
	source: "graphql_interception" | "dom_extraction";
	url?: string;
};

export class SessionDeadError extends Error {
	constructor(message = "Meta session appears dead (checkpoint/block)") {
		super(message);
		this.name = "SessionDeadError";
	}
}

export class MetaAdsLibraryScraperV2 {
	input: Required<Pick<MetaAdsScrapeInput, "country" | "adType" | "maxAds" | "delayBetweenRequests">> &
		MetaAdsScrapeInput;
	baseUrl = "https://www.facebook.com/ads/library";
	scrapedAds = new Set<string>();
	adData: MetaAd[] = [];

	constructor(input: MetaAdsScrapeInput) {
		this.input = {
			searchQuery: input.searchQuery ?? "",
			country: input.country ?? "DE",
			adType: input.adType ?? "all",
			maxAds: input.maxAds ?? 100,
			pageId: input.pageId ?? "",
			headlessMode: input.headlessMode ?? true,
			delayBetweenRequests: input.delayBetweenRequests ?? 3000,
		};
	}

	buildSearchUrl(): string {
		const params = new URLSearchParams();
		if (this.input.searchQuery) params.append("q", this.input.searchQuery);
		params.append("country", this.input.country === "ALL" ? "DE" : this.input.country);
		params.append("ad_type", this.input.adType);
		params.append("active_status", "all");
		params.append("view_all_page_id", this.input.pageId ?? "");
		return `${this.baseUrl}?${params.toString()}`;
	}

	async setupNetworkInterception(page: Page): Promise<void> {
		await page.route("**/graphql", async (route) => {
			const request = route.request();
			const response = await route.fetch();
			try {
				const body = await response.text();
				const postData = request.postData() ?? "";
				if (
					postData.includes("AdLibrarySearchResultsQuery") ||
					postData.includes("AdLibraryMobileSearchResultsQuery") ||
					postData.includes("AdLibrarySearchQuery")
				) {
					try {
						this.processGraphQLResponse(JSON.parse(body));
					} catch (e) {
						console.log("[meta-ads] graphql parse error", (e as Error).message);
					}
				}
			} catch (e) {
				console.log("[meta-ads] intercept error", (e as Error).message);
			}
			await route.fulfill({ response });
		});
	}

	processGraphQLResponse(response: { data?: Record<string, unknown> }): void {
		const data = response.data;
		if (!data) return;
		const searchPaths = ["ad_library_search", "adLibrarySearch", "search_results", "results", "edges"];
		let adsData: { edges?: Array<{ node?: Record<string, unknown> }> } | null = null;
		for (const path of searchPaths) {
			const candidate = data[path] as { edges?: Array<{ node?: Record<string, unknown> }> } | undefined;
			if (candidate) {
				adsData = candidate;
				break;
			}
		}
		if (adsData?.edges) {
			for (const edge of adsData.edges) {
				if (!edge.node) continue;
				const ad = this.processAdNode(edge.node);
				if (ad) this.adData.push(ad);
			}
		}
	}

	processAdNode(adNode: Record<string, unknown>): MetaAd | null {
		try {
			const page = (adNode.page as Record<string, unknown> | undefined) ?? {};
			const spend = adNode.spend as { lower_bound?: string; upper_bound?: string } | undefined;
			const impressions = adNode.impressions as { lower_bound?: string; upper_bound?: string } | undefined;
			const reach = adNode.reach as { lower_bound?: string; upper_bound?: string } | undefined;

			const ad: MetaAd = {
				adId: (adNode.ad_archive_id as string) ?? (adNode.id as string) ?? null,
				pageId: (page.id as string) ?? null,
				pageName: (page.name as string) ?? null,
				adContent: (adNode.ad_creative_body as string) ?? (adNode.creative_body as string) ?? null,
				startDate: (adNode.ad_delivery_start_time as string) ?? null,
				endDate: (adNode.ad_delivery_stop_time as string) ?? null,
				spend: spend?.lower_bound ?? spend?.upper_bound ?? null,
				impressions: impressions?.lower_bound ?? impressions?.upper_bound ?? null,
				reach: reach?.lower_bound ?? reach?.upper_bound ?? null,
				demographics: adNode.demographic_distribution,
				platforms: adNode.publisher_platforms,
				adCreative: {
					images: adNode.ad_creative_link_captions ?? [],
					videos: adNode.videos ?? [],
					link_url: adNode.ad_creative_link_url,
				},
				targetingInfo: adNode.target_ages ?? adNode.target_gender,
				currency: (adNode.currency as string) ?? null,
				isActive: (adNode.is_active as boolean) ?? null,
				scrapedAt: new Date().toISOString(),
				source: "graphql_interception",
			};

			const key = ad.adId ?? `${ad.pageName}_${(ad.adContent ?? "").substring(0, 50)}`;
			if (this.scrapedAds.has(key)) return null;
			this.scrapedAds.add(key);
			return ad;
		} catch {
			return null;
		}
	}

	async extractAdDataFromDOM(page: Page): Promise<MetaAd[]> {
		const ads = await page.evaluate(() => {
			const out: Array<Record<string, unknown>> = [];
			const selectors = [
				'[data-testid="ad_library_card"]',
				'[data-testid="ad-library-card"]',
				'[role="article"]',
				'[data-pagelet="AdLibrarySearchResults"] > div > div',
			];
			let elements: Element[] = [];
			for (const s of selectors) {
				const found = Array.from(document.querySelectorAll(s));
				if (found.length) {
					elements = found;
					break;
				}
			}
			for (const el of elements) {
				try {
					const ad: Record<string, unknown> = { scrapedAt: new Date().toISOString(), url: window.location.href };
					const pageNameEl =
						el.querySelector('[data-testid="page_name"] span') ??
						el.querySelector("a[href] span");
					if (pageNameEl?.textContent) ad.pageName = pageNameEl.textContent.trim();
					const bodyEl = el.querySelector('[data-testid="ad_creative_body"]');
					if (bodyEl?.textContent) ad.adContent = bodyEl.textContent.trim();
					const imgs = Array.from(el.querySelectorAll("img[src]"))
						.map((i) => (i as HTMLImageElement).src)
						.filter((u) => !!u && !u.startsWith("data:") && !u.includes("rsrc.php"));
					if (imgs.length) ad.adCreative = { images: imgs };
					const platformEls = el.querySelectorAll('[alt*="Facebook"], [alt*="Instagram"]');
					if (platformEls.length) {
						ad.platforms = Array.from(platformEls)
							.map((p) => p.getAttribute("alt"))
							.filter(Boolean);
					}
					if (ad.pageName || ad.adContent) out.push(ad);
				} catch {
					/* ignore */
				}
			}
			return out;
		});
		return ads.map((a) => ({ ...(a as MetaAd), source: "dom_extraction" as const }));
	}

	async checkForBlock(page: Page): Promise<void> {
		const url = page.url();
		if (url.includes("/checkpoint") || url.includes("/login")) {
			throw new SessionDeadError(`Redirected to ${url}`);
		}
		const title = await page.title().catch(() => "");
		if (/checkpoint|temporarily blocked|login required/i.test(title)) {
			throw new SessionDeadError(`Suspicious title: ${title}`);
		}
	}

	async waitForAdsToLoad(page: Page): Promise<boolean> {
		try {
			await page.waitForSelector(
				'[data-testid="ad_library_card"], [data-testid="ad-library-card"], [role="article"]',
				{ timeout: 20_000 },
			);
			await ModernAntiDetection.humanLikeDelay(3000, 5000);
			await ModernAntiDetection.humanLikeScroll(page);
			return true;
		} catch {
			return false;
		}
	}

	async handleCookieConsent(page: Page): Promise<void> {
		const selectors = [
			'[data-testid="cookie-policy-manage-dialog-accept-button"]',
			'[data-testid="cookie-policy-banner-accept"]',
			'[aria-label="Accept all"]',
			'[aria-label="Allow all cookies"]',
			'[data-cookiebanner="accept_button"]',
		];
		for (const sel of selectors) {
			try {
				const btn = await page.$(sel);
				if (btn) {
					await btn.click();
					await ModernAntiDetection.humanLikeDelay(1000, 2000);
					return;
				}
			} catch {
				/* next */
			}
		}
	}

	async loadMoreAds(page: Page): Promise<boolean> {
		const selectors = [
			'[data-testid="see-more-button"]',
			'[aria-label="See more"]',
			'[aria-label="Load more"]',
			'[data-testid="load-more-ads"]',
		];
		for (const sel of selectors) {
			try {
				const btn = await page.$(sel);
				if (btn) {
					await btn.scrollIntoViewIfNeeded();
					await ModernAntiDetection.humanLikeDelay(1000, 2000);
					await btn.click();
					await ModernAntiDetection.humanLikeDelay(3000, 5000);
					return true;
				}
			} catch {
				/* next */
			}
		}
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await ModernAntiDetection.humanLikeDelay(3000, 5000);
		return false;
	}

	async run(onAd: (ad: MetaAd) => Promise<void>): Promise<{ total: number }> {
		const browser: Browser = await chromium.launch({
			headless: this.input.headlessMode,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
				"--disable-blink-features=AutomationControlled",
				"--hide-scrollbars",
				"--mute-audio",
				"--no-default-browser-check",
			],
		});
		try {
			const ua = ModernAntiDetection.getRandomUserAgent();
			const viewport = ModernAntiDetection.getRandomViewport();
			const context = await browser.newContext({ userAgent: ua, viewport });
			const page = await context.newPage();
			await ModernAntiDetection.setupAdvancedStealth(page);
			await this.setupNetworkInterception(page);

			const url = this.buildSearchUrl();
			console.log(`[meta-ads] navigating ${url}`);
			await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
			await this.checkForBlock(page);
			await this.handleCookieConsent(page);

			let total = 0;
			let empty = 0;
			let iter = 0;
			const maxIter = 10;
			while (total < (this.input.maxAds ?? 100) && empty < 3 && iter < maxIter) {
				iter++;
				await this.checkForBlock(page);
				if (!(await this.waitForAdsToLoad(page))) {
					empty++;
					continue;
				}
				const domAds = await this.extractAdDataFromDOM(page);
				const combined = [...domAds, ...this.adData];
				this.adData = [];
				if (combined.length === 0) {
					empty++;
				} else {
					empty = 0;
					const newAds = combined.filter((ad) => {
						const key = ad.adId ?? `${ad.pageName}_${(ad.adContent ?? "").substring(0, 50)}`;
						if (this.scrapedAds.has(key)) return false;
						this.scrapedAds.add(key);
						return true;
					});
					for (const ad of newAds) {
						await onAd(ad);
						total++;
						if (total >= (this.input.maxAds ?? 100)) break;
					}
				}
				if (total >= (this.input.maxAds ?? 100)) break;
				await this.loadMoreAds(page);
				await ModernAntiDetection.randomMouseMovement(page);
				await ModernAntiDetection.humanLikeDelay(
					this.input.delayBetweenRequests ?? 3000,
					(this.input.delayBetweenRequests ?? 3000) + 2000,
				);
			}
			await context.close();
			return { total };
		} finally {
			await browser.close();
		}
	}
}
