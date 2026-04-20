/**
 * Adapter: maps between the form's RepricingRuleFormData shape (src/types/repricing-rule.ts)
 * and the Prisma model shape (RepricingRule / RepricingRuleDTO).
 *
 * This lets the wizard UI remain unchanged while the DB uses its own enum vocabulary.
 */
import type { RepricingRuleFormData } from "@/types/repricing-rule";
import type { RepricingRuleDTO, Guardrail } from "./types";

// ─── Form → DB ────────────────────────────────────────────────────────────────

type PriceDirMap = Record<string, RepricingRuleDTO["priceDirection"]>;
const PRICE_DIR_MAP: PriceDirMap = {
  plus: "PLUS",
  minus: "MINUS",
  percentage: "PERCENTAGE",
  fixed: "FIXED",
};

type CmpSourceMap = Record<string, RepricingRuleDTO["comparisonSource"]>;
const CMP_SOURCE_MAP: CmpSourceMap = {
  my_price: "MY_PRICE",
  cheapest: "CHEAPEST",
  average: "AVERAGE",
  specific: "SPECIFIC",
};

type CmpLogicMap = Record<string, RepricingRuleDTO["comparisonLogic"]>;
const CMP_LOGIC_MAP: CmpLogicMap = {
  equal: "EQUAL",
  above: "ABOVE",
  below: "BELOW",
};

type ScopeTypeMap = Record<string, RepricingRuleDTO["scopeType"]>;
const SCOPE_TYPE_MAP: ScopeTypeMap = {
  all: "ALL",
  categories: "CATEGORIES",
  specific: "SPECIFIC",
};

type MinMaxTypeMap = Record<string, RepricingRuleDTO["minMaxType"]>;
const MIN_MAX_TYPE_MAP: MinMaxTypeMap = {
  manual: "MANUAL",
  gross_margin: "GROSS_MARGIN",
  cost: "COST",
  price: "PRICE",
  map: "MAP",
};

/** Convert wizard form data → Prisma create/update payload */
export function formToCreatePayload(
  form: RepricingRuleFormData,
  createdById?: string
): Omit<RepricingRuleDTO, "id" | "createdAt" | "updatedAt" | "conflictsWithRuleIds"> {
  // Build guardrails from min_max_price
  const guardrails: Guardrail[] = [];
  if (form.min_max_price.min?.stay === "min" && form.min_max_price.min.value != null) {
    guardrails.push({ type: "ABS_MIN", value: form.min_max_price.min.value });
  }
  if (form.min_max_price.max?.stay === "max" && form.min_max_price.max.value != null) {
    guardrails.push({ type: "ABS_MAX", value: form.min_max_price.max.value });
  }

  const competitorIds = Array.isArray(form.competitors)
    ? form.competitors.filter((c): c is string => typeof c === "string")
    : (form.competitors as { id: string; enabled: boolean }[])
        .filter((c) => c.enabled)
        .map((c) => c.id);

  // Schedule resolution
  let scheduleType: RepricingRuleDTO["scheduleType"] = "MANUAL";
  let scheduleHour: number | null = null;
  if (form.automations.autopilot) {
    if (form.automations.options.autopilot_after_import) {
      scheduleType = "HOURLY"; // approximate "after import" as hourly
    } else if (form.automations.options.autopilot_fixed_time) {
      scheduleType = "DAILY";
      scheduleHour = form.automations.options.autopilot_fixed_time_value ?? 7;
    }
  }

  return {
    name: form.name,
    description: null,
    status: "DRAFT",
    priority: 0,
    scopeType: (SCOPE_TYPE_MAP[form.products.type] ?? "ALL") as RepricingRuleDTO["scopeType"],
    categoryIds: form.products.categories ?? [],
    productIds: form.products.product_ids ?? [],
    setPrice: form.pricing.set_price ?? 0,
    priceDirection: (PRICE_DIR_MAP[form.pricing.price_direction] ?? "PERCENTAGE") as RepricingRuleDTO["priceDirection"],
    comparisonSource: (CMP_SOURCE_MAP[form.pricing.comparison_source] ?? "CHEAPEST") as RepricingRuleDTO["comparisonSource"],
    comparisonLogic: (CMP_LOGIC_MAP[form.pricing.comparison_logic] ?? "BELOW") as RepricingRuleDTO["comparisonLogic"],
    specificCompetitorId: null,
    competitorIds,
    guardrails,
    minMaxType: (MIN_MAX_TYPE_MAP[form.min_max_price.type] ?? "MANUAL") as RepricingRuleDTO["minMaxType"],
    minMax: form.min_max_price as unknown as Record<string, unknown>,
    ruleOptions: form.options as unknown as Record<string, unknown>,
    scheduleType,
    scheduleHour,
    scheduleDow: null,
    autoApply: form.automations.autopilot,
    lastRunAt: null,
    nextRunAt: null,
    createdById: createdById ?? null,
  };
}

// ─── DB → Form ────────────────────────────────────────────────────────────────

const PRICE_DIR_REVERSE: Record<string, string> = {
  PLUS: "plus",
  MINUS: "minus",
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};
const CMP_SOURCE_REVERSE: Record<string, string> = {
  MY_PRICE: "my_price",
  CHEAPEST: "cheapest",
  AVERAGE: "average",
  SPECIFIC: "specific",
};
const CMP_LOGIC_REVERSE: Record<string, string> = {
  EQUAL: "equal",
  ABOVE: "above",
  BELOW: "below",
};
const SCOPE_TYPE_REVERSE: Record<string, string> = {
  ALL: "all",
  CATEGORIES: "categories",
  SPECIFIC: "specific",
};
const MIN_MAX_TYPE_REVERSE: Record<string, string> = {
  MANUAL: "manual",
  GROSS_MARGIN: "gross_margin",
  COST: "cost",
  PRICE: "price",
  MAP: "map",
};

/** Convert Prisma model → wizard form data (for editing) */
export function dtoToFormData(dto: RepricingRuleDTO): RepricingRuleFormData {
  return {
    name: dto.name,
    pricing: {
      set_price: dto.setPrice,
      price_direction: (PRICE_DIR_REVERSE[dto.priceDirection] ?? "percentage") as RepricingRuleFormData["pricing"]["price_direction"],
      comparison_source: (CMP_SOURCE_REVERSE[dto.comparisonSource] ?? "cheapest") as RepricingRuleFormData["pricing"]["comparison_source"],
      comparison_logic: (CMP_LOGIC_REVERSE[dto.comparisonLogic] ?? "below") as RepricingRuleFormData["pricing"]["comparison_logic"],
    },
    competitors: dto.competitorIds,
    stop_condition: {
      type: "none",
    },
    min_max_price: {
      type: (MIN_MAX_TYPE_REVERSE[dto.minMaxType] ?? "manual") as RepricingRuleFormData["min_max_price"]["type"],
      ...extractMinMax(dto),
    },
    products: {
      type: (SCOPE_TYPE_REVERSE[dto.scopeType] ?? "all") as RepricingRuleFormData["products"]["type"],
      categories: dto.categoryIds,
      product_ids: dto.productIds,
    },
    automations: {
      autopilot: dto.autoApply,
      options: {
        autopilot_after_import: dto.scheduleType === "HOURLY",
        autopilot_fixed_time: dto.scheduleType === "DAILY",
        autopilot_fixed_time_value: dto.scheduleHour ?? 7,
      },
    },
    options: (dto.ruleOptions as unknown as RepricingRuleFormData["options"]) ?? {
      adjust_calculated_price: { enabled: false },
      rounding_price: false,
    },
    export_settings: {
      enabled: false,
      format: "csv",
      email_notification: false,
    },
  };
}

function extractMinMax(dto: RepricingRuleDTO) {
  const raw = dto.minMax as Record<string, unknown>;
  return {
    min: raw.min as RepricingRuleFormData["min_max_price"]["min"],
    max: raw.max as RepricingRuleFormData["min_max_price"]["max"],
  };
}
