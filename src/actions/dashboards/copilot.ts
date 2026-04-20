"use server";

import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { prisma } from "@/lib/prismaDb";
import { getAuthSession } from "@/lib/auth";
import {
  WidgetConfigSchema,
  type WidgetConfig,
} from "@/lib/dashboards/widgetSchemas";
import {
  AVAILABLE_FIELDS,
  getFieldsForPersona,
} from "@/lib/dashboards/availableFields";

// ---------------------------------------------------------------------------
// Persona-specific system prompt fragments
// ---------------------------------------------------------------------------

const PERSONA_FOCUS: Record<string, string> = {
  CFO: `
You are assisting a CFO building a financial performance dashboard for a retail-intelligence SaaS.
Prioritise widgets that surface: revenue, margin, price gap ($ and %), inventory value at risk,
forecast vs actual revenue, and cost/stockout metrics.
Default comparison period: 28d.
Prefer stat cards and line charts for time series; top_table for SKU-level risk ranking.`,

  CMO: `
You are assisting a CMO building a marketing intelligence dashboard.
Prioritise widgets that surface: share of voice, promo intensity, competitor campaign cadence,
new product launches (recently listed SKUs), Instagram follower growth, discount depth distribution.
Prefer pie charts for share metrics, bar charts for brand comparison, top_table for competitor launches.`,

  OPS: `
You are assisting a Pricing / Merchandising Manager.
Prioritise widgets that surface: per-SKU price vs competitor, top movers by price change %,
stockout risk, overstock/understock stats, 4-week price drift.
Prefer top_table (sorted by priceChangePct) and stat cards for quick KPIs.`,

  GENERIC: `
You are assisting a retail analytics professional building a custom dashboard.
Choose the most appropriate widget type for the user's request.`,
};

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

export async function generateWidgetFromPrompt(
  dashboardId: string,
  prompt: string
): Promise<{ config: WidgetConfig; suggestedTitle: string }> {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Load dashboard to get persona + global filters
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: dashboardId,
      OR: [{ ownerId: session.user.id }, { isShared: true }],
    },
  });
  if (!dashboard) throw new Error("Dashboard not found");

  const persona = (dashboard.persona as string) ?? "GENERIC";
  const personaFields = getFieldsForPersona(
    persona as "CFO" | "CMO" | "OPS" | "GENERIC"
  );

  const fieldList = personaFields
    .map((f) => `  - field: "${f.field}" | label: "${f.label}" | format: ${f.format} | entityKind: ${f.entityKind}`)
    .join("\n");

  const systemPrompt = `
You generate dashboard widget configurations for a retail-intelligence SaaS platform.

${PERSONA_FOCUS[persona] ?? PERSONA_FOCUS.GENERIC}

AVAILABLE FIELDS (only use these — never invent field names):
${fieldList}

GLOBAL FILTERS currently applied to this dashboard:
${JSON.stringify(dashboard.globalFilters ?? {}, null, 2)}

RULES:
1. Use ONLY field names from the available fields list above.
2. Pick the widget type that best matches the user's intent.
3. For "top N" requests → top_table with limit = N.
4. For "trend over time" requests → line_chart with xField = "date".
5. For "compare brands/companies" → bar_chart.
6. For "breakdown / distribution" → pie.
7. For "single KPI" → stat.
8. For "side-by-side metric + trend" → sparkline.
9. Keep filters minimal; prefer rankBy + limit to constrain data.
10. Always set a sensible default for every required field.
`.trim();

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-5"),
    schema: WidgetConfigSchema,
    system: systemPrompt,
    prompt: `Generate a widget configuration for the following request:\n\n"${prompt}"`,
  });

  // Derive a human title from the prompt (first 60 chars, title-cased)
  const suggestedTitle =
    prompt.length > 60 ? prompt.slice(0, 57) + "…" : prompt;

  return { config: object, suggestedTitle };
}
