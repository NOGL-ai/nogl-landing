/**
 * `searchTerms` query: JSON array of strings, URL-encoded once in the query string.
 * Example: ?searchTerms=%5B%22running+shoes%22%5D → ["running shoes"]
 */
export function parseSearchTermsParam(raw: string | string[] | undefined): string[] {
  if (raw == null) return [];
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s || typeof s !== "string" || !s.trim()) return [];

  try {
    const v = JSON.parse(s) as unknown;
    if (Array.isArray(v)) {
      return v
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 12);
    }
    if (typeof v === "string" && v.trim()) return [v.trim()];
  } catch {
    // Not JSON — treat whole value as a single term (legacy / manual links).
    return [s.trim()];
  }
  return [];
}

export function buildProductExplorerResearchHref(lang: string, terms: string[]): string {
  const clean = terms.map((t) => t.trim()).filter(Boolean).slice(0, 12);
  const encoded = encodeURIComponent(JSON.stringify(clean));
  return `/${lang}/product-explorer/research?searchTerms=${encoded}`;
}
