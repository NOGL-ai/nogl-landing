/**
 * Backfill mediaUrls for all META_AD rows where mediaUrls is empty
 * but payload.adCreative.cards[].resized_image_url exists.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.marketingAsset.findMany({
    where: { assetType: "META_AD", mediaUrls: { equals: [] } },
    select: { id: true, contentHash: true, payload: true },
  });

  console.log(`Found ${assets.length} rows with empty mediaUrls`);
  let updated = 0;

  for (const asset of assets) {
    const payload = asset.payload as Record<string, unknown> | null;
    if (!payload) continue;

    const creative = payload.adCreative as {
      images?: string[];
      cards?: Array<{
        resized_image_url?: string;
        original_image_url?: string;
        video_sd_url?: string | null;
        video_hd_url?: string | null;
        video_preview_image_url?: string | null;
      }>;
      image_url?: string;
      video_sd_url?: string | null;
      video_hd_url?: string | null;
    } | null;

    if (!creative || typeof creative !== "object") continue;

    const mediaUrls: string[] = [];
    if (creative.images?.length) mediaUrls.push(...creative.images.filter(Boolean) as string[]);
    if (creative.cards?.length) {
      for (const card of creative.cards) {
        const url =
          card.resized_image_url ||
          card.original_image_url ||
          card.video_preview_image_url ||
          card.video_sd_url ||
          card.video_hd_url;
        if (url) mediaUrls.push(url);
      }
    }
    if (creative.image_url) mediaUrls.push(creative.image_url);
    if (!mediaUrls.length) {
      if (creative.video_sd_url) mediaUrls.push(creative.video_sd_url);
      else if (creative.video_hd_url) mediaUrls.push(creative.video_hd_url);
    }

    if (mediaUrls.length === 0) continue;

    await prisma.marketingAsset.update({
      where: { id: asset.id },
      data: { mediaUrls },
    });
    updated++;
  }

  console.log(`Updated ${updated} rows with media URLs`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
