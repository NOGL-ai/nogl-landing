/**
 * Backfill title/bodyText for META_AD rows where title is a template
 * placeholder like "{{product.brand}}". Uses adCreative.cards[0].title/body
 * from the stored payload.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isTemplate(s: string | null | undefined): boolean {
  return !!s && /^\s*\{\{/.test(s);
}

async function main() {
  const rows = await prisma.marketingAsset.findMany({
    where: { assetType: "META_AD", title: { startsWith: "{{" } },
    select: { id: true, payload: true, title: true },
  });

  console.log(`Found ${rows.length} rows with template titles`);
  let updated = 0;

  for (const row of rows) {
    const payload = row.payload as Record<string, unknown> | null;
    if (!payload) continue;
    const creative = payload.adCreative as {
      cards?: Array<{ title?: string; body?: string }>;
    } | null;
    const card = creative?.cards?.[0];
    if (!card) continue;
    const cardTitle = card.title?.trim();
    const cardBody = card.body?.trim();
    if (!cardTitle && !cardBody) continue;
    if (isTemplate(cardTitle) && isTemplate(cardBody)) continue;

    const newTitle = (isTemplate(cardTitle) ? cardBody : cardTitle) || cardBody || cardTitle;
    const newBody = (isTemplate(cardBody) ? cardTitle : cardBody) || cardTitle;
    if (!newTitle) continue;

    await prisma.marketingAsset.update({
      where: { id: row.id },
      data: { title: newTitle.substring(0, 160), bodyText: newBody ?? null },
    });
    updated++;
  }

  console.log(`Updated ${updated} rows with real titles`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
