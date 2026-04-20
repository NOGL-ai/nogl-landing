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
	adTitle?: string | null;
	adCaption?: string | null;
	adLinkDescription?: string | null;
	startDate?: string | null;
	endDate?: string | null;
	spend?: string | null;
	impressions?: string | null;
	reach?: string | null;
	demographics?: unknown;
	platforms?: string[] | null;
	categories?: string[] | null;
	countries?: string[] | null;
	collationId?: string | null;
	collationCount?: number | null;
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

		// Current structure: data.ad_library_main.search_results_connection.edges[].node.collated_results[]
		const main = data.ad_library_main as
			| { search_results_connection?: { edges?: Array<{ node?: { collated_results?: unknown[] } }> } }
			| undefined;
		const edges = main?.search_results_connection?.edges ?? [];
		for (const edge of edges) {
			for (const cr of edge.node?.collated_results ?? []) {
				const ad = this.processAdNode(cr as Record<string, unknown>);
				if (ad) this.adData.push(ad);
			}
		}

		// Legacy fallback paths for older GraphQL shapes
		const legacyPaths = ["ad_library_search", "adLibrarySearch", "search_results"];
		for (const path of legacyPaths) {
			const candidate = data[path] as { edges?: Array<{ node?: Record<string, unknown> }> } | undefined;
			if (candidate?.edges) {
				for (const edge of candidate.edges) {
					if (!edge.node) continue;
					const ad = this.processAdNode(edge.node);
					if (ad) this.adData.push(ad);
				}
				break;
			}
		}
	}

	processAdNode(adNode: Record<string, unknown>, source: MetaAd["source"] = "graphql_interception"): MetaAd | null {
		try {
			// Support both old shape (page.{id,name}) and new shape (page_id / page_name on root)
			const pageObj = (adNode.page as Record<string, unknown> | undefined) ?? {};
			const snap = (adNode.snapshot as Record<string, unknown> | undefined) ?? {};
			const spend = adNode.spend as { lower_bound?: string; upper_bound?: string } | undefined;
			const impressions = adNode.impressions as { lower_bound?: string; upper_bound?: string } | undefined;
			const reach = adNode.reach as { lower_bound?: string; upper_bound?: string } | undefined;

			// Ad copy: body.text (new) or ad_creative_body (old)
			const bodyObj = snap.body as { text?: string } | undefined;
			const adContent =
				bodyObj?.text ??
				(adNode.ad_creative_body as string | undefined) ??
				(adNode.creative_body as string | undefined) ??
				null;

			// Images: snapshot.images[].original_image_url (new) or ad_creative_link_captions (old)
			const snapImages = (snap.images as Array<{ original_image_url?: string; resized_image_url?: string }> | undefined) ?? [];
			const imageUrls = snapImages.map((i) => i.original_image_url ?? i.resized_image_url).filter(Boolean) as string[];

			// Videos: snapshot.videos[].video_hd_url (new)
			const snapVideos = (snap.videos as Array<{ video_hd_url?: string; video_sd_url?: string }> | undefined) ?? [];

			// Impressions: new shape uses impressions_with_index.impressions_text
			const impressionsWithIndex = adNode.impressions_with_index as { impressions_text?: string | null } | undefined;
			const impressionsText =
				impressionsWithIndex?.impressions_text ??
				(impressions?.lower_bound ?? impressions?.upper_bound) ??
				null;

			const ad: MetaAd = {
				adId: (adNode.ad_archive_id as string | undefined) ?? (adNode.id as string | undefined) ?? null,
				pageId:
					(adNode.page_id as string | undefined) ??
					(snap.page_id as string | undefined) ??
					(pageObj.id as string | undefined) ??
					null,
				pageName:
					(snap.page_name as string | undefined) ??
					(adNode.page_name as string | undefined) ??
					(pageObj.name as string | undefined) ??
					null,
				adContent,
				adTitle: (snap.title as string | undefined) ?? null,
				adCaption: (snap.caption as string | undefined) ?? null,
				adLinkDescription: (snap.link_description as string | undefined) ?? null,
				startDate: (adNode.start_date as string | undefined) ?? (adNode.ad_delivery_start_time as string | undefined) ?? null,
				endDate: (adNode.end_date as string | undefined) ?? (adNode.ad_delivery_stop_time as string | undefined) ?? null,
				spend: spend?.lower_bound ?? spend?.upper_bound ?? null,
				impressions: impressionsText,
				reach: reach?.lower_bound ?? reach?.upper_bound ?? null,
				demographics: adNode.demographic_distribution,
				// publisher_platform (no 's') is the current field name; publisher_platforms is legacy
				platforms: (adNode.publisher_platform as string[] | undefined) ?? (adNode.publisher_platforms as string[] | undefined) ?? null,
				categories: (adNode.categories as string[] | undefined) ?? null,
				countries: (adNode.targeted_or_reached_countries as string[] | undefined) ?? null,
				collationId: (adNode.collation_id as string | undefined) ?? null,
				collationCount: (adNode.collation_count as number | undefined) ?? null,
				adCreative: {
					images: imageUrls.length ? imageUrls : (adNode.ad_creative_link_captions ?? []),
					extra_images: snap.extra_images ?? [],
					videos: snapVideos.length ? snapVideos : (adNode.videos ?? []),
					extra_videos: snap.extra_videos ?? [],
					link_url: (snap.link_url as string | undefined) ?? adNode.ad_creative_link_url,
					extra_links: snap.extra_links ?? [],
					extra_texts: snap.extra_texts ?? [],
					cta_text: snap.cta_text,
					cta_type: snap.cta_type,
					display_format: snap.display_format,
					cards: snap.cards,
					page_profile_picture_url: snap.page_profile_picture_url,
					page_profile_uri: snap.page_profile_uri,
					page_like_count: snap.page_like_count,
					page_categories: snap.page_categories,
					byline: snap.byline,
					disclaimer_label: snap.disclaimer_label,
					branded_content: snap.branded_content,
					ec_certificates: snap.ec_certificates,
					country_iso_code: snap.country_iso_code,
				},
				targetingInfo: adNode.target_ages ?? adNode.target_gender,
				currency: (adNode.currency as string | undefined) ?? null,
				isActive: (adNode.is_active as boolean | undefined) ?? null,
				scrapedAt: new Date().toISOString(),
				source,
				url: `https://www.facebook.com/ads/library/?id=${adNode.ad_archive_id ?? ""}`,
			};

			return ad;
		} catch {
			return null;
		}
	}

	async extractAdDataFromDOM(page: Page): Promise<MetaAd[]> {
		// Primary: extract collated_results arrays from server-embedded JSON in <script> tags.
		// Meta removed all data-testid card attributes; data is now SSR-embedded relay JSON.
		const fromScripts = await page.evaluate((): Array<Record<string, unknown>> => {
			const nodes: Array<Record<string, unknown>> = [];
			for (const script of Array.from(document.scripts)) {
				const text = script.textContent ?? "";
				if (!text.includes("ad_archive_id") || !text.includes("collated_results")) continue;
				// Walk through all occurrences of "collated_results": [...]
				let searchFrom = 0;
				while (true) {
					const keyIdx = text.indexOf('"collated_results":', searchFrom);
					if (keyIdx === -1) break;
					const arrStart = text.indexOf("[", keyIdx);
					if (arrStart === -1) { searchFrom = keyIdx + 1; continue; }
					// Find matching close bracket, tracking nesting depth
					let depth = 0;
					let arrEnd = -1;
					for (let i = arrStart; i < Math.min(arrStart + 500_000, text.length); i++) {
						if (text[i] === "[") depth++;
						else if (text[i] === "]") { depth--; if (depth === 0) { arrEnd = i; break; } }
					}
					if (arrEnd !== -1) {
						try {
							const arr = JSON.parse(text.slice(arrStart, arrEnd + 1)) as Array<Record<string, unknown>>;
							nodes.push(...arr.filter((n) => n && typeof n === "object" && n.ad_archive_id));
						} catch { /* skip malformed chunk */ }
					}
					searchFrom = keyIdx + 1;
				}
			}
			return nodes;
		});

		if (fromScripts.length > 0) {
			return fromScripts
				.map((n) => this.processAdNode(n, "dom_extraction"))
				.filter(Boolean) as MetaAd[];
		}

		// Fallback: anchor-link DOM walk (SPA-rendered state after hydration)
		const ads = await page.evaluate(() => {
			const out: Array<Record<string, unknown>> = [];
			let elements: Element[] = [];
			// Anchor on ad-detail deep-links — the one stable attribute Meta hasn't removed
			const adLinks = Array.from(document.querySelectorAll('a[href*="/ads/library/?id="]'));
			const seen = new Set<Element>();
			for (const link of adLinks) {
				const card = link.closest("li") ?? link.parentElement?.parentElement?.parentElement ?? null;
				if (card && !seen.has(card)) { seen.add(card); elements.push(card); }
			}
			for (const el of elements) {
				try {
					const ad: Record<string, unknown> = { scrapedAt: new Date().toISOString(), url: window.location.href };
					const pageNameEl = el.querySelector("a[href] span");
					if (pageNameEl?.textContent) ad.pageName = pageNameEl.textContent.trim();
					const imgs = Array.from(el.querySelectorAll("img[src]"))
						.map((i) => (i as HTMLImageElement).src)
						.filter((u) => !!u && !u.startsWith("data:") && !u.includes("rsrc.php"));
					if (imgs.length) ad.adCreative = { images: imgs };
					if (ad.pageName || imgs.length) out.push(ad);
				} catch { /* ignore */ }
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
			// Prefer visible ad-detail anchor links (SPA-rendered state)
			const linkFound = await page.waitForSelector(
				'a[href*="/ads/library/?id="]',
				{ timeout: 12_000 },
			).then(() => true).catch(() => false);

			if (!linkFound) {
				// Fallback: wait for server-embedded ad JSON to be present in the page
				await page.waitForFunction(
					() => document.body.innerHTML.includes("ad_archive_id"),
					{ timeout: 12_000 },
				);
			}

			await ModernAntiDetection.humanLikeDelay(2000, 3000);
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
			'[aria-label="Accept All"]',
			'[aria-label="Allow all cookies"]',
			'[aria-label="Alle Cookies erlauben"]',
			'[data-cookiebanner="accept_button"]',
		];
		for (const sel of selectors) {
			try {
				const btn = await page.$(sel);
				if (btn) {
					await btn.click();
					await ModernAntiDetection.humanLikeDelay(1500, 2500);
					return;
				}
			} catch {
				/* next */
			}
		}
		// Role-based fallback — covers DE locale "Alle Cookies erlauben"
		try {
			const btn = page.getByRole("button", {
				name: /alle cookies erlauben|allow all cookies|accept all|akzeptieren/i,
			});
			if (await btn.isVisible({ timeout: 5_000 })) {
				await btn.click();
				await ModernAntiDetection.humanLikeDelay(1500, 2500);
			}
		} catch {
			/* no consent banner */
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
			// "load" is reliable; "networkidle" stalls indefinitely on Meta's long-poll WS connections
			await page.goto(url, { waitUntil: "load", timeout: 60_000 });
			await ModernAntiDetection.humanLikeDelay(2000, 3000);
			await this.checkForBlock(page);
			await this.handleCookieConsent(page);
			// Give the SPA time to re-render after consent dismissal
			await ModernAntiDetection.humanLikeDelay(3000, 4000);

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
