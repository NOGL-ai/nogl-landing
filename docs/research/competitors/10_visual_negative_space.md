# 10 — visual.negative_space

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Google Ads | Responsive Display Ad quality guidance (white space rule) | https://support.google.com/google-ads/answer/9823397 | Self-serve ad platform |
| AdCreative.ai | Creative Scoring AI (composition signals) | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| CreativeX | Creative Quality Score — composition fundamentals | https://www.creativex.com/products/creative-quality | Creative intelligence |
| Smartly.io | Creative Predictive Potential (creative structure signal) | https://www.smartly.io/product-features/creative-predictive-potential | Enterprise creative automation |
| Celtra | Composition guidance in CMP templates | https://celtra.com/ | Creative management platform |
| Marpipe | Background area testing (multivariate) | https://www.marpipe.com/ | E-commerce ad testing |
| Pencil | Gen AI ad creative — composition scoring | https://trypencil.com/ | Gen-AI ad creation |
| Flashtalking by Mediaocean | Creative intelligence — visual composition | https://www.flashtalking.com/ | Ad serving + DCO |

## How they implement it

### Algorithm / model family

**Negative space / empty space ratio:**

No competitor publishes a dedicated "negative space ratio" metric name. The concept appears in several disguised forms:

- **Google Ads** (most explicit): The Responsive Display Ad best-practice guide states "Blank space shouldn't take up more than 80% of the image. Your product or service should be the focus." This is the closest to a hard threshold. The 80% rule implies a minimum 20% semantic content requirement. Google does not specify how "blank space" is detected — it is likely a simple pixel variance / entropy check.

- **AdCreative.ai**: The saliency AI predicts which pixels attract attention. An indirect negative space signal: if the attention heatmap is highly concentrated on a small fraction of the image, the rest is de facto empty. No explicit negative space percentage published.

- **CreativeX**: The Clear Presence guideline (criterion 09 subject coverage) and a "visual density" or "busy-ness" guideline are referenced in their glossary. No specific negative space percentage threshold published.

- **Smartly.io**: "Creative structure" sub-signal in Creative Predictive Potential. Attention heatmaps reveal sparse attention (large cool/empty zones) which correlates with excessive negative space. No separate metric.

**Our implementation approach:**

Negative space is defined as pixels with no "semantic content." The cleanest proxy is: pixels classified as background by a semantic segmentation or salient object detection model. Two methods:

**Method A — Salient Object Mask (preferred):**
Reuse the U2-Net foreground mask from criterion 09. `negative_space_ratio = 1.0 - foreground_coverage`. This is semantically accurate but depends on U2-Net being available.

**Method B — Entropy / Variance Proxy (fallback):**
1. Convert image to grayscale.
2. Compute local variance on a sliding 16×16 px window across the image.
3. Classify a window as "empty" if its variance falls below a threshold (e.g., std dev < 8 on 0–255 scale — effectively flat color or near-solid region).
4. `negative_space_ratio = (count of empty windows) / (total windows)`.

This proxy is platform-independent and does not require any ML model, but will count textured backgrounds (e.g., fabric, concrete) as "filled" even if they are visually non-informative.

**Method C — LAB color variance (alternative fallback):**
Compute per-pixel LAB chroma saturation. Pixels with very low chroma (near-gray or near-white) and low luminance variation in a local 8×8 neighborhood are considered empty. This handles white/gray backgrounds cleanly.

### Metric shape

- **Google Ads**: Hard binary check: if blank space > 80% → disqualified (implied; exact enforcement varies). No continuous score.
- **CreativeX**: No dedicated negative space score; folded into broad composition/presence guidelines.
- **Our target**: Float 0.0–1.0 representing negative space ratio (fraction of image that is empty/background).

  The scoring function is **non-linear** because both extremes are bad:
  - Too much negative space (> 0.75): cluttered background or product lost in whitespace → penalize
  - Too little negative space (< 0.10): extremely dense/cluttered image → penalize
  - Optimal range: 0.30–0.65 (subject takes 35–70% of the image; breathing room exists)

  Score formula (inverted U-shape / trapezoid):
  ```
  ns = negative_space_ratio   # 0.0 = no empty space; 1.0 = entirely empty
  if 0.30 <= ns <= 0.65:
      score = 1.0
  elif ns < 0.30:
      score = ns / 0.30        # penalize clutter: 0.15 → 0.5
  elif ns > 0.65:
      score = max(0.0, 1.0 - (ns - 0.65) / 0.35)  # penalize emptiness: 0.90 → 0.29
  ```

  Buckets:
  - `cluttered` (ns < 0.20): less than 20% empty — too dense
  - `balanced` (0.20 ≤ ns ≤ 0.70): optimal range; most high-performing ads fall here
  - `sparse` (ns > 0.70): excessive empty space — wastes attention real estate
  - Google-hard-fail flag: `google_blank_space_fail: bool` = `ns > 0.80`

### UI pattern

- **Google Ads**: No visual tool; the threshold is documented in the help article and enforced implicitly by the Ad Strength score.
- **AdCreative.ai**: Attention heatmap overlay — areas with no red/orange heatmap coverage are de facto negative space. Not labeled as such.
- **Our target**: Three UI elements:
  1. On the image thumbnail, render a two-color pixel classification overlay (toggle on/off): semantic content pixels in green, empty/background pixels in grey.
  2. A large circular progress dial showing "Negative Space: 42%" with the optimal range (30–65%) highlighted as a green arc.
  3. Tier badge: `cluttered` (red), `balanced` (green), `sparse` (amber). If `google_blank_space_fail` is true, show a red "Google >80% Empty" warning banner.

### Public screenshots / demos

- Google RDA best practices (white space rule): https://support.google.com/google-ads/answer/9823397
- AdCreative.ai scoring page: https://www.adcreative.ai/creative-scoring
- Artversion negative space design article: https://artversion.com/blog/the-power-of-white-space-creating-visual-harmony-through-negative-space/
- Canva negative space design examples: https://www.canva.com/learn/negative-space/

## Help articles & source material

- https://support.google.com/google-ads/answer/9823397 (Google: "Blank space shouldn't exceed 80%")
- https://www.makeitbloom.com/blog/14-design-best-practices-for-display-ads-with-examples-2023/ (Display ad white space guidance)
- https://artversion.com/blog/achieve-striking-visual-balance-with-negative-space/ (Design theory)
- https://artversion.com/blog/the-power-of-white-space-creating-visual-harmony-through-negative-space/ (White space in advertising)
- https://www.designyourway.net/blog/positive-space-vs-negative-space/ (Positive vs. negative space)
- https://www.skillshare.com/en/blog/what-is-negative-space-design-psychology/ (Psychology of negative space)
- https://support.creativex.com/hc/en-us/articles/27431105771803-Guidelines-Overview (CreativeX guidelines overview)
- https://arxiv.org/abs/2005.09007 (U2-Net — used for Method A foreground mask)
- https://www.adcreative.ai/post/how-does-ai-scoring-transform-ad-creatives-in-digital-marketing

## Pros / cons / flaws

### What competitors do well

- Google's 80% upper bound is the only hard, documented threshold in the industry — gives a clear line for the `google_blank_space_fail` flag.
- AdCreative.ai's saliency heatmap approach is perceptually grounded: sparse heatmap = high negative space, regardless of whether the background is white, a photograph, or a gradient.
- Celtra's template system enforces composition rules at creation time (before any analysis is needed), which is the most efficient intervention point.

### Where they fall short

- No competitor explicitly penalizes the **under-negative-space** case (cluttered / too dense). The Google 80% rule only covers excess empty space. No public tool flags "your ad is too cluttered."
- Saliency-based negative space detection conflates "intentional white space" (brand-intentional breathing room, often used in luxury ads) with "wasted space." AdCreative.ai's dataset is biased toward performance-driven DTC ads; luxury/fashion creative is underrepresented.
- None of the tools expose the negative space percentage as a raw number — they fold it into broader composition scores. This makes the signal unauditable.
- Post-spend tools (Marpipe) can tell you that a "dense background" variant underperformed, but cannot tell you the negative space ratio that caused it.

### Edge cases they miss

- **Full-bleed photography**: a lifestyle photo with a person against a bokeh-blurred background. The background occupies 70% of pixels but is visually purposeful. U2-Net would mark the blurred area as background → `sparse` tier, even though the image is aesthetically strong.
- **Text-heavy ads**: an ad that is 60% text blocks on a solid background. The text is "semantic content" but the solid-color panel behind it would be classified as empty by Method B (low variance). Should be classified as filled, not empty.
- **Split-color backgrounds**: an ad with a solid blue upper half and solid white lower half. Low variance in both halves → Method B classifies both as empty → over-reports negative space. Method A (U2-Net) would handle this better.
- **Intentional asymmetry**: luxury brand ads often use extreme negative space (80–90% empty, single product centered) as a deliberate brand signal. The metric should optionally accept a `brand_style` parameter (e.g., `luxury`) that shifts the optimal range.
- **Animated GIFs / video frames**: the "empty" frame at the beginning of a fade-in animation would score as nearly 100% negative space. Only the representative keyframe should be analyzed.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/negative-space
from pydantic import BaseModel, Field
from typing import Optional, Literal

NsMethod = Literal["u2net", "variance", "lab_chroma"]

class NegativeSpaceRequest(BaseModel):
    ad_id: int
    image_b64: str                   # base64-encoded JPEG/PNG, max 4 MB
    method: NsMethod = "u2net"       # preferred detection method
    # Optional: pass foreground_coverage from a prior criterion-09 call to skip re-inference
    foreground_coverage_override: Optional[float] = Field(None, ge=0.0, le=1.0)

class NegativeSpaceResponse(BaseModel):
    ad_id: int
    slug: str = "visual.negative_space"     # always this value
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[str] = Field(None, description="cluttered | balanced | sparse")
    negative_space_ratio: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Fraction of image pixels classified as empty/background")
    google_blank_space_fail: Optional[bool] = None   # True if ns_ratio > 0.80
    method_used: Optional[str] = None                # which method was actually used
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

**Primary path (method = "u2net")**: Reuse the same `onnxruntime.InferenceSession` for U2-Net already set up for criterion 09 (`model/multitask.py` is NOT used here). If `foreground_coverage_override` is provided in the request, skip U2-Net inference entirely:

```python
if request.foreground_coverage_override is not None:
    foreground_coverage = request.foreground_coverage_override
else:
    mask = run_u2net(image)          # same helper as criterion 09
    foreground_coverage = float((mask > 0.5).mean())
negative_space_ratio = 1.0 - foreground_coverage
```

**Fallback path (method = "variance")**: Pure OpenCV, no ML. Implement in `services/negative_space.py`:

```python
import cv2, numpy as np

def variance_negative_space(img_bgr: np.ndarray, window: int = 16, std_threshold: float = 8.0) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    h, w = gray.shape
    empty_windows = 0
    total_windows = 0
    for y in range(0, h - window, window):
        for x in range(0, w - window, window):
            patch = gray[y:y+window, x:x+window]
            if patch.std() < std_threshold:
                empty_windows += 1
            total_windows += 1
    return empty_windows / max(total_windows, 1)
```

**Fallback path (method = "lab_chroma")**: Convert to Lab color space, threshold on low chroma + low variance. Suitable for white/off-white background detection.

Score function (in `services/negative_space.py`):
```python
def ns_score(ns_ratio: float) -> float:
    if 0.30 <= ns_ratio <= 0.65:
        return 1.0
    elif ns_ratio < 0.30:
        return ns_ratio / 0.30
    else:
        return max(0.0, 1.0 - (ns_ratio - 0.65) / 0.35)
```

Tier assignment:
```python
def ns_tier(ns_ratio: float) -> str:
    if ns_ratio < 0.20:
        return "cluttered"
    elif ns_ratio > 0.70:
        return "sparse"
    else:
        return "balanced"
```

Dependencies: `onnxruntime>=1.17` (for u2net method), `opencv-python>=4.9`, `numpy>=1.26`, `Pillow>=10.0`. No additional packages beyond what criteria 08 and 09 already require.

### Next.js component

```
File: ui/src/components/application/ad-scoring/NegativeSpaceCard.tsx

Props interface:
  interface NegativeSpaceCardProps {
    adId: number;
    score: number | null;
    tier: "cluttered" | "balanced" | "sparse" | null;
    negativeSpaceRatio: number | null;   // 0.0–1.0
    googleBlankSpaceFail: boolean | null;
    methodUsed: string | null;
    imageUrl: string;
    nullWithReason?: string;
  }

Render:
  - Circular radial gauge (SVG arc) showing negativeSpaceRatio * 100 as a percentage.
    The arc is divided into color zones:
      - 0–20%: red (cluttered)
      - 20–30%: amber (borderline)
      - 30–65%: green (optimal)
      - 65–80%: amber (borderline sparse)
      - 80–100%: red (too sparse / Google fail)
    Pointer/needle shows the current value.
  - Tier badge below gauge: cluttered=red, balanced=green, sparse=amber
  - If googleBlankSpaceFail is true: red warning banner "Exceeds Google 80% empty threshold — may fail ad review"
  - Small label showing methodUsed (e.g., "Detected via: U2-Net" or "Detected via: Variance fallback")
  - If nullWithReason is set, show gray "N/A" badge with tooltip
  - Optional: toggle to show pixel classification overlay on the ad image
    (green overlay for foreground pixels, grey for background/empty pixels)
    — only available when method was "u2net" (mask data required)
```

### Failure mode

Return `score: null, tier: null, null_with_reason: "all_methods_failed"` when:
- U2-Net model file is missing (`model_file_missing`)
- U2-Net ONNX inference throws an exception
- AND the variance fallback also fails (e.g., OpenCV cannot decode the image)

Additional `null_with_reason` values:
- `"image_decode_error"` — base64 or PIL decode fails before any method is attempted
- `"image_too_small"` — image smaller than 32×32 px (variance windows cannot be computed)
- `"foreground_coverage_invalid"` — `foreground_coverage_override` provided but outside [0, 1]
