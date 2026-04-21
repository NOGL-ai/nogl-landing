# Pricefy Repricing — Public Feature Inventory

_Compiled by background research agent from public sources only. Any feature only visible behind login is tagged `(inferred)`._

## Sources

- [Pricefy home](https://www.pricefy.io/)
- [Dynamic Pricing](https://www.pricefy.io/features/dynamic-pricing)
- [Competitor Monitoring](https://www.pricefy.io/features/competitors-monitoring)
- [Alerts & Reports](https://www.pricefy.io/features/competitors-price-stock-alerts-reports)
- [Price Intelligence](https://www.pricefy.io/features/price-intelligence)
- [MAP/MSRP monitoring](https://www.pricefy.io/features/map-msrp-brand-monitoring)
- [Marketplace Competitors](https://www.pricefy.io/features/marketplace-competitors-analysis)
- [Pricing page](https://www.pricefy.io/pricing)
- [Help center](https://help.pricefy.io/), [API docs](https://pricefy.readme.io/)
- [Shopify App Store listing](https://apps.shopify.com/pricefy-io)
- [Pricefy blog — dynamic pricing](https://www.pricefy.io/articles/dynamic-pricing)
- Reviews: [SuperMonitoring](https://www.supermonitoring.com/blog/pricefy-optimizing-ecommerce-with-automated-price-monitoring/), [Fahim AI](https://www.fahimai.com/pricefy), [Gralio](https://market.gralio.ai/product/pricefy)
- Competitors: [Prisync rules](https://prisync.com/features/repricing-dynamic-pricing-rules/), [Omnia Pricing Strategy Tree](https://www.omniaretail.com/dynamic-pricing-software), [RepricerExpress rules](https://www.repricerexpress.com/pricing-rules-amazon-sellers/), [Repricer.com rule creation](https://support.repricer.com/creating-an-amazon-repricing-rule)

---

## 1. Rule types supported

- **Match / beat cheapest competitor** — match or undercut by fixed amount or percentage. Offset is absolute currency or percent.
- **Match / beat highest competitor** — for premium positioning.
- **Match market average** — stay within a configurable band of the average of a chosen competitor group.
- **Targeted-competitor rule** — scoped to a named subset (competitor groups/tags).
- **Margin-based (cost-plus)** — e.g. "never go below 15% margin". References product cost, enforces floor as `%` above cost or absolute.
- **Fixed floor / ceiling** — absolute min/max that wraps any rule.
- **Percent-above-cost floor** — `cost * (1 + margin%)`.
- **Autopilot (fully automated)** — Business+; reprices hourly, no human approval.
- **Semi-automated / simulator** — Pro tier; system suggests, human approves with one click.
- **MAP / MSRP enforcement** — Business+; alerts/blocks price changes that would violate a brand's Minimum Advertised Price.
- **Conditional / date-windowed rule** — "X% lower during crucial sales periods" (inferred).
- **Per-category / per-brand / per-SKU-list rule** — rules can be scoped by any filter set.

Example rule (paraphrased): _"Price 2% cheaper than the lowest competitor in group `EU-main`, never below cost +15%, never below €9.99, never above €49.99."_

## 2. Conditions / triggers

- Competitor price change (any, or above a `%` threshold)
- Competitor stock status (out-of-stock / restock as first-class triggers)
- New competitor appeared for a monitored SKU
- Scheduled cadence (hourly / daily / weekly / manual)
- Margin-floor breach (guardrail blocks change rather than executing)
- Product group filter (category, brand, SKU list, competitor group, domain TLD `.de`, `.com`)
- Marketplace filter (Amazon Buy Box, eBay, Google Shopping)

## 3. Actions

- **Set price** — push absolute price to connected store
- **Suggest price** — creates pending suggestion for human approval (semi-auto tier)
- **Reject / skip** — guardrail-triggered no-op
- **Rollback** — every repricing job snapshots prior prices; one-click restore
- **Send alert** — email, Slack, webhook, in-app
- **Generate scheduled report** — XLSX / CSV / PDF / XML by email or Slack
- **Pause rule** — toggle on rule card

No distinct "set discount %" action — Pricefy pushes absolute prices.

## 4. Execution model

- Autopilot runs **hourly**, unsupervised. Pulls latest competitor prices, evaluates rules, writes new prices.
- **Scheduled batch** is the norm. No sub-minute realtime.
- Scraping cadence: daily default, hourly for "high-priority" products (tier-gated).
- Rollback-on-every-job is the primary staleness safety net.
- Manual run / on-demand refresh per competitor or product group.

## 5. Rule authoring UX

- **Rule scope picker** — all products / category / brand / competitor group / saved SKU list
- **Strategy picker** — presets: _Cheaper than cheapest_, _Match cheapest_, _Cheaper than average_, _Match average_, _Higher than highest_, _Custom_
- **Offset field** — absolute (`-0.50`) or percent (`-2%`)
- **Guardrails** — min price, max price, min margin, max discount
- **Competitor selector** — multi-select with pre-defined groups
- **Simulator / preview** — before activation, recalculates catalogue vs. draft rule and shows projected new price, delta, new market position. Approve/reject per row (Pro) or flip Autopilot on (Business+)
- **Activate / Pause toggle** on rule card
- **Rollback button** restores last job's prices

## 6. History & reporting

- Price history chart (my price vs. competitors over days/weeks/months)
- Position indicator (`cheaper / aligned / more expensive`)
- Competitive gap report (gap vs. min / avg / max of competitor set)
- Catalogue dashboard (% cheapest / aligned / above market)
- Stock timeline (competitor OOS/restock overlaid on price chart)
- Shipping / landed-price comparison
- Report scheduling (daily / weekly / monthly / ad-hoc) to email or Slack (XLSX / CSV / PDF / XML)

## 7. Integrations

- E-commerce: Shopify (Built-for-Shopify), WooCommerce, Magento, BigCommerce, PrestaShop, Wix, Squarespace, Lightspeed
- Feed/aggregator: Google Shopping, Channable
- Marketplaces monitored (read-only): Amazon, eBay, Google Shopping
- Custom/ERP: webhooks, CSV import/export, REST API
- API endpoints: Products, Competitors, Monitored URLs, Repricing rules, Alerts, Reports

## 8. Notifications

- Channels: email (instant or digest), Slack (channel routing), in-app feed, webhooks
- Event types: price change (any or >threshold), stock in/out, new competitor, MAP violation, scheduled report ready
- Frequency: instant, daily, weekly, custom
- In-app grouping: by competitor, product, or rule

## 9. Plan tiers

| Plan | Monthly | SKUs | Repricing |
|---|---|---|---|
| Free | $0 | 50 | Monitoring only, 5 competitors, daily |
| Starter | $49 | 100 | Alerts + reports. **No repricing.** |
| Pro | $99 | 2,000 | **Dynamic Repricing (simulator/suggestions)** |
| Business | $189 | 15,000 | **Autopilot** + **MAP/MSRP** |
| Enterprise | $499 | 25,000 | Everything + dedicated support |

## 10. UI patterns worth copying

- **Dashboard tiles** — cheaper / aligned / more-expensive counts with sparklines
- **Automatch modal** — 1-click matching with confidence score per row
- **Rule cards** — one per rule, status badge (Active / Paused / Draft), SKU count, last-run timestamp
- **Simulator table** — SKU | current | competitor min | suggested | delta | accept/reject
- **Schedule picker** — hourly / daily / weekly / manual, per competitor or per rule
- **Empty state** — "Add your first competitor" with URL field + marketplace chip row
- **Price-history chart** — overlayed lines, hover tooltip showing each competitor at that timestamp
- **Alert feed** — grouped by event type, rows link to triggering product

---

## Competitor contrasts

### Prisync
- **Multiple-rule compare mode** — up to 5 rules compared simultaneously per product; engine picks the winning suggestion
- Same rule primitives as Pricefy

### Omnia Retail
- **Pricing Strategy Tree™** — visual decision-tree builder vs. Pricefy's flat cards. Strongest UX differentiator worth considering
- **"Show Me Why" explainability** — audit trail of which branch fired, expected impact
- **Security rules layer** — separate guardrails that filter every change
- **Date-windowed promotional rules** first-class

### RepricerExpress / Repricer.com
- Amazon-Buy-Box focus: rule conditions include "when I am the Buy Box winner", seller-feedback-count threshold, seller location, dispatch time, item-condition match
- **Basic vs. Advanced rule tabs** — progressive disclosure pattern
- **Beat-by amount / percent** primitive identical to Pricefy's offset

---

## Build-spec takeaways for the Next.js clone

1. **Rule shape**: `{ scope, strategy, offset, guardrails[], schedule, status }` — maps cleanly to Prisma.
2. **Strategy enum**: `MATCH_CHEAPEST | BEAT_CHEAPEST | MATCH_AVG | BEAT_AVG | MATCH_HIGHEST | CUSTOM`
3. **Guardrail types**: `ABS_MIN`, `ABS_MAX`, `MARGIN_MIN_PCT_OF_COST`, `MAX_DISCOUNT_PCT`
4. **Schedule**: cron-like (`hourly`, `daily`, `weekly`, `manual`), tier-gated
5. **Actions**: `APPLY`, `SUGGEST`, `SKIP`, `ROLLBACK`, `NOTIFY`
6. Every run writes an immutable `RepricingJob` row with `previousPriceSnapshot` for rollback
7. Notifications: reuse a generic `AlertRule` table (channel + condition) for price-change alerts AND MAP violations
8. UX: prefer Omnia's tree model for complex compositions; Pricefy's flat cards ship faster
9. Tier gating: monitoring-only (free), suggestions (mid), autopilot + MAP (top self-serve)
10. Always show a simulator diff table before activation — highest-trust feature across all competitors
