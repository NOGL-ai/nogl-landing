# 03 — Text Coverage

> **Criterion slug:** `text__text_coverage`
> **Definition:** Total text-area ratio — what percentage of the image area is covered by text pixels. Meta's historical guideline (still widely cited as best practice): < 20% text coverage for optimal reach. Lower coverage correlates with higher CTR and lower CPM at most platforms.

---

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Meta | Text Overlay Tool (deprecated 2020, replaced by reach-restriction system) | https://www.techwyse.com/tools/fb-image-text-detection | Platform enforcement |
| Meta | Ads Manager — Reach Restriction Tiers (None / Low / Medium / High) | https://kb.orbee.com/meta-20-rule | Platform enforcement |
| Marpipe | Multivariate testing — in-image text element tracking | https://www.marpipe.com/marpipe-multivariate-testing | Creative testing |
| AdCreative.ai | Creative Scoring AI — text hierarchy & coverage analysis | https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it | AI creative scoring |
| Smartly.io | Creative Insights — AI Theme Analysis (text content scoring) | https://www.smartly.io/product-features/creative-insights | Creative automation |
| CreativeX | Creative Quality Score — text density guideline | https://www.creativex.com/products/creative-quality | Creative quality analytics |
| VidMob | Scoring — text element tagging, asset formatting check | https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring | Creative analytics |
| Instapage / HubSpot | Educational references to the 20% rule | https://instapage.com/blog/facebook-20-text-rule | Agency tooling |
| Wask Blog | 2026 analysis of whether the 20% rule still holds | https://blog.wask.co/digital-marketing/facebook-20-text-rule/ | Agency reference |

---

## How they implement it

### Algorithm / model family
Meta's original **Text Overlay Tool** (2015–2020) divided the image into an 5 × 5 = 25-cell grid. Any cell with "significant" text was counted; if ≥ 5 cells (20%) contained text, the ad was rejected. This was replaced with a pixel-area approach that assigns ads to reach tiers.

Modern implementations use one of two approaches:

1. **OCR bounding box area method (most common):**
   - Run `pytesseract.image_to_data()` or PaddleOCR to get word-level bounding boxes.
   - Merge overlapping boxes (union of rectangles) to avoid double-counting.
   - Compute `text_coverage = sum(box_area) / image_area`.
   - Handles plain text well; fails on stylised or decorative fonts.

2. **Semantic segmentation method (more accurate, used by VidMob / CreativeX-style platforms):**
   - Pass the image through a segmentation model (e.g. a fine-tuned DeepLabV3 or a CRAFT text detector) that produces a pixel-level text mask.
   - `text_coverage = text_mask_pixel_count / total_pixel_count`.
   - CRAFT (Character Region Awareness for Text Detection) is a well-documented model for detecting arbitrary-shape text regions, including curved or stylised text.

**Coverage tier mapping (aligns with Meta's historical reach system):**
| Coverage | Tier | Recommended action |
|---|---|---|
| 0–10% | None / Optimal | No action needed |
| 10–20% | Low | Acceptable, minor reach impact |
| 20–30% | Medium | Significant reach reduction expected |
| > 30% | High | Major reach restriction; redesign recommended |

### Metric shape
- **Continuous float 0.0–1.0** representing fraction of image pixels covered by text — this is the preferred output for our stack.
- **Tiered label** (None / Low / Medium / High) matching Meta's historical taxonomy — useful as a companion enum.
- **Binary PASS/FAIL** at 0.20 threshold (used by legacy Meta Text Overlay Tool and still referenced by Instapage / HubSpot guides).

### UI pattern
- **Meta Ads Manager (historical):** A 5 × 5 grid was superimposed on the creative; cells with text were highlighted in red. Replaced with a simpler "Your image has too much text" warning message and a reach prediction bar.
- **AdCreative.ai:** A 0–100 score is displayed in the creative card; there is no separate text-coverage dial, but the Component Analysis AI flags "text overload" as a sub-reason in a hover tooltip.
- **VidMob:** A "Text Coverage" row in the scoring table shows percentage value + PASS/FAIL indicator.
- **Our proposed pattern:** A horizontal gauge bar labelled "Text Coverage" with four coloured segments (green 0–10%, yellow 10–20%, orange 20–30%, red > 30%). The detected percentage is shown as a number inside the gauge.

### Public screenshots / demos
- Meta's 20% text rule explanation (archived text overlay tool): https://instapage.com/blog/facebook-20-text-rule
- Facebook text overlay: HubSpot guide with example images: https://blog.hubspot.com/marketing/facebook-text-overlay
- AdCreative.ai creative scoring help doc: https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- Wask Blog 2026 — is the 20% rule still valid: https://blog.wask.co/digital-marketing/facebook-20-text-rule/

---

## Help articles & source material

- Meta — original 20% rule announcement (archived): https://instapage.com/blog/facebook-20-text-rule
- Meta — Current reach restriction system (None/Low/Medium/High tiers): https://kb.orbee.com/meta-20-rule
- Facebook removing the 20% text rule (ATTN Agency): https://www.attnagency.com/blog/facebook-removing-the-20-text-rule-for-paid-ads
- Meta still recommends < 20% for best performance: https://5horizons.agency/facebook-text-overlay-is-the-20-rule-still-relevant-in-2023/
- AdCreative.ai — How does the AI score your creatives: https://help.adcreative.ai/en/articles/5713632-how-does-the-ai-score-your-creatives
- VidMob — Scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- CRAFT text detector paper: https://arxiv.org/abs/1904.01941
- pytesseract image_to_data docs: https://pypi.org/project/pytesseract/
- PyImageSearch — Tesseract OCR text localization: https://pyimagesearch.com/2020/05/25/tesseract-ocr-text-localization-and-detection/

---

## Pros / cons / flaws

### What competitors do well
- Meta's tiered reach system is the most battle-tested coverage enforcement mechanism in the industry, with evidence from billions of ad impressions.
- AdCreative.ai surfaces the text hierarchy (title vs. subtitle vs. CTA size relationships) alongside raw coverage — more useful than a single number for guiding redesigns.
- VidMob allows brands to customise the PASS/FAIL threshold (e.g., a pharma brand might accept 25% due to required disclosures), which is a critical enterprise feature.

### Where they fall short
- Meta's original grid method was notoriously inaccurate on images with decorative borders, background patterns, or small legally required text (disclaimers) — all of which could push a visually clean ad into the "too much text" bucket.
- OCR-based area methods undercount stylised text (hand-lettered, brush fonts, text on curves) because Tesseract cannot detect these as text at all, producing a falsely low coverage score.
- None of the surveyed tools distinguish between **foreground text** (headline, CTA, brand name) and **background texture text** (watermarks, patterned fills with letters) for coverage purposes.
- Platform-specific rules diverge: TikTok has no formal text coverage cap; Pinterest recommends < 30%; Google Display Ads has no coverage rule at all. Most competitor tools only encode Meta's threshold.

### Edge cases they miss
- **Text in logos:** A logo with wordmark glyphs may be counted as "text" by OCR but is arguably a graphic element. No tool segments logos from text.
- **Overlapping text layers:** In a multi-layer PSD/video template, the same region may have two text elements (e.g. a drop shadow layer and a fill layer). Simple bounding box union handles this correctly, but naive area summation double-counts.
- **Animated ads / video:** Coverage should be computed per-frame (or per keyframe) and reported as max and average across the video duration. No tool does this.

---

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class TextCoverageResponse(BaseModel):
    text__text_coverage: float | None = Field(
        None,
        ge=0.0, le=1.0,
        description="Fraction of image pixels covered by detected text. "
                    "0.0 = no text, 1.0 = entire image is text."
    )
    coverage_percent: float | None          # same value × 100, for display
    coverage_tier: Literal["none", "low", "medium", "high"] | None
    # "none"   = 0–10%
    # "low"    = 10–20%
    # "medium" = 20–30%
    # "high"   = >30%
    null_with_reason: str | None
```

**Endpoint:** `POST /score/text/coverage`

### ONNX / model dependency

**Option A — fast, good-enough (recommended for v1):**
- `pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)` — extract `(left, top, width, height)` per word.
- Merge overlapping rectangles using a simple interval-union algorithm.
- Compute `coverage = union_area / (img_w * img_h)`.
- Runtime: ~80–200 ms per image on CPU.

**Option B — higher accuracy for stylised text:**
- Use the **CRAFT text detector** ONNX export (`craft_mlt_25k.onnx`, ~45 MB, available at https://github.com/clovaai/CRAFT-pytorch).
- CRAFT returns word-level polygon coordinates; convert to bounding boxes and compute union area.
- Load via `onnxruntime.InferenceSession("model/craft_mlt_25k.onnx")`.
- Wire into `model/multitask.py` as a secondary head: `CreativeScorer.text_coverage_head`.

**Preprocessing (both options):**
```python
import cv2, numpy as np
img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
img_proc = cv2.adaptiveThreshold(img_gray, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
```

### Next.js component

**Filename:** `TextCoverageScore.tsx`
**Location:** `ui/src/components/application/ad-scoring/TextCoverageScore.tsx`

```typescript
interface TextCoverageScoreProps {
  score: number | null;         // 0.0–1.0
  coveragePercent: number | null;
  coverageTier: "none" | "low" | "medium" | "high" | null;
  nullWithReason?: string;
}
```

**UI pattern:** Horizontal progress bar divided into four coloured bands (green 0–10%, yellow 10–20%, orange 20–30%, red > 30%). A triangle indicator marks the current value. Below the bar, a single line: "18% text coverage — Low (acceptable)". No heatmap overlay is needed here; that's handled by `TextSafeZoneScore.tsx`.

### Failure mode

Return `text__text_coverage: null` with:
```python
null_with_reason = "text detection produced no valid bounding boxes — image may be vector-only, too small (< 100 px), or corrupt"
```
