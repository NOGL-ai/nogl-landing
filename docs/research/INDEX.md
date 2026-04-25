# Research Index

## TL;DR

This folder is the version-controlled corpus of competitor, UX, market, and architectural research that informed the 27-metric ad-creative scoring system, the dashboard UX, the scraper stack, and the product positioning. Anything that shaped a non-trivial product decision lives here so devs and pilot stakeholders can find the receipts.

---

## Tier 1 — Per-metric competitor analyses (27 files)

Each file is a self-contained implementation brief covering: competitor table, algorithm, UI pattern, FastAPI schema, Next.js component, and failure modes. See [`competitors/README.md`](./competitors/README.md) for the source overview.

| #  | Metric                              | File                                                                                                          | Tier | Top competitor referenced |
|----|-------------------------------------|---------------------------------------------------------------------------------------------------------------|------|---------------------------|
| 01 | platform.format_adaptation          | [01_platform_format_adaptation.md](./competitors/01_platform_format_adaptation.md)                            | A    | Smartly.io                |
| 02 | platform.text_safe_zone             | [02_platform_text_safe_zone.md](./competitors/02_platform_text_safe_zone.md)                                  | A    | Meta / Celtra             |
| 03 | text.text_coverage                  | [03_text_text_coverage.md](./competitors/03_text_text_coverage.md)                                            | A    | Meta (≤20% rule)          |
| 04 | text.readability                    | [04_text_readability.md](./competitors/04_text_readability.md)                                                | A    | CreativeX                 |
| 05 | text.keyword_cta_presence           | [05_text_keyword_cta_presence.md](./competitors/05_text_keyword_cta_presence.md)                              | A    | AdCreative.ai             |
| 06 | cta.cta_presence                    | [06_cta_cta_presence.md](./competitors/06_cta_cta_presence.md)                                                | A    | Marpipe                   |
| 07 | cta.cta_positioning                 | [07_cta_cta_positioning.md](./competitors/07_cta_cta_positioning.md)                                          | A    | Smartly.io                |
| 08 | color.color_contrast                | [08_color_color_contrast.md](./competitors/08_color_color_contrast.md)                                        | A    | CreativeX                 |
| 09 | color.foreground_background_contrast| [09_color_foreground_background_contrast.md](./competitors/09_color_foreground_background_contrast.md)        | A    | VidMob                    |
| 10 | visual.negative_space               | [10_visual_negative_space.md](./competitors/10_visual_negative_space.md)                                      | A    | Marpipe                   |
| 11 | visual.main_subject_focus           | [11_visual_main_subject_focus.md](./competitors/11_visual_main_subject_focus.md)                              | A    | VidMob                    |
| 12 | faces.face_count                    | [12_faces_face_count.md](./competitors/12_faces_face_count.md)                                                | A    | VidMob                    |
| 13 | motion.cuts_per_minute              | [13_motion_cuts_per_minute.md](./competitors/13_motion_cuts_per_minute.md)                                    | A    | TikTok / VidMob           |
| 14 | motion.loopability                  | [14_motion_loopability.md](./competitors/14_motion_loopability.md)                                            | A    | Meta Reels best practices |
| 15 | motion.opening_intensity            | [15_motion_opening_intensity.md](./competitors/15_motion_opening_intensity.md)                                | A    | TikTok / Meta             |
| 16 | motion.animated_elements            | [16_motion_animated_elements.md](./competitors/16_motion_animated_elements.md)                                | A    | Smartly.io                |
| 17 | visual.rule_of_thirds               | [17_visual_rule_of_thirds.md](./competitors/17_visual_rule_of_thirds.md)                                      | B    | Celtra                    |
| 18 | visual.symmetry_balance             | [18_visual_symmetry_balance.md](./competitors/18_visual_symmetry_balance.md)                                  | B    | CreativeX                 |
| 19 | color.brand_ci_match                | [19_color_brand_ci_match.md](./competitors/19_color_brand_ci_match.md)                                        | B    | CreativeX                 |
| 20 | cta.logo_visibility                 | [20_cta_logo_visibility.md](./competitors/20_cta_logo_visibility.md)                                          | B    | CreativeX                 |
| 21 | text.dynamic_text_animation         | [21_text_dynamic_text_animation.md](./competitors/21_text_dynamic_text_animation.md)                          | B    | Smartly.io                |
| 22 | faces.emotion_strength              | [22_faces_emotion_strength.md](./competitors/22_faces_emotion_strength.md)                                    | B    | VidMob                    |
| 23 | faces.gaze_direction                | [23_faces_gaze_direction.md](./competitors/23_faces_gaze_direction.md)                                        | B    | VidMob                    |
| 24 | color.emotional_color_effect        | [24_color_emotional_color_effect.md](./competitors/24_color_emotional_color_effect.md)                        | C    | AdCreative.ai             |
| 25 | cta.distraction_avoidance           | [25_cta_distraction_avoidance.md](./competitors/25_cta_distraction_avoidance.md)                              | C    | CreativeX                 |
| 26 | faces.authenticity_pose_naturalness | [26_faces_authenticity_pose_naturalness.md](./competitors/26_faces_authenticity_pose_naturalness.md)          | C    | VidMob                    |
| 27 | platform.ugc_authenticity           | [27_platform_ugc_authenticity.md](./competitors/27_platform_ugc_authenticity.md)                              | C    | Meta / TikTok             |

> Tier mapping pulled from [`competitors/README.md`](./competitors/README.md). "Top competitor referenced" is a best-effort distillation from the source file's competitor table; verify in-file before quoting in pitches.

---

## Tier 2 — UX & dashboard strategy (6 files)

- [analytics-dashboards-strategy.md](./strategy/analytics-dashboards-strategy.md) — Particl 21-screenshot UX teardown; defines the analytics dashboard information architecture, KPI cards, and chart selection logic.
- [trends-strategy.md](./strategy/trends-strategy.md) — Product Trend UI strategy; how trend signals are surfaced, ranked, and made actionable in the operator UI.
- [marketing-assets-ctr-research.md](./strategy/marketing-assets-ctr-research.md) — CTR predictability research + DE-market baselines used to seed synthetic ground-truth formulas.
- [marketing-assets-ctr-expansion-analysis.md](./strategy/marketing-assets-ctr-expansion-analysis.md) — Follow-up expansion analysis on CTR research scope and metric coverage.
- [settings-notifications-profile.md](./strategy/settings-notifications-profile.md) — Settings, notifications, and profile UX patterns for the operator console.
- [trends-orchestration-options.md](./strategy/trends-orchestration-options.md) — Evaluation of orchestration platforms (Apify, Airflow, Temporal, BullMQ, SerpAPI) for scheduled trend scraping; recommendation and migration plan.

---

## Tier 3 — Product / competitor intelligence (4 files)

- [pricefy-features.md](./product-intel/pricefy-features.md) — Pricefy feature breakdown, pricing strategy, and integration surface.
- [pricefy-reverse-engineered.md](./product-intel/pricefy-reverse-engineered.md) — Reverse-engineered Pricefy internals — rule engine, simulator, and price-feed contracts.
- [demand-shaping-calumet-spec.md](./product-intel/demand-shaping-calumet-spec.md) — Calumet-specific market spec; demand shaping, competitor coverage, and pilot success metrics.
- [run-preview-example.md](./product-intel/run-preview-example.md) — Concrete walkthrough of the repricing "Run Preview" (dry-run) flow; benchmarks against Pricefy/Omnia/Prisync simulator UX.

---

## Tier 4 — Scrapers & data architecture (2 files)

- [marketing-asset-scrapers.md](./scrapers/marketing-asset-scrapers.md) — Scraper architecture for marketing-asset competitive intelligence; targets, schedules, dedup strategy.
- [scraper-architecture.md](./scrapers/scraper-architecture.md) — Cross-cutting scraper technical design — queue topology, browser fingerprinting, retry/backoff, storage contracts.

---

## Tier 5 — Internal / decisions (2 files)

- [import-data-strategy.md](./internal/import-data-strategy.md) — Data integration strategy for importing customer catalogs, competitor lists, and historical price/CTR data.
- [decisions-log.md](./internal/decisions-log.md) — Running log of product/architecture decisions with rationale and links back to the research that drove them.

---

## Maintenance

These docs were consolidated on **2026-04-25** from two sources:
1. The competitor analyses came from a sibling worktree of the `ad-creative-scorer` repo (`research/competitors/`).
2. The strategy / product-intel / scrapers / internal docs came from this repo's own gitignored `.claude/research/` folder.

Going forward, **future research artefacts should land directly in `docs/research/<tier>/`** rather than in `.claude/research/`, so they're version-controlled and discoverable without a separate consolidation pass. The `.claude/` folder remains gitignored and is fine for transient drafts and Claude session state, but anything you'd want a teammate or pilot stakeholder to see belongs here.

When adding a new file:
- Drop it in the most natural tier subfolder (or propose a new one).
- Add a one-line entry in the relevant tier section above with a relative link.
- If the file straddles categories, link it from secondary tiers but only physically place it in one.
