/* eslint-disable no-console */
/**
 * Upsert 5 ForecastAnnotation rows scoped to the Calumet tenant.
 * Idempotent: deletes by (tenantId, title) before re-inserting.
 */

import { type PrismaClient } from "@prisma/client";

interface AnnotationDef {
  kind: string;
  title: string;
  eventDate: string;
  endDate?: string;
  severity: "info" | "warning" | "critical";
  channels?: string[];
  description?: string;
}

const ANNOTATIONS: AnnotationDef[] = [
  {
    kind: "out_of_stock",
    title: "X100VI Stock Gap",
    eventDate: "2025-08-12",
    endDate: "2025-09-28",
    severity: "critical",
    channels: ["shopify", "amazon"],
    description:
      "Fujifilm X100VI allocated supply exhausted; 47-day gap before DE restock.",
  },
  {
    kind: "event_spike",
    title: "Black Friday 2024",
    eventDate: "2024-11-29",
    severity: "info",
    description: "Black Friday demand spike across all channels.",
  },
  {
    kind: "event_spike",
    title: "Black Friday 2025",
    eventDate: "2025-11-28",
    severity: "info",
    description: "Black Friday demand spike across all channels.",
  },
  {
    kind: "launch",
    title: "Canon EOS R5 II Announce",
    eventDate: "2025-07-17",
    severity: "info",
    channels: ["shopify", "b2b"],
    description: "Canon EOS R5 Mark II availability announcement; pre-order surge.",
  },
  {
    kind: "promotion",
    title: "Valentine's Portrait Kit Promo",
    eventDate: "2025-02-10",
    endDate: "2025-02-14",
    severity: "warning",
    channels: ["shopify"],
    description: "Valentine's portrait kit bundle promo; lens + camera cross-sell.",
  },
  {
    kind: "event_spike",
    title: "Photokina-adjacent Pro Pulse",
    eventDate: "2025-09-20",
    severity: "info",
    channels: ["b2b", "offline"],
    description:
      "Annual September pro-segment demand pulse aligned with Cologne trade week.",
  },
];

export async function seedAnnotations(
  prisma: PrismaClient,
  tenantId: string,
): Promise<void> {
  console.log(`[seed-annotations] Upserting ${ANNOTATIONS.length} annotations…`);

  for (const ann of ANNOTATIONS) {
    // Delete any prior copies by title (idempotency)
    await prisma.forecastAnnotation.deleteMany({
      where: { tenantId, title: ann.title },
    });

    await prisma.forecastAnnotation.create({
      data: {
        tenantId,
        annotationDate: new Date(ann.eventDate + "T00:00:00Z"),
        endDate: ann.endDate
          ? new Date(ann.endDate + "T00:00:00Z")
          : null,
        kind: ann.kind,
        severity: ann.severity,
        title: ann.title,
        description: ann.description ?? null,
        delta: null,
        channelName: ann.channels ? ann.channels[0] ?? null : null,
        variantId: null,
      },
    });
  }

  console.log(`[seed-annotations] Done — ${ANNOTATIONS.length} annotations upserted`);
}
