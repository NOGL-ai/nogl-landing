# 02 — Platform Text Safe Zone

> **Criterion slug:** `platform__text_safe_zone`
> **Definition:** OCR text placement — are text elements within the platform's safe zone? Meta keeps 20% margins on Stories/Reels (top 14%, bottom 20–35% blocked by UI). TikTok has UI overlay zones at bottom ~25% (484 px on 1920 canvas) and top ~7% (130 px) that cover any text rendered there.

---

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Meta | Business Help Center — Text Overlays & Safe Zone for Stories/Reels | https://www.facebook.com/business/help/980593475366490 | Platform spec documentation |
| TikTok | Ads Manager — TopView / In-Feed Safe Zone Spec | https://ads.tiktok.com/help/article/tiktok-reservation-topview | Platform spec documentation |
| AdCreative.ai | Creative Scoring AI — Safe Zone Heatmap overlay | https://www.adcreative.ai/post/optimization-of-your-tiktok-ads-how-to-master-the-tiktok-safe-zone | AI creative scoring |
| CreativeX | Creative Quality Score — Safe Zones guideline | https://support.creativex.com/hc/en-us/articles/24462500538907-Safe-Zones | Creative quality analytics |
| Smartly.io | Creative Insights — Attention Heatmap | https://www.smartly.io/product-features/creative-insights | Creative automation |
| Marpipe | Ad Glossary — Aspect Ratio Safe Zones by Platform | https://www.marpipe.com/ad-glossary/aspect-ratio-safe-zones-by-platform | Creative testing |
| AdverthHunt | TikTok Ad Safe Zone Checker (free tool) | https://adverthunt.com/tools/ad-safe-zone-checker/tiktok | Free audit tool |
| House of Marketers | Safe Zone Guide for TikTok, Meta & Instagram | https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/ | Agency / reference |
| AdsUploader | Meta Ads Safe Zones — Complete Guide | https://adsuploader.com/blog/meta-ads-safe-zones | Reference / tooling |

---

## How they implement it

### Algorithm / model family
- **OCR-first pipeline:** Run Tesseract 4 (LSTM engine, `--psm 3`) or PaddleOCR to extract word-level bounding boxes from the image. Each bounding box is expressed as `(x, y, w, h)` in pixels, normalised to `[0,1]` relative to image dimensions.
- **Zone mask comparison:** A per-platform zone mask is loaded (JSON lookup keyed by `platform + placement`). For each OCR'd bounding box, compute the intersection area with each blocked zone. Any box with > 0% overlap with a blocked zone is a violation.
- **CreativeX approach:** Uses computer vision (CV) to classify regions of an image, identifies text regions, and checks their coordinates against platform-provided safe zone specs. The guideline is PASS/FAIL per asset.
- **Smartly.io:** Generates an attention heatmap (saliency model, likely GradCAM or a trained eye-tracking surrogate) and overlays platform safe zone rectangles; the UI shows whether high-attention regions are inside or outside the safe zone.
- **AdverthHunt free tool:** Superimposes a static PNG overlay matching TikTok's UI regions on top of the uploaded creative; visual check only, no numeric output.

### Metric shape
| Shape | Detail |
|---|---|
| PASS/FAIL binary | CreativeX (per guideline), VidMob |
| % of text boxes in violation | Our stack — preferred shape: 0.0 = all text safe, 1.0 = all text in unsafe zone |
| Heatmap overlay (visual) | Smartly.io, AdCreative.ai |
| Pixel-level overlay PNG | AdverthHunt, House of Marketers templates |

**Platform safe zone definitions (pixels on a 1080 × 1920 canvas):**

| Platform | Blocked Top | Blocked Bottom | Blocked Right | Blocked Left |
|---|---|---|---|---|
| Meta Stories | 252 px (13%) | 384 px (20%) | 65 px (6%) | 65 px (6%) |
| Meta Reels | 252 px (13%) | 672 px (35%) | 65 px (6%) | 65 px (6%) |
| TikTok In-Feed | 130 px (7%) | 484 px (25%) | 140 px (13%) | 0 px |
| TikTok TopView | 130 px (7%) | 420 px (22%) | 140 px (13%) | 0 px |
| Snapchat Story | 130 px (7%) | 500 px (26%) | 65 px (6%) | 65 px (6%) |

Source: AdsUploader Meta guide (March 2026); TikTok TopView specs; House of Marketers safe zone reference.

### UI pattern
- **Heatmap + zone overlay:** The most common professional pattern (Smartly, AdCreative.ai). The creative thumbnail is displayed at ~300 px wide; a semi-transparent red rectangle is drawn over each blocked zone; detected text bounding boxes are shown as thin green outlines; violations shown in orange/red.
- **Tier badge:** CreativeX shows a green tick ("Safe") or amber warning ("Partially Unsafe") or red cross ("Unsafe") next to the Safe Zone guideline row in the scoring table.
- **Numeric coverage gauge:** Our proposed pattern — a `0–100` integer showing "% of text area inside safe zone".

### Public screenshots / demos
- Meta official Safe Zone spec with zone diagram: https://www.facebook.com/business/help/980593475366490
- TikTok TopView safe zone dimensions: https://ads.tiktok.com/help/article/tiktok-reservation-topview
- AdverthHunt interactive TikTok safe zone checker: https://adverthunt.com/tools/ad-safe-zone-checker/tiktok
- Zeely.ai TikTok safe zone guide with pixel measurements: https://zeely.ai/blog/tiktok-safe-zones/
- AdCreative.ai TikTok safe zone guide (with annotated screenshots): https://www.adcreative.ai/post/optimization-of-your-tiktok-ads-how-to-master-the-tiktok-safe-zone

---

## Help articles & source material

- Meta — About text overlays and the safe zone for ads in Stories and Reels: https://www.facebook.com/business/help/980593475366490
- AdsUploader — Meta Ads Safe Zones: The Complete Guide: https://adsuploader.com/blog/meta-ads-safe-zones
- TikTok Ads Help — TopView ad specifications (safe zone pixel values): https://ads.tiktok.com/help/article/tiktok-reservation-topview
- Zeely.ai — TikTok safe zones 2026 guide: https://zeely.ai/blog/tiktok-safe-zones/
- Predis.ai — Ultimate TikTok Safe Zone Guide: https://predis.ai/resources/tiktok-safe-zone-guide/
- Pennock — Safe Zones & Aspect Ratios in Paid Media (cross-platform): https://www.pennock.co/blog/pennock-unlock-unmasking-your-ads-the-crucial-role-of-safe-zones-aspect-ratios-in-paid-media
- House of Marketers — Safe Zone Guide with templates: https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/
- CreativeX — Safe Zones guideline documentation: https://support.creativex.com/hc/en-us/articles/24462500538907-Safe-Zones
- kreatli.com — TikTok Safe Zone Guide 2026 with pixel breakdown: https://kreatli.com/guides/tiktok-safe-zone

---

## Pros / cons / flaws

### What competitors do well
- CreativeX codifies safe zone rules as persistent brand guidelines that are automatically applied to every new asset, eliminating the need for teams to re-check specs manually.
- Smartly.io's heatmap overlay makes violations immediately legible to non-technical creatives — they can see their headline sits under a TikTok engagement button without reading spec docs.
- AdverthHunt provides a free, zero-login interactive overlay tool that agencies widely use for quick QA.

### Where they fall short
- None of the surveyed tools provide a **continuous numeric score** for safe zone compliance — they all produce binary PASS/FAIL or visual overlays, making portfolio-level benchmarking impossible.
- Safe zone specs change frequently (Meta updated Stories/Reels unified safe zone in March 2026); hardcoded pixel values in tools become stale within weeks of a platform UI redesign.
- Tools that rely only on OCR miss **graphical text** (text rendered as vector paths in an SVG or embedded in a PNG without machine-readable characters). A Tesseract-only pipeline would score such creatives as fully safe.
- The TikTok right-side engagement column (likes, comments, share, creator avatar — ~140 px wide) is frequently omitted from third-party safe zone calculators, which only check the bottom strip.
- No tool handles **animated assets** frame-by-frame: a text element may move into the unsafe zone during the final 2 seconds of a 15-second video.

### Edge cases they miss
- **Subtitle / caption burns:** Auto-generated subtitles are placed by TikTok/Meta in the same zone they block; a creative with burned-in captions near the bottom will produce false violations.
- **Dark-background creatives:** OCR engines have lower accuracy on white-on-dark-background text without pre-processing (invert + threshold), leading to missed text detection and false PASS results.
- **Multi-slide carousels:** each card may have text in different positions; compliance must be computed per card, not per creative.

---

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class TextBox(BaseModel):
    x: float      # normalised [0,1] from left
    y: float      # normalised [0,1] from top
    w: float      # normalised width
    h: float      # normalised height
    text: str

class SafeZoneResponse(BaseModel):
    platform__text_safe_zone: float | None = Field(
        None,
        ge=0.0, le=1.0,
        description="Fraction of total detected text area that lies INSIDE the safe zone. "
                    "1.0 = all text is safe, 0.0 = all text violates safe zone."
    )
    total_text_boxes: int | None
    violating_boxes: int | None
    violating_text_snippets: List[str] | None   # first 5 violating strings for debug
    platform: str | None
    null_with_reason: str | None
```

**Endpoint:** `POST /score/platform/text-safe-zone`
Accept `multipart/form-data` with `image` file + `target_platform` string field.

### ONNX / model dependency
- **OCR:** `pytesseract` (wraps Tesseract 4 LSTM) for Latin-script ads; swap to `paddleocr` (`PaddleOCR(use_angle_cls=True, lang='en')`) for non-Latin markets — PaddleOCR returns word-level bboxes with higher accuracy on stylised fonts.
- **Pre-processing before OCR:** Apply OpenCV adaptive thresholding (`cv2.adaptiveThreshold`) + mild Gaussian blur to improve OCR recall on dark or textured backgrounds.
- **Zone mask:** Load from `data/platform_specs.json` (same file used in criterion 01). Each entry adds a `safe_zone` key:

```json
"meta_stories": {
  "safe_zone": { "top": 0.132, "bottom": 0.800, "left": 0.060, "right": 0.940 }
}
```

- The `CreativeScorer` in `model/multitask.py` is **not needed** for this criterion — it is pure geometry + OCR. Keep in a standalone `utils/safe_zone_checker.py`.

### Next.js component

**Filename:** `TextSafeZoneScore.tsx`
**Location:** `ui/src/components/application/ad-scoring/TextSafeZoneScore.tsx`

```typescript
interface ViolatingBox {
  x: number; y: number; w: number; h: number;
  text: string;
}

interface TextSafeZoneScoreProps {
  score: number | null;                 // 0.0–1.0
  totalBoxes: number | null;
  violatingBoxes: number | null;
  violatingSnippets: string[] | null;
  platform: string | null;
  imagePreviewUrl: string;              // for overlay rendering
  nullWithReason?: string;
}
```

**UI pattern:** Render a `<canvas>` element on top of the `<img>` preview. Draw semi-transparent red rectangles for the blocked zones, green outlines for safe text boxes, orange outlines for violating boxes. Show a numeric summary badge: "3 of 5 text elements in safe zone". The canvas overlay is the only place in the scoring UI where drawing on the image preview is appropriate.

### Failure mode

Return `platform__text_safe_zone: null` with:
```python
null_with_reason = "OCR returned zero text regions — image may be non-Latin, fully graphical, or too low resolution (< 300 px height)"
```
