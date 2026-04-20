/**
 * Returns the whitelist of field names the Copilot is allowed to reference
 * per entity kind. Keeps the AI from hallucinating column names.
 */

export interface AvailableField {
  field: string;
  label: string;
  format: "number" | "currency" | "percent" | "date" | "image" | "rating" | "text";
  entityKind: string;
}

export const AVAILABLE_FIELDS: AvailableField[] = [
  // ── Product / competitor product fields ──────────────────────────────────
  { field: "name",            label: "Product Name",      format: "text",     entityKind: "product" },
  { field: "brand",           label: "Brand",             format: "text",     entityKind: "product" },
  { field: "category",        label: "Category",          format: "text",     entityKind: "product" },
  { field: "price",           label: "Price",             format: "currency", entityKind: "product" },
  { field: "priceChange",     label: "Price Change",      format: "currency", entityKind: "product" },
  { field: "priceChangePct",  label: "Price Change %",    format: "percent",  entityKind: "product" },
  { field: "volume",          label: "Sales Volume",      format: "number",   entityKind: "product" },
  { field: "revenue",         label: "Revenue",           format: "currency", entityKind: "product" },
  { field: "margin",          label: "Margin",            format: "currency", entityKind: "product" },
  { field: "marginPct",       label: "Margin %",          format: "percent",  entityKind: "product" },
  { field: "rating",          label: "Rating",            format: "rating",   entityKind: "product" },
  { field: "reviewCount",     label: "Review Count",      format: "number",   entityKind: "product" },
  { field: "imageUrl",        label: "Thumbnail",         format: "image",    entityKind: "product" },
  { field: "inStock",         label: "In Stock",          format: "text",     entityKind: "product" },
  { field: "stockoutRisk",    label: "Stockout Risk",     format: "percent",  entityKind: "product" },
  { field: "forecastDemand",  label: "Forecast Demand",   format: "number",   entityKind: "product" },
  { field: "discountDepth",   label: "Discount Depth",    format: "percent",  entityKind: "product" },
  { field: "createdAt",       label: "Date Listed",       format: "date",     entityKind: "product" },

  // ── Company / competitor fields ──────────────────────────────────────────
  { field: "companyName",     label: "Company",           format: "text",     entityKind: "company" },
  { field: "domain",          label: "Domain",            format: "text",     entityKind: "company" },
  { field: "marketShare",     label: "Market Share",      format: "percent",  entityKind: "company" },
  { field: "avgPrice",        label: "Avg Price",         format: "currency", entityKind: "company" },
  { field: "totalRevenue",    label: "Total Revenue",     format: "currency", entityKind: "company" },
  { field: "skuCount",        label: "SKU Count",         format: "number",   entityKind: "company" },
  { field: "rank",            label: "Rank",              format: "number",   entityKind: "company" },
  { field: "igFollowers",     label: "IG Followers",      format: "number",   entityKind: "company" },
  { field: "igGrowthPct",     label: "IG Follower Growth %", format: "percent", entityKind: "company" },
  { field: "promoIntensity",  label: "Promo Intensity",   format: "percent",  entityKind: "company" },

  // ── Category fields ───────────────────────────────────────────────────────
  { field: "categoryName",    label: "Category",          format: "text",     entityKind: "category" },
  { field: "categoryRevenue", label: "Category Revenue",  format: "currency", entityKind: "category" },
  { field: "shareOfVoice",    label: "Share of Voice",    format: "percent",  entityKind: "category" },

  // ── Time-series / forecast fields ────────────────────────────────────────
  { field: "date",            label: "Date",              format: "date",     entityKind: "timeseries" },
  { field: "week",            label: "Week",              format: "date",     entityKind: "timeseries" },
  { field: "inventoryValue",  label: "Inventory Value",   format: "currency", entityKind: "timeseries" },
  { field: "forecastRevenue", label: "Forecast Revenue",  format: "currency", entityKind: "timeseries" },
  { field: "actualRevenue",   label: "Actual Revenue",    format: "currency", entityKind: "timeseries" },
];

export function getFieldsForPersona(persona: "CFO" | "CMO" | "OPS" | "GENERIC"): AvailableField[] {
  switch (persona) {
    case "CFO":
      return AVAILABLE_FIELDS.filter(f =>
        ["revenue", "margin", "marginPct", "priceChange", "inventoryValue",
         "forecastRevenue", "actualRevenue", "totalRevenue", "stockoutRisk",
         "forecastDemand", "volume", "date", "week"].includes(f.field)
      );
    case "CMO":
      return AVAILABLE_FIELDS.filter(f =>
        ["shareOfVoice", "promoIntensity", "discountDepth", "igFollowers",
         "igGrowthPct", "marketShare", "createdAt", "brand", "category",
         "categoryName", "categoryRevenue", "date", "week"].includes(f.field)
      );
    case "OPS":
      return AVAILABLE_FIELDS.filter(f =>
        ["price", "priceChange", "priceChangePct", "volume", "inStock",
         "stockoutRisk", "forecastDemand", "margin", "discountDepth",
         "name", "brand", "category", "skuCount"].includes(f.field)
      );
    default:
      return AVAILABLE_FIELDS;
  }
}
