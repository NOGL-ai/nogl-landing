import { detectActorKind, normalizeMetaAd } from "@/lib/apify/normalize";

describe("detectActorKind", () => {
	it("detects meta", () => {
		expect(detectActorKind("tuhinmallick/meta-ads-library-scraper")).toBe("meta");
	});
	it("detects google/youtube", () => {
		expect(detectActorKind("apify/google-ads-scraper")).toBe("google_youtube");
		expect(detectActorKind("user/youtube-search")).toBe("google_youtube");
	});
	it("detects tiktok + instagram", () => {
		expect(detectActorKind("apify/tiktok-ads")).toBe("tiktok");
		expect(detectActorKind("apify/instagram-scraper")).toBe("instagram");
	});
	it("returns null when unknown", () => {
		expect(detectActorKind("some/random-actor")).toBeNull();
	});
});

describe("normalizeMetaAd", () => {
	it("produces a stable contentHash for the same adId", () => {
		const brandId = "brand-123";
		const a = normalizeMetaAd({ adId: "abc123", pageName: "Foto Erhardt" }, brandId);
		const b = normalizeMetaAd({ adId: "abc123", pageName: "Foto Erhardt", extra: true }, brandId);
		expect(a.contentHash).toBe(b.contentHash);
		expect(a.assetType).toBe("META_AD");
		expect(a.source).toBe("APIFY_META");
	});

	it("classifies mediaType as video when url ends in .mp4", () => {
		const out = normalizeMetaAd(
			{ adId: "id1", adCreative: { images: [], videos: ["https://cdn/x.mp4"] } },
			"b",
		);
		expect(out.payload.mediaType).toBe("video");
		expect(out.mediaUrls).toContain("https://cdn/x.mp4");
	});
});
