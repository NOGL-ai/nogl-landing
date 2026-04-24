import { ProductPriceHistoryChart, BrandSparkCard } from "./ProductTrendsCharts";
import { getProductTrends } from "@/lib/trends/productTrends";

// --- Mock Share of Voice (stubbed until social.posts wiring lands) ---
// Hardcoded pending real query against fashion_rag.social.posts grouped by brand_affinity.
const MOCK_SOV: { brand: string; mentions: number }[] = [
  { brand: "Sony", mentions: 4820 },
  { brand: "Canon", mentions: 3910 },
  { brand: "Nikon", mentions: 2740 },
  { brand: "Fujifilm", mentions: 1860 },
  { brand: "Panasonic", mentions: 940 },
  { brand: "Leica", mentions: 610 },
  { brand: "Sigma", mentions: 530 },
  { brand: "Tamron", mentions: 420 },
];

export async function ProductTrendsView() {
  const data = await getProductTrends();

  return (
    <div className="space-y-6">
      {/* Banner / data-source indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 text-sm">
        <div>
          <p className="font-semibold text-[#0f172a]">Product Trends</p>
          <p className="mt-0.5 text-xs text-[#64748b]">
            Real-time product insights across tracked retailers (cameras & lenses).
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            data.source === "arangodb"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {data.source === "arangodb" ? "Live data" : "Demo data"}
        </span>
      </div>

      {/* Top row — 2x2 grid of widgets */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stat: total products tracked */}
        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748b]">
            Products tracked
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-[#0f172a]">
            {data.totalProducts.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#64748b]">
            Across cameras, lenses & accessories — ArangoDB `products` collection
          </p>
        </section>

        {/* Stat: shop coverage */}
        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748b]">
            Multi-retailer SKUs
          </p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-[#0f172a]">
            {data.topByShopCount.length > 0
              ? `${data.topByShopCount[0]!.shopCount}`
              : "—"}
          </p>
          <p className="mt-1 text-xs text-[#64748b]">
            Max shops for a single SKU (top product below).
          </p>
        </section>

        {/* Top products table */}
        <section className="md:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#0f172a]">
              Top 10 products by shop coverage
            </h3>
            <span className="text-xs text-[#64748b]">
              Widest distribution = strongest pricing signal
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-[#64748b]">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 pr-3 font-medium">Brand</th>
                  <th className="py-2 pr-3 font-medium">Category</th>
                  <th className="py-2 pr-3 text-right font-medium">Shops</th>
                </tr>
              </thead>
              <tbody>
                {data.topByShopCount.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-[#64748b]">
                      No products available.
                    </td>
                  </tr>
                ) : (
                  data.topByShopCount.map((p, idx) => (
                    <tr
                      key={p.key}
                      className="border-b border-[#f1f5f9] transition-colors hover:bg-[#f8fafc]"
                    >
                      <td className="py-2 pr-3 text-[#64748b]">{idx + 1}</td>
                      <td className="py-2 pr-3 font-medium text-[#0f172a]">
                        <span className="block max-w-[380px] truncate">{p.title}</span>
                      </td>
                      <td className="py-2 pr-3 text-[#475569]">{p.brand ?? "—"}</td>
                      <td className="py-2 pr-3 text-[#475569]">{p.category ?? "—"}</td>
                      <td className="py-2 pr-3 text-right font-semibold tabular-nums text-[#0f172a]">
                        {p.shopCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Price history line chart */}
        <section className="md:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#0f172a]">
              Average product price — history
            </h3>
            <span className="text-xs text-[#64748b]">
              {data.priceHistory.length} points · Wayback + live snapshots
            </span>
          </div>
          <div className="mt-4 h-[240px]">
            <ProductPriceHistoryChart data={data.priceHistory} />
          </div>
        </section>

        {/* Brand sparklines */}
        <section className="md:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <h3 className="text-base font-semibold text-[#0f172a]">Top brands — price trend</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.brandSparklines.map((b) => (
              <BrandSparkCard key={b.brand} brand={b.brand} series={b.series} />
            ))}
          </div>
        </section>

        {/* Mock Share of Voice */}
        <section className="md:col-span-2 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#0f172a]">
              Share of voice — social mentions
            </h3>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Mocked
            </span>
          </div>
          <p className="mt-1 text-xs text-[#64748b]">
            Stub pending wiring to `fashion_rag.social.posts` grouped by `brand_affinity`.
          </p>
          <div className="mt-4 space-y-2">
            {MOCK_SOV.map((row) => {
              const max = MOCK_SOV[0]!.mentions;
              const pct = (row.mentions / max) * 100;
              return (
                <div key={row.brand} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm font-medium text-[#0f172a]">
                    {row.brand}
                  </span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                    <div
                      className="h-full rounded-full bg-[#2563eb]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs tabular-nums text-[#64748b]">
                    {row.mentions.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {data.error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Data source note: {data.error}
        </p>
      )}
    </div>
  );
}
