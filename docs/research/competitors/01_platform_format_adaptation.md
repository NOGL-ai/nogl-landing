# 01 — Platform Format Adaptation

> **Criterion slug:** `platform__format_adaptation`
> **Definition:** Aspect-ratio compliance — does the creative match the target platform's required dimensions (9:16 for Stories/Reels/TikTok, 1:1 for Feed, 4:5 for optimised Feed, 16:9 for YouTube pre-roll, 1.91:1 for Facebook link ads)?

---

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Meta | Ads Manager — Creative Hub / Asset Customisation | https://www.facebook.com/business/help/682655495435254 | Self-serve ad platform |
| Google | Google Ads — Asset Library, Video builder | https://support.google.com/google-ads/answer/6167118 | Self-serve ad platform |
| Smartly.io | Image & Video Templates / AI Studio | https://www.smartly.io/product-features/image-and-video-templates | Creative automation |
| Celtra | Creative Management Platform — Spec Validator | https://support.celtra.com/build-creatives/builder/display-creatives/recommended-asset-specifications | CMP |
| Flashtalking (Innovid) | Ad Serving Platform — Format Library | https://support.flashtalking.com/hc/en-us | Ad server |
| Marpipe | Multivariate testing — Aspect Ratio Glossary | https://www.marpipe.com/ad-glossary/aspect-ratio-safe-zones-by-platform | Creative testing |
| AdCreative.ai | Creative Generator — Format Compliance Pre-check | https://www.adcreative.ai/ | AI creative generator |
| VidMob | Scoring — Asset Formatting Guideline | https://vidmob.com/scoring-2 | Creative analytics |
| CreativeX | Creative Quality Score — Digital Suitability Fundamentals | https://www.creativex.com/products/creative-quality | Creative quality |

---

## How they implement it

### Algorithm / model family
- **Rule-based ratio arithmetic.** All known implementations derive the ratio as `width / height` (float, rounded to 2 dp) and compare it against a per-placement lookup table. No ML is involved at the detection stage.
- **Tolerance band:** Meta's own guidance allows ±2% deviation before triggering auto-crop. Celtra's spec validator flags assets outside a ±1% band with a hard warning.
- **Smartly.io AI Studio** adds a second layer: after ratio compliance it uses a CNN-based saliency model to predict whether auto-cropping will cut off the focal subject; it surfaces a warning overlay in the UI when the focal point is within the crop-risk zone.
- **VidMob** maps each submitted asset to platform + placement metadata and runs a PASS/FAIL check against its Guideline Management rules; the scoring weight for format compliance is configurable per brand.

### Metric shape
| Shape | Detail |
|---|---|
| Binary PASS/FAIL | Celtra, Flashtalking, VidMob (per-guideline) |
| Exact ratio value | Marpipe glossary, Meta Creative Hub (displays detected ratio in upload UI) |
| Normalised 0–1 compliance score | Smartly.io Creative Predictive Potential (format is one sub-dimension) |
| Tiered label | Meta internally: "Optimal / Acceptable / Cropped / Not Supported" |

Recommended output for our stack: a float `[0.0, 1.0]` where 1.0 = exact match to the target placement, 0.0 = completely unsupported ratio, with an enum `compliance_tier` (optimal / acceptable / cropped / unsupported).

### UI pattern
- **Meta Creative Hub:** shows detected image dimensions and ratio next to the upload thumbnail; a yellow caution banner appears if the ratio will trigger auto-crop; no numeric score is displayed.
- **Smartly.io:** side-by-side "format preview" panel shows the creative inside a platform frame silhouette; areas outside the safe frame are greyed out.
- **VidMob Scoring dashboard:** each asset row shows a green tick / red cross per guideline; the format compliance row includes the detected ratio string (e.g., "1.78:1 — expected 1:1").
- **Celtra Builder:** inline yellow / red border on the canvas when the canvas size deviates from recommended specs; a tooltip shows "Recommended: 1080×1920 (9:16)".

### Public screenshots / demos
- Meta Ads Manager upload flow (aspect ratio warning): https://www.facebook.com/business/help/682655495435254
- Marpipe aspect ratio glossary with diagrams: https://www.marpipe.com/ad-glossary/aspect-ratio-safe-zones-by-platform
- Smartly templates product page (format preview screenshot): https://www.smartly.io/product-features/image-and-video-templates
- VidMob scoring layout screenshot: https://help.vidmob.com/en/articles/9786886-layout-of-the-creative-scoring-for-inflight-media

---

## Help articles & source material

- Meta — Aspect Ratios Supported by Placements: https://www.facebook.com/business/help/682655495435254
- Meta — All 25 placements mapping: https://ppc.land/metas-complex-aspect-ratio-requirements-span-25-ad-placements/
- Jon Loomer — Recommended Ratios By Placement (detailed breakdown): https://www.jonloomer.com/recommended-aspect-ratios-by-placement-for-meta-ad-creative/
- AdsUploader — Meta Ads Size Guide 2026: https://adsuploader.com/blog/meta-ads-size
- TikTok ad specs (9:16 requirement, min 540×960): https://www.triplewhale.com/blog/tiktok-ad-spec
- Sprout Social — Social Media Video Specs (all platforms, updated): https://sproutsocial.com/insights/social-media-video-specs-guide/
- Celtra — Recommended Asset Specifications: https://support.celtra.com/build-creatives/builder/display-creatives/recommended-asset-specifications
- VidMob — Scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- QuickFrame — Social Media Video Ad Specs & Placements Guide 2025: https://quickframe.mountain.com/blog/social-media-video-ad-specs-placements-guide/

---

## Pros / cons / flaws

### What competitors do well
- Meta's upload UI catches ratio mismatches instantly at asset ingestion, preventing wasted spend before the ad even goes live.
- VidMob's configurable guideline system lets enterprise brands define custom "acceptable" ratio ranges per placement, covering edge cases like LinkedIn documents (1:1.294) or Pinterest (2:3).
- Smartly.io combines ratio check with saliency — flagging not just whether the ratio is wrong, but whether the focal subject survives the crop.

### Where they fall short
- Most tools check static width × height at upload time; none re-check rendered dimensions after dynamic creative assembly (DCO) where a template might stretch assets at serve time.
- Celtra's spec validator only runs at build time in the CMP; once exported to a third-party ad server, no re-validation occurs.
- None of the surveyed tools express format compliance as a continuous score — they produce binary flags, which makes it impossible to rank a portfolio of creatives by "how close" each is to the ideal ratio.
- Cross-placement scoring (one asset scored against multiple placements simultaneously) is absent in all consumer-facing tools; users must manually select the target placement first.

### Edge cases they miss
- **Animated GIFs / video aspect ratio drift:** frames may not all share the same ratio if the source file was encoded with anamorphic pixel aspect ratios (PAR ≠ 1:1).
- **Carousel creatives:** each card can have a different ratio; no tool aggregates a per-carousel compliance score.
- **Reels vs Stories safe-zone interaction:** a 9:16 creative can be ratio-compliant but still fail safe-zone checks independently — these are treated as separate concerns by all competitors.
- **Dynamic canvas expansion:** TikTok's spark ads can display at different ratios depending on whether the user has captions enabled.

---

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class FormatAdaptationRequest(BaseModel):
    image_width: int          # pixels
    image_height: int         # pixels
    target_platform: Literal["meta_feed", "meta_stories", "meta_reels",
                              "tiktok_infeed", "youtube_preroll",
                              "snapchat_story", "instagram_feed"]

class FormatAdaptationResponse(BaseModel):
    platform__format_adaptation: float | None = Field(
        None,
        ge=0.0, le=1.0,
        description="Compliance score: 1.0=exact match, 0.0=unsupported ratio"
    )
    detected_ratio: str | None           # e.g. "16:9"
    expected_ratio: str | None           # e.g. "9:16"
    compliance_tier: Literal["optimal", "acceptable", "cropped", "unsupported"] | None
    null_with_reason: str | None         # populated when score cannot be computed
```

**Endpoint:** `POST /score/platform/format-adaptation`

### ONNX / model dependency
- **No ONNX model needed.** Pure arithmetic: `ratio = width / height`. Compare against a hardcoded lookup dict keyed by `target_platform`.
- Reuse `model/multitask.py` `CreativeScorer` only if bundling with the full scoring pipeline; otherwise implement as a standalone `utils/format_adapter.py` function — it runs in < 1 ms.
- Platform ratio lookup table (add to `data/platform_specs.json`):

```json
{
  "meta_feed":       { "optimal": 0.8,  "acceptable": [0.5625, 1.7778], "tolerance": 0.02 },
  "meta_stories":    { "optimal": 0.5625, "acceptable": [0.5, 0.5625], "tolerance": 0.02 },
  "meta_reels":      { "optimal": 0.5625, "acceptable": [0.5, 0.5625], "tolerance": 0.02 },
  "tiktok_infeed":   { "optimal": 0.5625, "acceptable": [0.5625, 1.0], "tolerance": 0.02 },
  "youtube_preroll": { "optimal": 1.7778, "acceptable": [1.7778], "tolerance": 0.02 },
  "snapchat_story":  { "optimal": 0.5625, "acceptable": [0.5625], "tolerance": 0.02 },
  "instagram_feed":  { "optimal": 0.8,   "acceptable": [0.8, 1.0], "tolerance": 0.02 }
}
```

Scoring logic: `score = 1.0` if within tolerance of optimal; `score = 0.5` if within acceptable range; `score = 0.0` otherwise.

### Next.js component

**Filename:** `FormatAdaptationScore.tsx`
**Location:** `ui/src/components/application/ad-scoring/FormatAdaptationScore.tsx`

```typescript
interface FormatAdaptationScoreProps {
  score: number | null;            // 0.0–1.0
  detectedRatio: string | null;    // "16:9"
  expectedRatio: string | null;    // "9:16"
  complianceTier: "optimal" | "acceptable" | "cropped" | "unsupported" | null;
  nullWithReason?: string;
}
```

**UI pattern:** A compact status badge (green/yellow/red) showing the `complianceTier` label + a small ratio comparison string ("16:9 → expected 9:16"). No gauge needed — this is a tier display, not a continuous score.

### Failure mode

Return `platform__format_adaptation: null` with:
```python
null_with_reason = "image dimensions not provided or image file unreadable"
```
Do not throw HTTP 422 — the scoring endpoint should degrade gracefully so other sub-scores can still be returned.
