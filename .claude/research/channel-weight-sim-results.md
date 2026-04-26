# Channel Weight Simulation Results

Date: 2026-04-25
Script: .claude/research/channel-weight-sim.js

Simulates generate-history.ts Phase A channel-weight fix.
693 non-hero variants + 7 hero SKUs, 730 days, 6 channels, pure JS, no Postgres.

---

## Scenario A: 693 non-hero variants x 6 channels x 730 days

Total qty: ~674,000 (stable across 2 independent runs)

| Channel     | Qty        | Actual %  | Target %  | Delta     | Status |
|-------------|------------|-----------|-----------|-----------|--------|
| shopify     |     209,392 |    31.06% |    30.00% |    +1.06pp | PASS |
| offline     |     154,532 |    22.92% |    22.00% |    +0.92pp | PASS |
| b2b         |      97,004 |    14.39% |    18.00% |    -3.61pp | FAIL |
| amazon      |     104,378 |    15.48% |    15.00% |    +0.48pp | PASS |
| web         |      69,620 |    10.33% |    10.00% |    +0.33pp | PASS |
| marketplace |      39,298 |     5.83% |     5.00% |    +0.83pp | PASS |

## Scenario B: 700 variants including 7 heroes with preferred channels

Total qty: ~714,000 (stable)

| Channel     | Qty        | Actual %  | Target %  | Delta     | Status |
|-------------|------------|-----------|-----------|-----------|--------|
| shopify     |     223,142 |    31.25% |    30.00% |    +1.25pp | PASS |
| offline     |     162,180 |    22.71% |    22.00% |    +0.71pp | PASS |
| b2b         |     102,459 |    14.35% |    18.00% |    -3.65pp | FAIL |
| amazon      |     111,495 |    15.61% |    15.00% |    +0.61pp | PASS |
| web         |      73,692 |    10.32% |    10.00% |    +0.32pp | PASS |
| marketplace |      41,158 |     5.76% |     5.00% |    +0.76pp | PASS |

## Hero skew analysis (Scenario B vs A)

| Channel     | A share%  | B share%  | Skew (B-A) | Hero pref? |
|-------------|-----------|-----------|------------|------------|
| shopify     |    31.06% |    31.25% |    +0.190pp | yes (6) |
| offline     |    22.92% |    22.71% |    -0.210pp | yes (2) |
| b2b         |    14.39% |    14.35% |    -0.040pp | yes (3) |
| amazon      |    15.48% |    15.61% |    +0.132pp | yes (4) |
| web         |    10.33% |    10.32% |    -0.007pp | no |
| marketplace |     5.83% |     5.76% |    -0.065pp | yes (1) |

Hero skew is negligible (<0.2pp) -- 7 heroes are 1% of the catalog,
the prefBoost nudge is swamped by the 693 non-hero variants.

## Verdict

- (A) within +-2pp of target: FAIL
- (B) hero preferences cause expected skew: NO (within noise)

Phase A fix is: NEEDS ADJUSTMENT

---

## Root Cause Analysis

The b2b deficit (-3.6pp) is structural: weekdayFactor returns 0.2 for b2b on weekends.

Over 730 days: 208 weekend days (28.5%), 522 weekdays.
b2b effective multiplier = 0.714 * 1.0 + 0.286 * 0.2 = 0.7721

b2b effective weight = 0.18 * 0.7721 = 0.1390

After normalisation, b2b lands at 0.1390 / sum(eff_weights) ~ 14.4% instead of 18%.
Analytical prediction: 14.43%; simulation: 14.35-14.39%. Match within 0.1pp.

The Phase A normalised-weight formula (generate-history.ts lines 120-132) is correct:
it distributes lambda proportionally to CALUMET_CHANNEL_WEIGHTS.
But weekdayFactor is applied AFTER the normalised split, reducing b2b demand on
weekends without compensating other channels.

## Recommendation (choose one)

Option 1 - Compensated seed weight (simple, no logic change):
  Pass b2b weight = 0.18 / 0.7721 = 0.2331 in the ChannelContext passed to generateHistory.
  marketplace similarly needs weight = 0.05 / 1.0855 = 0.0461 to avoid over-counting.
  This means the seed entry point (ensureTenantAndChannels or the seed index) should
  compute compensated_weight = raw_weight / avg_weekday_factor before persisting.

Option 2 - Accept as realistic (no code change):
  B2B IS quieter on weekends in real retail. 14.4% realized share reflects actual
  calendar-day demand. The CALUMET_CHANNEL_WEIGHTS targets could be annotated as
  weekday-only guideline (not total-calendar-day targets).

  This is the lower-risk path -- no seed logic change required.

Option 3 - Remove b2b weekend suppression from quantity (complex):
  Move weekdayFactor application from quantity lambda to revenue calculation only.
  Keeps quantity distribution clean but changes data semantics.

Immediate recommendation: Option 2 (accept as realistic) unless the business
explicitly requires b2b to hit 18% of calendar-day quantity. If they do,
Option 1 with compensated_weight = raw / avg_wdf is the least invasive fix.