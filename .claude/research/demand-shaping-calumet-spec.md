# Demand Shaping — Feature Spec for Calumet Photographic (NOGL)

_Compiled by background research agent. Covers exec summary → drivers → UX → bundling → attribution → MVP scope → build notes → open questions for the founder._

---

## 1. Executive summary

For a mid-market German photo/camera retailer like Calumet Photographic, "demand planning" predicts the next 8–26 weeks of unit sell-through given history and seasonality. **Demand *shaping* is the inverse problem**: given a future the operator doesn't like (too much stock of Sony A7IV, not enough Godox lights for Black Friday, flat margin on Manfrotto tripods), what levers can they pull **now** to bend the forecast curve to a target — more revenue, cleaner inventory, better margin, less working capital tied up? Pricefy, Relex, o9 and Blue Yonder all frame this the same way: the plan is an input, the shape is the output.

For Calumet specifically — ~15k SKUs, 60% web / 30% marketplace / 10% B2B, a category mix where a €3,500 camera body drags a €180 tripod and a €90 memory card through checkout — the three threads the founder mentioned (**pricing/promo, bundling, marketing attribution**) are not three features. They are **three input surfaces onto one shared forecast object**. Pricing changes unit economics per SKU; bundling changes *which* SKUs sell together and at what blended margin; paid-media spend changes the traffic funnel that feeds both. All three land in the same place: a revised `forecast(variant × channel × day × quantile)`.

**Recommended architecture: one unified Demand Shaping workspace with a hybrid UX** — a driver-based slider simulator for quick what-ifs (Causal.app / Pigment style) plus a lightweight scenario tree to save, name, and compare the runs worth committing (Anaplan / Pigment style). Bundling and marketing attribution are not sibling features; they are **specialized drivers** inside the same simulator. Ship pricing + promo + inventory drivers first, bundle composition next, marketing attribution last (highest data-integration cost, lowest confidence at Calumet's size).

---

## 2. The drivers that matter for a photo retailer

Grouped by family. Each: *what it does*, *simple model*, *data source*, *confidence at Calumet scale*.

### Pricing family

**1. Price change %** — absolute list-price move on one SKU or a category.
- *Model:* `units_new = units_base × (new_price / old_price) ^ (−elasticity)`. Start with category-level elasticities: cameras −0.8 to −1.2 (big-ticket, researched), accessories −1.5 to −2.2 (commoditized, price-shopped), lenses −0.6 to −0.9 (brand-locked). Refine per-SKU only once ≥12 price changes in history.
- *Data:* own transaction history + NOGL's existing competitor price feed.
- *Confidence:* high for category, medium per-SKU.

**2. Competitor price gap** — "match Foto Erhardt within 2%", "stay €50 below MediaMarkt on Sony bodies".
- *Model:* rule-based repricing with min-margin guard. Demand response via logit share: `share = exp(−β × price_rank) / Σ exp(−β × price_rank)` across tracked comp set.
- *Data:* NOGL's existing competitor crawler → `PriceObservation`.
- *Confidence:* high — this is literally what NOGL was built for.

### Promo family

**3. Promo discount %** — time-boxed price reduction (Black Friday, Photokina week, clearance).
- *Model:* elasticity + **promo lift multiplier** (1.3–3.5× by category and depth). Subtract pull-forward: 20–35% of promo units are borrowed from the 4 weeks after.
- *Data:* historical promo calendar → baseline vs. actual uplift.
- *Confidence:* medium — photo retail has thinner promo cadence than grocery, so multipliers are noisier.

**4. Promo mechanic** — %-off vs. €-off vs. bundle-discount vs. BOGO vs. free accessory.
- *Model:* different mechanics have different perceived value at the same margin cost. In photo retail, **free accessory with body** historically outperforms equivalent %-off on the body.
- *Data:* promo outcome table with mechanic as a categorical feature.
- *Confidence:* low initially; medium after 6+ months of consistent logging.

### Assortment / bundle family

**5. Bundle composition** — which SKUs sit inside a named bundle, and the bundle list price.
- *Model:* treat the bundle as a pseudo-SKU with its own demand curve. Unbundled sales of components get a **cannibalization factor** (typically 0.2–0.4). Cross-elasticity between bundle and components is the real modelling difficulty — see §4.
- *Data:* order-line table + current bundle definitions.
- *Confidence:* medium.

**6. Assortment toggle** — add / drop a SKU from the sellable catalog for a scenario.
- *Model:* redistribute demand to substitutes using a **substitution matrix** derived from category + brand + price-tier proximity. Drop the Sony A7IV kit → ~55% shifts to A7III / A7CII, ~15% to Canon R6 II, ~30% lost to competitors.
- *Data:* product catalog + co-purchase / substitute graph (see §4).
- *Confidence:* medium.

### Marketing family

**7. Paid-media spend per channel** — €/day on Google Ads, Meta, Idealo/Geizhals CPC, newsletter sends.
- *Model:* saturation curve per channel (Hill / Adstock). `lift = α × (spend^γ) / (spend^γ + κ^γ)`. Google Shopping saturates fast for camera queries; Meta saturates later but has higher diminishing returns on high-ASP gear.
- *Data:* Google Ads API, Meta Marketing API, GA4 (see §5).
- *Confidence:* low at this data volume — the most-often-wrong driver in tools like Triple Whale and Northbeam for sub-$50M retailers.

**8. Attribution model toggle** — last-click / position-based / time-decay / data-driven for the same scenario to see how channel contribution changes.
- *Model:* post-hoc reallocation of revenue across touchpoints. A **confidence selector** on driver #7, not a demand driver itself.
- *Data:* GA4 attribution API or internal touchpoint log.
- *Confidence:* model choice is low; exposing the toggle is cheap and educates the operator.

### External / constraint family

**9. Season / weather / event overlay** — Photokina, IFA, school-start, wedding season (Apr–Sep drives lens + lighting), Christmas (bodies + gift SKUs).
- *Model:* additive seasonal index on top of baseline forecast, already present in most quantile forecasters. Expose as a **read-only driver** the operator can override for a specific week.
- *Data:* event calendar + historical seasonal decomposition.
- *Confidence:* high for recurring events.

**10. Inventory / supply constraint** — "we can only get 40 Canon R5 II units by week 32".
- *Model:* hard cap on the forecast: `sellable = min(demand, on_hand + inbound_PO)`. Surfaces **lost demand** as a separate line.
- *Data:* existing `/en/replenishment` PO pipeline + stock table.
- *Confidence:* high — a constraint, not a prediction.

**11. Return rate** — photo gear has real returns (8–15% consumer cameras, up to 25% lighting/studio via B2B).
- *Model:* shrink revenue and re-add units to available stock after a return-lag distribution.
- *Data:* returns table.
- *Confidence:* high.

**12. Channel mix shift** — "push 10% of Amazon demand to own-store via lower own-store price".
- *Model:* channel-level price gap → share shift, bounded by channel-specific elasticity (marketplaces more price-elastic than own-store for the same SKU).
- *Data:* own orders by channel.
- *Confidence:* medium.

**Recommendation:** ship drivers 1, 3, 5, 9, 10 in the MVP. Add 2, 6, 11 in v2. Defer 4, 7, 8, 12 until after first-tenant feedback.

---

## 3. UX recommendation — hybrid simulator + scenario tree

### What the benchmarks do

- **Causal.app** — variables in a directed graph, sliders left, live-recomputing charts right. Every variable has a base value, a distribution, downstream dependencies. Gold-standard for "feel".
- **Pigment** — enterprise scenario workspace. Create a named scenario, fork, edit drivers, commit. Side-by-side compare view is the killer screen.
- **Finmark / Mosaic / Cube** — driver-based finance models; less relevant UX for retail demand but strong on "what changed since last save" diffs.
- **Jedox / o9 / Blue Yonder / Relex** — enterprise demand: tree of plans + promo calendar + **lift-decomposition waterfall**, the single most useful retail visual.
- **Netstock / Streamline / Inventory Planner** — SMB; almost no shaping, mostly replenishment. Lose on shaping, win on onboarding speed. Lesson: defaults must be sane on day one.

### Concrete recommendation: **hybrid**

Two surfaces, same underlying model.

**Surface A — Simulator (default at `/en/demand/shape`)**

```
┌──────────────────────────────────────────────────────────────────────┐
│ Scope: [Category: Cameras ▾] [Channel: Web ▾] [Horizon: 12w ▾]        │
├──────────────────────────────┬───────────────────────────────────────┤
│ DRIVERS                      │ OUTCOME                                │
│                              │                                        │
│ Pricing                      │  Units / Revenue / Margin  (tabs)      │
│  ├ Price change  [──●──] +0% │  ┌──────────────────────────────────┐  │
│  └ Comp gap      [●────] −2% │  │  baseline ─────────              │  │
│                              │  │  scenario ━━━━━━━                │  │
│ Promo                        │  │                                   │  │
│  ├ Discount %    [──●──] 15% │  └──────────────────────────────────┘  │
│  └ Window        [Jul 15–21] │                                        │
│                              │  KPI strip:                            │
│ Assortment                   │   Δ Units   +842    (+6.1%)            │
│  └ Bundle: A7IV kit  [ON]    │   Δ Revenue €184k   (+4.8%)            │
│                              │   Δ Margin  €21k    (+2.1%)            │
│ Supply                       │   Working capital  +€47k               │
│  └ Cap: Canon R5II  40 units │   Stockout risk    3 SKUs red          │
│                              │                                        │
│ [Reset]  [Save as scenario]  │  Waterfall:                            │
│                              │  base → +promo → −cannib → +traffic…   │
└──────────────────────────────┴───────────────────────────────────────┘
```

Sliders recompute debounced (300ms) against a cached elasticity model so the chart feels "live". The **waterfall** is the single most important element — decomposes the delta into driver contributions so the operator *learns* which lever actually moved the needle.

**Surface B — Scenarios (`/en/demand/shape/scenarios`)**
A table: Name, Owner, Horizon, Δ Revenue, Δ Margin, Δ Working capital, Status (draft / committed / expired). Click one → compare against baseline or another scenario side-by-side, Pigment-style. "Commit" writes the scenario's driver overrides back into the live forecast for the scoped variants × channels × horizon.

### Why hybrid beats the alternatives

- **Pure sliders** (Causal) feel great in a demo but operators lose their work. Retail pricing managers do 20–50 what-ifs per week; without save/name/compare they live in screenshots.
- **Pure scenario tree** (Anaplan / o9) is accurate but demands 15-minute setup per run. Too heavy for "should I promote the A7IV this weekend?".
- **Step wizard** is good for onboarding but infantilizing for power users after week two.

**Dependencies between drivers** need explicit handling: when price changes, the promo slider should show its effect *relative to the new price*, and the bundle driver should recompute blended margin. Causal uses a DAG; a pragmatic v1 is a topological recompute order hard-coded in the server action: `price → promo → bundle → assortment → constraints → channel mix`.

---

## 4. Bundles as first-class demand objects

Photo retail is the textbook bundling category: the camera body is the anchor, and the attach rate of lens/bag/card/tripod/warranty is how the margin gets made. Treat bundles as peers of SKUs in the demand model, not as a discount decoration.

### Data model

```
Bundle {
  id, name, anchorVariantId, status, startsAt, endsAt
  listPrice, bundleDiscount           // blended price
  components: BundleComponent[]       // variantId, quantity, role (anchor|core|accessory)
  forecastSeries                      // its own quantile forecast
}
```

A bundle has its own `forecast(bundle × channel × day)` exactly like a variant. Component SKUs carry **two** demand streams: unbundled + via-bundle. Selling a bundle decrements component inventory.

### Cannibalization / cross-price elasticity

When a bundle launches below `Σ component prices`, unbundled demand for the anchor component drops. Classical model: **nested logit** between "buy anchor alone", "buy anchor in bundle", "buy nothing" with bundle-discount % as main price term. For MVP skip nested logit and use:

> `unbundled_units = base_unbundled × (1 − cannib_rate)` where `cannib_rate ∈ [0.2, 0.4]` per category, tunable in admin.

Surface the rate as an operator-editable slider so they can sanity-check it. Defensible, explainable, good enough until 6–12 months of comparative data.

### Bundle discovery via association rules

For "should we build a new bundle?", mine order-lines with **FP-growth** (faster and less memory than Apriori on 15k SKUs × millions of lines). Surface rules as `{A7IV body} → {Sony 24-70 GM II}` with support, confidence, lift. Lift > 3 and support > 0.5% is a reasonable cutoff at this catalogue size. Amazon's "frequently bought together" uses a cousin of this.

Run FP-growth nightly as a scheduled job, write rules to a `BundleCandidate` table, show them in an **"Opportunities" tab** ranked by projected incremental margin.

### Rebundling based on sell-through

Every bundle gets a rolling 28-day **component sell-through contribution** — for each component, what % of bundle sales it's present in, and its margin contribution. Underperformers (contribution < 10% AND lift < 1.2) get flagged for swap. Candidate replacements come from the same category + price tier + an association-rule filter. Operator confirms; system creates a v2 bundle and A/B-tests for 14 days.

---

## 5. Marketing attribution — realistic minimum

**Honest answer for Calumet's size:** full MMM (Robyn, Meridian) is a 6-month data-science project. At ~€30–80M revenue with ~€50k–150k monthly paid media, Bayesian MMM is underpowered — not enough weekly observations per channel to fit saturation curves with meaningful credible intervals.

### Recommended stack for MVP

1. **Last-non-direct-click** as default, from **GA4 attribution data** via the Data API. It's what operators already reason about.
2. **Platform-reported ROAS** from Google Ads API + Meta Marketing API as a sanity check per channel (known to over-count via view-through — show with a caveat badge).
3. **Simple time-decay model** computed server-side on internal `Touchpoint` events (email click, direct, organic, paid) with a 7-day half-life, as an internal second opinion.
4. Expose the **attribution choice as a toggle** on the simulator so the operator sees their marketing driver under three lenses — last-click, platform, time-decay — and the honest disagreement between them.

**Defer full MMM (Robyn / Meridian)** to v3, and only build it if a tenant has >€5M/year in paid spend and >18 months of daily data. Below that line, last-click + platform ROAS + time-decay is the realistic ceiling.

### Data sources (all have stable APIs)

- [GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1) — sessions, channel, conversions by source/medium.
- [Google Ads API](https://developers.google.com/google-ads/api/docs/start) — spend, impressions, clicks, conversions per campaign/ad-group.
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/) — spend + conversions per ad set.
- Optional: [Klaviyo](https://developers.klaviyo.com/en) for email → revenue.
- Optional: Idealo / Geizhals feeds for DE/AT price-comparison attribution (Calumet-relevant).

### How it plugs into the simulator

Driver #7 "Paid-media spend" gets one slider per channel with current saturation curve shown as a sparkline next to it. When the operator drags it, the simulator:

1. Applies the channel's saturation curve to translate € → incremental sessions.
2. Multiplies by channel-weighted conversion rate from GA4.
3. Distributes incremental orders across SKU-mix using the last 30 days' channel-to-SKU distribution.
4. Feeds the result into the baseline forecast as traffic uplift.

Wrap every marketing driver's output in a **confidence band** (wider than other drivers) so operators don't mistake a guess for a forecast.

---

## 6. MVP scope — ruthlessly cut

**Ship (week 1–6):**
- `/en/demand/shape` page with simulator shell.
- Drivers: price change %, promo discount % + window, bundle on/off, inventory cap, season/event overlay (read-only).
- Scope selector: category + channel + horizon (4 / 8 / 12 / 26 weeks).
- Output: units / revenue / margin chart with baseline vs. scenario overlay, KPI strip, waterfall decomposition.
- Save-scenario + scenarios list page. Name, owner, expiry.
- "Commit scenario" writes overrides into the existing forecast store for the scoped variants × channels × horizon.

**Ship next (week 7–12):**
- Competitor price-gap driver (leverages existing scraper).
- Bundle composition editor + BundleCandidate "Opportunities" tab with FP-growth output.
- Return-rate driver.
- Side-by-side scenario compare view.

**Defer to v3:**
- Paid-media spend driver (needs Ads/GA4 integration — big).
- Attribution-model toggle.
- Channel-mix shift driver.
- Promo-mechanic differentiation.
- Full MMM.

**Cut for now:**
- Nested-logit cannibalization.
- Multi-tenant bundle-template marketplace.
- Auto-commit scenarios on schedule.

---

## 7. Build notes (integration with existing repo)

### Prisma models to add

```
ShapingScenario {
  id, tenantId, name, description, ownerId
  scopeCategories, scopeChannels, horizonWeeks
  createdAt, status (draft|committed|expired), expiresAt
  driverOverrides  Json   // { priceChangePct, promoDiscountPct, promoWindow, bundleIds[], inventoryCaps[], ... }
  resultSummary    Json   // { dUnits, dRevenue, dMargin, dWorkingCapital, stockoutSkus }
}

Bundle {
  id, tenantId, name, anchorVariantId, status, startsAt, endsAt
  listPrice, bundleDiscount
  components  BundleComponent[]
}

BundleComponent {
  id, bundleId, variantId, quantity, role   // anchor | core | accessory
}

BundleCandidate {          // FP-growth output
  id, tenantId, anchorVariantId, componentVariantIds[]
  support, confidence, lift
  projectedIncrementalMargin
  status   // new | accepted | dismissed
  discoveredAt
}

Elasticity {               // per-category (v1) or per-SKU (v2)
  id, tenantId, scope (category|variant), scopeId
  value, lastFittedAt, rSquared, observationCount
}
```

### Server actions (in `src/app/actions/shaping/`)

- `runShapingSimulation(scopeFilter, driverInputs) → { baseline, scenario, waterfall, kpis }` — pure function, no writes. Called on slider debounce.
- `saveScenario(input)` / `listScenarios()` / `compareScenarios(id1, id2)` / `commitScenario(id)`.
- `discoverBundleCandidates()` — nightly cron, FP-growth on `OrderLine`.
- `swapBundleComponent(bundleId, oldVariantId, newVariantId)` — creates v2 bundle and an A/B flag.

### Charts (Recharts, consistent with existing `/en/demand`)

- **Line overlay**: baseline (dashed) vs. scenario (solid) with quantile ribbon p10–p90.
- **Waterfall**: horizontal bar, each driver's contribution to Δ revenue / Δ margin.
- **KPI strip**: number cards with small sparklines.
- **Bundle sunburst** (v2): one ring per bundle, slices = component contribution to bundle margin.

### Integration with existing `/en/demand`

- `/en/demand` (existing forecast view) gets a "Shape this forecast" CTA that deep-links to `/en/demand/shape` with scope pre-filled.
- Committed scenarios appear as a **badge** on the forecast chart with a "scenario active until {expiresAt}" banner.
- The current empty-state on `/en/demand` becomes an opportunity: show 2–3 suggested scenarios (from `BundleCandidate` or heuristics like "A7IV stock > 2× forecast, try a 10% promo") so the page is useful from day one.

---

## 8. Open questions for the founder

1. **Primary persona & their week.** Pricing manager (daily reprice decisions, high-frequency simulator) or category manager (weekly assortment + promo planning, scenario tree)? Weighting between Surface A and Surface B depends on this.
2. **Commit semantics.** When "commit" a scenario, does that override the live forecast everyone sees, or is it advisory / read-only until a separate approval? Affects permissions + audit model.
3. **Elasticity source of truth.** Does Calumet have 18+ months of clean price-change history, or bootstrap with literature defaults per category? If latter, we must be explicit about the confidence band.
4. **Bundle definitions today.** Are Calumet's existing bundles managed in Shopify / a PIM / a spreadsheet / free-text product descriptions? Decides whether our Bundle model is the system of record or a mirror.
5. **Competitor set.** Which 4–8 competitors are the real reference for repricing (Foto Erhardt, MediaMarkt, Saturn, Amazon.de, Fotokoch, Fotoimpex, B&H for pro)? The comp-gap driver needs this list pinned down.
6. **Marketing data access.** Does Calumet have a BI warehouse (BigQuery / Snowflake / Postgres replica) aggregating GA4 + Ads + Meta, or are we reading APIs directly? Strong argument to defer driver #7 until this is clear.
7. **Tenant isolation.** Are elasticity values and bundle-candidate thresholds tenant-specific from day one, or start global and shard later?
8. **Risk tolerance for auto-apply.** Autonomous mode under a guardrail (max daily Δ price, max promo depth), or strictly human-in-the-loop for v1? Affects whether `commitScenario` needs secondary approval.

---

## Sources (selected)

- [Causal.app](https://www.causal.app/) · [Pigment](https://www.pigment.com/) · [Finmark](https://finmark.com/) · [Mosaic](https://www.mosaic.tech/) · [Jedox](https://www.jedox.com/) · [Cube Planning](https://www.cubeplanning.com/)
- [o9 demand planning](https://o9solutions.com/platform/demand-planning/) · [Relex promotion management](https://www.relexsolutions.com/solutions/promotion-management/) · [Blue Yonder](https://blueyonder.com/solutions/demand-planning)
- [Netstock](https://www.netstock.com/) · [Streamline](https://gmdhsoftware.com/) · [Inventory Planner](https://www.inventoryplanner.com/) · [Shopify Bundles apps](https://apps.shopify.com/browse/bundles) · [Fast Simon](https://www.fastsimon.com/)
- [Triple Whale](https://www.triplewhale.com/) · [Rockerbox](https://www.rockerbox.com/) · [Northbeam](https://www.northbeam.io/) · [Recast](https://getrecast.com/)
- [Meta Robyn MMM](https://facebookexperimental.github.io/Robyn/) · [Google Meridian MMM](https://developers.google.com/meridian)
- [Association rule learning](https://en.wikipedia.org/wiki/Association_rule_learning)
- [GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1) · [Google Ads API](https://developers.google.com/google-ads/api/docs/start) · [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/)
