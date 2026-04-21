import type { Locale } from "@/i18n";
import { prisma } from "@/lib/prismaDb";
import { CreativeCard } from "@/components/application/marketing-assets/CreativeCard";
import type { RecentCreative } from "@/app/api/ads-events/overview/route";

export const dynamic = "force-dynamic";

type RawCreative = {
  id: string; platform: string; media_url: string | null;
  thumbnail_url: string | null; caption: string | null;
  first_seen_at: Date; hook_score: unknown; handle: string | null;
};

const ASSET_TYPE_TO_PLATFORM: Record<string, string> = {
  META_AD: "META_ADS_LIBRARY",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK_AD: "TIKTOK",
  YOUTUBE_AD: "YOUTUBE",
};

async function loadCreatives(platform?: string): Promise<RecentCreative[]> {
  const results: RecentCreative[] = [];

  // 1. Load from ads_events.AdCreative (event-sourced pipeline)
  try {
    const where = platform ? `WHERE c.platform = $1` : "";
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT c.id, c.platform, c.media_url, c.thumbnail_url, c.caption,
              c.first_seen_at, m.hook_score, a.handle
       FROM ads_events."AdCreative" c
       JOIN ads_events."AdAccount" a ON a.id = c.account_id
       LEFT JOIN LATERAL (
         SELECT hook_score FROM ads_events."AdMetricDaily"
         WHERE creative_id = c.id ORDER BY day DESC LIMIT 1
       ) m ON true
       ${where}
       ORDER BY c.first_seen_at DESC LIMIT 120`,
      ...(platform ? [platform] : []),
    )) as RawCreative[];
    for (const r of rows) {
      results.push({
        id: r.id, platform: r.platform,
        media_url: r.media_url, thumbnail_url: r.thumbnail_url, caption: r.caption,
        first_seen_at: new Date(r.first_seen_at).toISOString(),
        hook_score: r.hook_score != null ? String(r.hook_score) : null,
        handle: r.handle,
      });
    }
  } catch {
    // ads_events schema may not exist in all envs — continue
  }

  // 2. Load from MarketingAsset (Playwright scraper pipeline)
  try {
    const adAssetTypes = Object.keys(ASSET_TYPE_TO_PLATFORM);
    const assetPlatforms = platform
      ? Object.entries(ASSET_TYPE_TO_PLATFORM)
          .filter(([, p]) => p === platform)
          .map(([t]) => t)
      : adAssetTypes;

    if (assetPlatforms.length > 0) {
      const assets = await prisma.marketingAsset.findMany({
        where: { assetType: { in: assetPlatforms as any } },
        orderBy: { capturedAt: "desc" },
        take: 120,
        // @ts-ignore
        include: { brand: { select: { slug: true, name: true } } },
      });
      const existingIds = new Set(results.map((r) => r.id));
      for (const a of assets) {
        if (existingIds.has(a.id)) continue;
        const plat = ASSET_TYPE_TO_PLATFORM[a.assetType] ?? a.assetType;
        results.push({
          id: a.id,
          platform: plat,
          media_url: a.mediaUrls[0] ?? null,
          thumbnail_url: a.mediaUrls[0] ?? null,
          caption: a.title ?? a.bodyText ?? null,
          first_seen_at: a.capturedAt.toISOString(),
          hook_score: null,
          handle: a.brand?.slug ?? null,
        });
      }
    }
  } catch {
    // silent
  }

  // Sort merged results by first_seen_at DESC
  results.sort((a, b) => b.first_seen_at.localeCompare(a.first_seen_at));
  return results.slice(0, 120);
}

const PLATFORMS = ["ALL", "META_ADS_LIBRARY", "INSTAGRAM", "FACEBOOK", "TIKTOK"];

export default async function CreativesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ platform?: string }>;
}) {
  const [{ lang }, sp] = await Promise.all([params, searchParams]);
  const platform = sp.platform && sp.platform !== "ALL" ? sp.platform : undefined;
  const creatives = await loadCreatives(platform);

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Creatives</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Unique ad creatives scraped from tracked competitors.
          </p>
        </div>

        {/* Platform filter */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const active = (sp.platform ?? "ALL") === p;
            return (
              <a
                key={p}
                href={`/${lang}/marketing-assets/creatives${p !== "ALL" ? `?platform=${p}` : ""}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border-secondary bg-bg-primary text-text-secondary hover:border-brand-400 hover:text-text-primary"
                }`}
              >
                {p === "ALL" ? "All Platforms" : p.replace(/_/g, " ")}
              </a>
            );
          })}
        </div>

        <p className="text-xs text-text-tertiary">{creatives.length} creatives</p>

        {creatives.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border-secondary text-sm text-text-tertiary">
            No creatives yet — run a scrape to populate this library.
          </div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5">
            {creatives.map((c) => (
              <div key={c.id} className="mb-4 break-inside-avoid">
                <CreativeCard creative={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
