import { Palette, Package as Package2, Plus } from '@untitledui/icons';
import React from "react";
import type { Locale } from "@/i18n";
import type { BrandProfile } from "@/lib/ad-scoring/types";

export const metadata = {
  title: "Brand Profiles",
};

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  await params;

  const apiBase = process.env.AD_SCORING_API_URL ?? "http://10.10.10.184:8000";

  let brands: BrandProfile[] = [];
  try {
    const apiKey = process.env.AD_SCORING_API_KEY ?? "";
    const res = await fetch(`${apiBase}/api/v1/brands`, {
      next: { revalidate: 60 },
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    });
    if (res.ok) brands = await res.json();
  } catch {
    // API unreachable — show empty state
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Brand Profiles
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Brand profiles provide colour palettes and product terms used by{" "}
            <code className="bg-bg-tertiary px-1 rounded text-xs">color.brand_ci_match</code>,{" "}
            <code className="bg-bg-tertiary px-1 rounded text-xs">cta.logo_visibility</code>, and{" "}
            <code className="bg-bg-tertiary px-1 rounded text-xs">text.keyword_cta_presence</code>{" "}
            metrics. Profile data is owned by the scoring service — no Prisma tables.
          </p>
        </div>
        <button
          disabled
          title="Brand profile creation via API — coming in next iteration"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-bg-brand-solid/50 text-white cursor-not-allowed opacity-60"
        >
          <Plus className="h-4 w-4" />
          New Brand
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-primary bg-bg-secondary p-12 text-center">
          <Package2 className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-sm text-text-tertiary">
            No brand profiles configured yet.
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Add profiles via{" "}
            <code className="bg-bg-tertiary px-1 rounded">POST /api/v1/brands</code>{" "}
            on the scoring service, or seed with{" "}
            <code className="bg-bg-tertiary px-1 rounded">
              config/brands.example.yaml
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="rounded-xl border border-border-primary bg-bg-primary p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-text-primary">
                  {brand.name}
                </h2>
                <span className="text-xs font-mono text-text-tertiary">
                  {brand.id.slice(0, 8)}
                </span>
              </div>

              {/* Colour palette swatches */}
              {brand.palette_hex.length > 0 && (
                <div>
                  <p className="text-xs text-text-tertiary mb-2 flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" />
                    Palette ({brand.palette_hex.length} colours)
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {brand.palette_hex.map((hex) => (
                      <div
                        key={hex}
                        className="group relative"
                        title={hex}
                      >
                        <div
                          className="h-7 w-7 rounded-full border-2 border-white shadow-sm ring-1 ring-border-primary"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-mono text-text-tertiary whitespace-nowrap">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product terms */}
              {brand.product_terms.length > 0 && (
                <div>
                  <p className="text-xs text-text-tertiary mb-1.5">
                    Product terms ({brand.product_terms.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.product_terms.map((t) => (
                      <span
                        key={t}
                        className="bg-bg-tertiary text-text-tertiary text-xs px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Logo references */}
              {brand.logo_reference_paths.length > 0 && (
                <div>
                  <p className="text-xs text-text-tertiary mb-1">
                    Logo references ({brand.logo_reference_paths.length})
                  </p>
                  <ul className="space-y-0.5">
                    {brand.logo_reference_paths.map((p) => (
                      <li
                        key={p}
                        className="text-xs font-mono text-text-tertiary truncate"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-text-tertiary pt-1 border-t border-border-primary">
                Created {new Date(brand.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
