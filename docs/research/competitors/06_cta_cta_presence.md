# 06 — cta.cta_presence

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| AdCreative.ai | Creative Scoring AI | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| CreativeX | Creative Quality Score (CQS) | https://www.creativex.com/products/creative-quality | Creative intelligence / brand governance |
| Pencil (+ CreativeX integration) | Predictive Score + CQS | https://trypencil.com/ | Gen-AI ad creation |
| Smartly.io | Creative Predictive Potential | https://www.smartly.io/product-features/creative-predictive-potential | Enterprise creative automation |
| Celtra | Creative Intelligence | https://celtra.com/blog/celtra-your-trusted-ads-design-tool/ | Creative management platform (CMP) |
| Flashtalking by Mediaocean | Creative Intelligence suite | https://www.flashtalking.com/ | Ad serving + dynamic creative |
| Marpipe | Multivariate creative testing | https://www.marpipe.com/ | E-commerce ad testing |
| Google Ads | Responsive Display Ad quality signals | https://support.google.com/google-ads/answer/9823397 | Self-serve ad platform |

## How they implement it

### Algorithm / model family

- **AdCreative.ai**: Proprietary CNN-based Component Analysis AI trained on 450M+ ad dataset. Identifies specific elements — logos, CTAs, product placements, text hierarchy — and assigns sub-scores per element. CTA detection is a named component alongside logo, headline, and product shot detection. Trained as multi-label classifier; each element presence is a binary signal fed into the overall Performance Score regression head.
- **CreativeX**: Computer vision pipeline (computer vision details not publicly documented) classifies which elements are present in an asset. The CTA presence check is one of the "digital suitability fundamentals" validated across Meta, Google, Snap, and TikTok platform best-practice research. Detection uses a mix of object detection (bounding box for button regions) and OCR + text classification (identifying CTA text strings such as "Shop Now", "Learn More", "Sign Up"). Human review fallback is used when model confidence is below threshold.
- **Smartly.io**: Creative Predictive Potential uses computer vision and eye-tracking simulation models to rate "creative structure" which includes CTA prominence signals. No separate CTA binary flag is published; it feeds into an aggregate 0–100 score.
- **Google Ads**: Responsive Display Ads surface a "CTA" field as a required form input, and the quality guidance explicitly states CTAs should be "visually distinct." Google's Ad Strength indicator (Poor / Good / Excellent) rewards CTA presence but does not publish sub-scores.
- **Marpipe**: CTA is treated as a variable axis in multivariate testing — different CTA copy, color, and button shapes are tested as distinct creative elements. No pre-flight CTA detection; evaluation is post-spend.

### Metric shape

- **AdCreative.ai**: Component-level binary (present / absent) combined into a 0–100 Performance Score with color traffic-light UI (green ≥ 70, yellow 40–69, red < 40). CTA sub-score not individually exposed in the UI.
- **CreativeX**: CQS expressed as percentage of guidelines met (0–100%). CTA presence is one of six or more weighted guidelines. Pass/Fail per guideline, then averaged to CQS. Customizable tier labels (Excellent / Good / Needs Work / Poor) at configurable thresholds.
- **Smartly.io**: Single 0–100 aggregate creative score, no individual CTA sub-score published.
- **Our target**: Float 0.0–1.0. Suggest three semantic buckets: `absent` (0.0–0.29), `weak` (0.30–0.69), `strong` (0.70–1.0). Score incorporates: (a) CTA keyword detection via OCR, (b) visual emphasis signals (button shape detection, color contrast of CTA text region vs. its local background, font size relative to image height), (c) saliency-weighted CTA area.

### UI pattern

- **AdCreative.ai**: Color-coded score badge (green / yellow / red) + saliency heatmap overlay on the ad thumbnail. "AI-Recommended Actions" section lists "Adjust CTA button placement" or "Increase CTA contrast" as named action items.
- **CreativeX**: Table of guidelines with Pass/Fail badges per row. CTA presence row shows a thumbnail crop highlighting detected CTA region when it passes; shows a warning icon with improvement text when it fails.
- **Smartly.io**: Attention heatmap overlay showing hotspot zones — CTA area is annotated if it falls inside/outside attention hotspots. Score displayed as a dial gauge (0–100) with color bands.
- **Our target**: Numeric gauge 0–100 (mapped from 0.0–1.0) + a tier badge (`absent` / `weak` / `strong`) + an optional bounding-box overlay on the image showing the detected CTA region.

### Public screenshots / demos

- AdCreative.ai scoring demo: https://www.adcreative.ai/creative-scoring
- AdCreative.ai help article: https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- CreativeX product page: https://www.creativex.com/products/creative-quality
- Smartly.io Creative Predictive Potential FAQ: https://www.smartly.io/resources/predictive-creative-potential-faqs-on-ai-pre-flight-creative-testing

## Help articles & source material

- https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- https://help.adcreative.ai/en/articles/5713632-how-does-the-ai-score-your-creatives
- https://www.adcreative.ai/post/how-does-ai-scoring-transform-ad-creatives-in-digital-marketing
- https://support.creativex.com/hc/en-us/articles/27431105771803-Guidelines-Overview
- https://support.creativex.com/hc/en-us/articles/6135739124507-What-are-the-creative-scoring-tiers-and-how-do-I-customize-them
- https://www.creativex.com/blog/what-is-creative-quality
- https://support.google.com/google-ads/answer/9823397 (Google Responsive Display Ads best practices)
- https://thewisemarketer.com/pencil-and-creativex-join-forces-to-enable-automated-creative-scoring-of-gen-ai-ads-at-scale/
- https://618media.com/en/blog/cta-design-innovations-in-google-display-ads/

## Pros / cons / flaws

### What competitors do well

- AdCreative.ai exposes element-level explanations alongside the score, giving actionable feedback rather than just a number.
- CreativeX uses platform-validated fundamentals (sourced from Meta, Google, TikTok research) rather than purely internal data, giving the pass/fail criteria external legitimacy.
- Pencil + CreativeX integration enables pre-flight CTA scoring at generation time, preventing bad creatives from ever being uploaded.

### Where they fall short

- No competitor distinguishes between a **visually emphasized CTA** (button shape, contrasting fill color, bold text, underline) vs. CTA **keyword presence alone** (just the words "Buy Now" in body copy font). This is the most important distinction for conversion.
- AdCreative.ai's CTA sub-score is not individually exposed via API — the component detection is internal only.
- None of the public tools score CTA emphasis relative to the rest of the text in the image (i.e., is the CTA the most visually prominent text element?).
- Post-spend tools (Marpipe) cannot help before budget is committed.

### Edge cases they miss

- CTAs expressed as arrows, icons, or animated pulses with no text (common in TikTok-native video frames)
- Multilingual CTA text (e.g., "Acheter maintenant" or "立即购买") — OCR keyword lists are typically English-only
- CTAs that are visible but rendered at low opacity or with insufficient contrast to background (passes OCR detection, fails visual emphasis check)
- CTA in a video frame that only appears in frames 2–4 of a looping GIF (static image analysis misses it)

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/cta-presence
from pydantic import BaseModel, Field
from typing import Optional

class CtaPresenceRequest(BaseModel):
    ad_id: int
    image_b64: str                        # base64-encoded JPEG/PNG, max 2 MB
    ad_copy: Optional[str] = None         # full ad copy text for fallback OCR correlation
    platform: str = "meta"               # "meta" | "tiktok" | "google" | "generic"

class CtaPresenceResponse(BaseModel):
    ad_id: int
    slug: str = "cta.cta_presence"       # always this value
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[str] = Field(None, description="absent | weak | strong")
    cta_text_detected: Optional[str] = None   # OCR-extracted CTA string
    cta_bbox: Optional[list[int]] = None      # [x1, y1, x2, y2] in pixel coords
    null_with_reason: Optional[str] = None    # populated when score is None
```

### ONNX / model dependency

Do **not** route through the existing `CreativeScorer` in `model/multitask.py` — that model outputs a single holistic quality score without element decomposition. Instead use a two-stage pipeline:

1. **OCR stage**: `pytesseract` (Tesseract 5.x via `tesseract-ocr` apt package). Extract all text blocks with bounding boxes using `pytesseract.image_to_data(..., output_type=Output.DICT)`. Match against a CTA keyword list (approx. 60 terms: "shop now", "buy", "get", "learn more", "sign up", "download", "try free", "start", "order", "claim", etc.).

2. **Visual emphasis stage**: For each OCR-detected CTA text region:
   - Compute local background color by sampling the 5px border around the bounding box.
   - Compute foreground text color by sampling the median color of pixels within the bounding box above a luminance threshold.
   - Compute WCAG contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` where `L1 > L2`.
   - Compute relative font size: `bbox_height_px / image_height_px`.
   - Detect button shape: run `cv2.findContours` on a locally thresholded crop looking for filled rectangles or rounded-rect outlines around the CTA region.

3. **Score assembly**:
   - `has_cta_text` (0 or 1) + `contrast_ratio ≥ 4.5` (0 or 1) + `relative_font_size ≥ 0.05` (0 or 1) + `button_shape_detected` (0 or 1) → sum / 4 = raw score.
   - Map: `0.0–0.25` → `absent`, `0.26–0.75` → `weak`, `0.76–1.0` → `strong`.

Dependencies: `pytesseract>=0.3.10`, `opencv-python>=4.9`, `Pillow>=10.0`, `wcag-contrast-ratio>=0.9` (PyPI).

### Next.js component

```
File: ui/src/components/application/ad-scoring/CtaPresenceCard.tsx

Props interface:
  interface CtaPresenceCardProps {
    adId: number;
    score: number | null;           // 0.0–1.0 or null
    tier: "absent" | "weak" | "strong" | null;
    ctaTextDetected: string | null;
    ctaBbox: [number, number, number, number] | null;  // [x1,y1,x2,y2]
    imageUrl: string;
    nullWithReason?: string;
  }

Render:
  - Numeric gauge (Tailwind CSS progress bar (or equivalent component) or a custom radial SVG) showing score * 100
  - Tier badge: absent=red, weak=amber, strong=green (Tailwind bg-red-500 / bg-amber-400 / bg-green-500)
  - If ctaBbox is present, render a <canvas> overlay on top of imageUrl drawing the bounding box in the tier color
  - If nullWithReason is set, show a gray "N/A" badge with a tooltip containing the reason string
  - CTA text string displayed as a <code> snippet below the image
```

### Failure mode

Return `score: null, tier: null, null_with_reason: "ocr_no_text_detected"` when Tesseract extracts zero text blocks with confidence ≥ 60 from the image.

Additional `null_with_reason` values:
- `"image_too_small"` — image smaller than 100×100 px after decode
- `"image_decode_error"` — base64 decode or PIL.open fails
- `"tesseract_unavailable"` — Tesseract binary not found on PATH
