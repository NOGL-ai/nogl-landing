# Should `03-marketing-assets-expand.md` include a Creative Quality Score / CTR prediction?

_My honest assessment of the founder's question: "is it a good idea to expand with these [CTR/CQS] as I make the scraper?"_

**TL;DR — NO, not in v1. Keep the scrapers and the CTR-prediction strictly separate. Here's why.**

---

## The distinction that matters

Two completely different products sit behind this question:

| v1: Competitive Intelligence (what the scraper prompt is) | v2+: Creative Optimization Platform |
|---|---|
| "Show me what my competitors are running" | "Predict how well a creative will perform BEFORE I run it" |
| Gallery + filters + browse | Score + ranking + A/B suggestion |
| Particl, Panoramata, AdCreative Library | VidMob, AdCreative.ai, Pencil AI |
| 2-3 weeks to ship | 6-12 months (ML model + ongoing tuning) |
| No training data needed | Needs CTR ground truth — **doesn't exist publicly** |
| Calumet pricing managers want this | Calumet media buyers (if they exist) want this |

The founder's research confirmed **no public CTR dataset matched to camera/photography ads exists**. The proposed synthetic-ground-truth formula is mathematically sound but:

1. TabSyn-on-Criteo-electronics-cluster gives you **statistical distribution of clicks** in an anonymized e-commerce context — it cannot tell you whether THIS specific Canon R5 II ad on Foto Erhardt's Meta account will get a 0.8% or 1.4% CTR.
2. The VLM+German-transformer scores (`VQS`, `TAS`) are **aesthetic proxies**, not performance predictors. Literature-wide correlation between "human-judged attractiveness" and real CTR in e-commerce is **0.3-0.5 at best** (see CAIG paper §4.3 and AdTEC validation results).
3. Operators don't trust scores they can't validate. Without real CTR to compare against, a CQS score is a vibe check — which tools like AdCreative.ai ship and retail buyers mostly ignore.

## What the scraper can realistically expose without fake CTR

The Meta Ad Library + Apify actors still surface **engagement proxies you can observe directly** — these are honest signals:

| Proxy | What it tells you | Where it comes from |
|---|---|---|
| **Ad longevity** | "This ad has been running 47 days" | `ad_delivery_start_time` → now. Ads that keep running = advertiser thinks they work. |
| **Creative iteration rate** | "Foto Erhardt swapped creative 12× in last 30 days" | Count distinct `ad_archive_id`s per advertiser per window |
| **Repeat-campaign score** | "3 variants of 'Save on Canon bodies' this quarter" | NLP clustering on `ad_creative_body` |
| **Platform breadth** | "Running on FB + IG + Messenger" | `publisher_platforms` array |
| **Geographic breadth** | "Active in DE, AT, CH" | `delivery_by_region` |
| **Spend tier** (political only) | Lower/upper bound | `spend.lower_bound` / `spend.upper_bound` |
| **Format mix** | "65% video, 35% carousel" | `media_type` over time |
| **Aesthetic score (VLM)** | 0-10 pure visual quality | Qwen2-VL / LLaVA on downloaded creative |
| **Copy readability score** | Flesch-Kincaid, sentiment | German transformer on `ad_creative_body` |

**These are OBSERVED truths, not predicted.** The scraper prompt should surface them as filter/sort columns in the Asset Library. No CTR lies required.

## When CTR prediction becomes worth doing

It's worth doing when **at least two** of these are true:

1. Calumet has >12 months of their own daily Google Ads / Meta Ads reports connected via OAuth and piped into Postgres. (Real ground truth.)
2. The target customer persona is a media buyer running >€50k/mo in paid spend (not a pricing manager).
3. A customer explicitly requests it in a sales cycle and agrees to pay a premium for the feature.
4. The product's core CI value (scrapers, repricing, forecasting) is already stable and adopted.

Nothing in today's founder context suggests those conditions. Pricing managers don't think in CTR; they think in price gaps. Calumet the tenant buys competitive-intel because they're a pricing/assortment team.

## What to do with the founder's CTR research (don't throw it away)

Keep it for a future prompt `21-creative-quality-score.md`. The research will be correct in 12 months when the conditions above are met. The approach the founder sketched (TabSyn + VLM + German transformer + tanh-bounded projection) is genuinely state-of-the-art — it's just premature for a v1 CI tool.

Meanwhile, `03-marketing-assets-expand.md` will reference this research but explicitly cut CTR prediction from scope, using the engagement proxies above.

## Two-line recommendation

> **v1 (ship now):** scrape ads + emails + homepages + YouTube + TikTok, surface them in a gallery with 9 engagement-proxy columns derived directly from observed data. No CTR prediction.
>
> **v3 (12+ months out):** if Calumet connects their own Google Ads / Meta Ads reports AND a media-buyer persona emerges, build `21-creative-quality-score.md` using TabSyn + MLLM + real first-party data. Synthetic proxies only as a fallback for cold-start SKUs.

## Minor nit on the founder's synthetic-CTR formula

If/when you do build this, two corrections to apply:

1. The tanh bound `(1 + tanh(...))` makes `CTR_synth ∈ [0, 2 × CTR_base_DE]` — so `max ≈ 2.3%` not 3.0%. Fine as a floor but worth noting.
2. The formula treats α, β, γ as learned weights, but the paper's rigorous version (CAIG §3.2) also requires a **regret minimization term** that penalizes the model when its predicted CTR diverges from post-hoc observed CTR during RLHF. Without that, the formula will systematically over-predict (~15% bias per CAIG Table 4).

Both are solvable at implementation time — just flagging so they don't become blockers later.
