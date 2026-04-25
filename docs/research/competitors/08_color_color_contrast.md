# 08 — color.color_contrast

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Celtra | Creative Management Platform — Accessibility AI | https://celtra.com/blog/celtra-your-trusted-ads-design-tool/ | Creative management platform |
| AdCreative.ai | Creative Scoring AI (contrast sub-signal) | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| CreativeX | Creative Quality Score — contrast guideline | https://support.creativex.com/hc/en-us/articles/27431105771803 | Creative intelligence |
| Google Ads | Responsive Display Ad quality guidelines | https://support.google.com/google-ads/answer/9823397 | Self-serve platform |
| WebAIM | Contrast Checker (reference tool) | https://webaim.org/resources/contrastchecker/ | Accessibility tooling |
| accessibleweb.com | WCAG Color Contrast Checker | https://accessibleweb.com/color-contrast-checker/ | Accessibility tooling |
| Flashtalking by Mediaocean | Creative Intelligence (WCAG checks) | https://www.flashtalking.com/ | Ad serving + DCO |
| Smartly.io | Creative Predictive Potential | https://www.smartly.io/product-features/creative-predictive-potential | Enterprise creative automation |

## How they implement it

### Algorithm / model family

**Dominant color extraction — industry standard approach:**

All implementations use a variant of the following pipeline:

1. Resize image to 200×200 (or smaller) to normalize compute and reduce noise from texture.
2. Reshape to an (N, 3) array of sRGB pixel triplets.
3. Run K-Means clustering with K=5 to get cluster centroids (dominant colors) and cluster sizes (pixel counts).
4. Sort clusters by pixel-count descending. The two largest clusters are "dominant color 1" and "dominant color 2."
5. Convert each RGB centroid to relative luminance using the WCAG 2.1 formula:
   - Linearize each channel: `c_lin = c/12.92` if `c/255 ≤ 0.04045`, else `((c/255 + 0.055)/1.055)^2.4`
   - `L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin`
6. Compute contrast ratio: `(L_lighter + 0.05) / (L_darker + 0.05)`. Range: 1:1 (no contrast) to 21:1 (black on white).

**Celtra**: Documents using automated color contrast validation and auto-correction for WCAG compliance in ad creatives. Their AI flags and corrects text color when contrast ratio falls below 4.5:1. The dominant-color variant is implied by their "visual separation" features, though the exact implementation is not publicly documented.

**AdCreative.ai**: "Contrast" is named as one of the visual signals in their CNN component analysis. The heatmap feature shows attention concentration on high-contrast regions, implying saliency maps weighted by contrast gradients.

**CreativeX**: Contrast is listed as a scored dimension in their digital suitability framework. Exact algorithm not published; the support documentation implies a rule-based threshold check (pass/fail at a defined ratio) rather than a continuous score.

**Google Ads**: Responsive Display Ad best-practice guide states "Blank space shouldn't take up more than 80% of the image" and recommends visually distinct elements, but does not publish a contrast ratio threshold score. The Ad Strength signal incorporates image quality signals that correlate with contrast.

### Metric shape

- **WCAG standard**: 4.5:1 for normal text (AA), 7:1 for enhanced (AAA), 3:1 for large text and UI components.
- **Ad creative context**: 4.5:1 used as the minimum acceptable threshold by most tools; 3:1 used as the lower warning boundary.
- **Our target**: Return the raw contrast ratio (float, range 1.0–21.0) AND a normalized 0.0–1.0 score. Normalization: `score = min(ratio / 7.0, 1.0)` (7:1 = AAA = 1.0, 4.5:1 = ~0.64, 3:1 = ~0.43, below 3:1 = < 0.43).

  Buckets:
  - `insufficient` (ratio < 3.0): dominant colors too similar, image likely muddy or hard to scan
  - `marginal` (3.0 ≤ ratio < 4.5): passes large-text threshold, fails normal-text AA
  - `compliant` (4.5 ≤ ratio < 7.0): passes WCAG AA
  - `high_contrast` (ratio ≥ 7.0): passes WCAG AAA; strong visual separation

### UI pattern

- **WebAIM Contrast Checker**: Two color swatch pickers side-by-side + ratio readout + pass/fail badges for AA normal, AA large, AAA normal, AAA large. Simple, reference tool.
- **Celtra**: Inline warning badge in the design canvas when a text element's foreground-background contrast falls below threshold. Auto-suggest: clicking the badge proposes a corrected color.
- **AdCreative.ai**: Heatmap overlay on the creative (red = high attention concentration). High-contrast regions naturally attract more attention; low-contrast regions appear cooler on the heatmap.
- **Our target**: Side-by-side dominant color swatches (showing the two top K-Means centroids as square color chips) + contrast ratio readout (e.g., "5.3:1") + WCAG tier badge + normalized gauge (0–100). Optionally show K=5 palette strip.

### Public screenshots / demos

- WebAIM Contrast Checker demo: https://webaim.org/resources/contrastchecker/
- WCAG 2.1 success criterion 1.4.3: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- accessibleweb checker: https://accessibleweb.com/color-contrast-checker/
- Celtra AI features: https://www.marketingaiinstitute.com/blog/celtra-spotlight

## Help articles & source material

- https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html (WCAG 2.1 SC 1.4.3)
- https://webaim.org/articles/contrast/ (WCAG contrast theory + formula)
- https://pypi.org/project/wcag-contrast-ratio/ (Python library)
- https://github.com/gsnedders/wcag-contrast-ratio (reference Python implementation)
- https://docs.opencv.org/4.x/d1/d5c/tutorial_py_kmeans_opencv.html (K-Means in OpenCV)
- https://pyimagesearch.com/2014/05/26/opencv-python-k-means-color-clustering/ (PyImageSearch tutorial)
- https://charlesleifer.com/blog/using-python-and-k-means-to-find-the-dominant-colors-in-images/ (PIL + scikit-learn approach)
- https://medium.com/@gauravgupta_31859/python-approach-for-color-contrast-check-b8c3d9355043 (Python WCAG check walkthrough)
- https://celtra.com/blog/the-battle-of-the-cmps/ (Celtra contrast feature context)
- https://www.marketingaiinstitute.com/blog/celtra-spotlight (Celtra AI capabilities)

## Pros / cons / flaws

### What competitors do well

- Celtra's auto-correct feature is the most actionable: instead of just flagging low contrast, it proposes a corrected color, closing the feedback loop immediately.
- WebAIM / WCAG tooling is highly precise for two specific known colors (text + background). The math is fully standardized and reproducible.
- AdCreative.ai's heatmap approach indirectly captures contrast by correlating high-attention regions with contrast gradients, which is more perceptually grounded than raw WCAG ratio.

### Where they fall short

- K-Means dominant color extraction treats all image regions equally. For an ad where 60% of the image is a photograph and 40% is a colored banner, the two dominant colors may both come from the photograph (e.g., sky blue and skin tone), completely ignoring the banner's contrast with the background.
- WCAG ratio is defined for text-on-background pairs. When applied to image-level dominant colors it loses meaning: a high-contrast ratio between sky-blue and orange says nothing about whether the text is readable.
- K-Means is non-deterministic (random seed sensitivity). Competitors do not document seeding strategy. Two runs on the same image can return slightly different dominant colors.
- None of the tools weight dominant colors by spatial distribution (e.g., center-weighted sampling would better represent the "hero" portion of the ad).

### Edge cases they miss

- Images with a single dominant color (monochromatic product shots): K-Means returns two nearly identical centroids → ratio ≈ 1:1 → false `insufficient` score despite the image being intentionally minimal.
- Images with very high-saturation complementary color pairs (red/green, blue/orange) that achieve 4.5:1 contrast but are visually harsh and cause eye strain — technically passes WCAG, aesthetically fails ad quality.
- Dark mode / light mode variants of the same creative: same structural contrast but inverted luminance polarity; should score identically but naive implementations may differ slightly due to gamma linearization direction.
- Photographic gradients: the most perceptually prominent transition (e.g., dark product on light background) may not match the two largest K-Means clusters.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/color-contrast
from pydantic import BaseModel, Field
from typing import Optional

class ColorContrastRequest(BaseModel):
    ad_id: int
    image_b64: str             # base64-encoded JPEG/PNG, max 2 MB
    k_clusters: int = 5        # number of K-Means clusters; 5 is standard

class DominantColor(BaseModel):
    rgb: list[int]             # [R, G, B] 0-255
    hex: str                   # e.g. "#3A7BD5"
    pixel_fraction: float      # fraction of image pixels in this cluster

class ColorContrastResponse(BaseModel):
    ad_id: int
    slug: str = "color.color_contrast"   # always this value
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    contrast_ratio: Optional[float] = Field(None, description="WCAG contrast ratio, range 1.0–21.0")
    wcag_tier: Optional[str] = Field(None, description="insufficient | marginal | compliant | high_contrast")
    dominant_color_1: Optional[DominantColor] = None
    dominant_color_2: Optional[DominantColor] = None
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

Do **not** route through `model/multitask.py`. This metric is fully deterministic OpenCV + scikit-learn.

Implementation in `services/color_contrast.py`:

```python
import cv2
import numpy as np
from sklearn.cluster import KMeans
from PIL import Image
from io import BytesIO
import base64

SEED = 42

def dominant_colors(image_b64: str, k: int = 5):
    img_bytes = base64.b64decode(image_b64)
    img = Image.open(BytesIO(img_bytes)).convert("RGB")
    img = img.resize((200, 200), Image.LANCZOS)
    pixels = np.array(img).reshape(-1, 3).astype(np.float32)
    km = KMeans(n_clusters=k, random_state=SEED, n_init=10)
    km.fit(pixels)
    counts = np.bincount(km.labels_, minlength=k)
    order = np.argsort(-counts)
    centroids = km.cluster_centers_[order].astype(int)
    fracs = counts[order] / counts.sum()
    return centroids, fracs

def relative_luminance(rgb: np.ndarray) -> float:
    c = rgb / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return float(0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2])

def wcag_contrast(rgb1, rgb2) -> float:
    L1 = relative_luminance(np.array(rgb1, dtype=float))
    L2 = relative_luminance(np.array(rgb2, dtype=float))
    lighter, darker = max(L1, L2), min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)
```

Dependencies: `opencv-python>=4.9`, `scikit-learn>=1.4`, `Pillow>=10.0`, `numpy>=1.26`.

Normalization: `score = min(contrast_ratio / 7.0, 1.0)`.

Tier thresholds: `ratio < 3.0` → `insufficient`; `3.0 ≤ ratio < 4.5` → `marginal`; `4.5 ≤ ratio < 7.0` → `compliant`; `ratio ≥ 7.0` → `high_contrast`.

### Next.js component

```
File: ui/src/components/application/ad-scoring/ColorContrastCard.tsx

Props interface:
  interface ColorContrastCardProps {
    adId: number;
    score: number | null;          // 0.0–1.0
    contrastRatio: number | null;  // e.g. 5.3 (displayed as "5.3:1")
    wcagTier: "insufficient" | "marginal" | "compliant" | "high_contrast" | null;
    dominantColor1: { rgb: [number,number,number]; hex: string; pixelFraction: number } | null;
    dominantColor2: { rgb: [number,number,number]; hex: string; pixelFraction: number } | null;
    nullWithReason?: string;
  }

Render:
  - Two large color swatches side by side (40×40px divs with backgroundColor set to hex value),
    each labeled with hex code and pixel fraction percentage below
  - Large ratio readout in the center: "5.3 : 1" in a bold monospace font
  - WCAG tier badge: insufficient=red, marginal=amber, compliant=blue, high_contrast=green
    — badge text shows tier label + WCAG level (e.g., "AA Compliant")
  - Numeric gauge 0–100 (maps score * 100) — use Tailwind CSS progress bar (or equivalent component)
  - If nullWithReason is set, show gray "N/A" state with tooltip
  - Tooltip on ratio readout: "WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text"
```

### Failure mode

Return `score: null, contrast_ratio: null, null_with_reason: "image_decode_error"` when base64 decode or PIL open fails.

Additional `null_with_reason` values:
- `"image_too_small"` — image smaller than 10×10 px after decode
- `"kmeans_convergence_error"` — scikit-learn KMeans fails to converge (rare; retry with `n_init=20` before returning this)
- `"single_dominant_color"` — top 2 clusters have combined pixel fraction < 0.15 (image is nearly monochromatic; contrast ratio would be meaningless)
