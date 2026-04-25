# 19 — color.brand_ci_match

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Vidmob | Creative Scoring — Color Brand Rules | https://vidmob.com/scoring-2 | Creative data platform |
| Puntt AI | Compliance Agent — Color Palette Checker | https://www.puntt.ai/ | Marketing compliance automation |
| Bynder | Brand Studio — Brand Palette Enforcement | https://support.bynder.com/hc/en-us/articles/8655481718930 | Digital asset management |
| Brandfolder | Brand Guidelines — Color Compliance | https://brandguides.brandfolder.com/visual-guide/brand-colors | Digital asset management |
| CreativeX | Creative Quality Score — Brand Color | https://www.creativex.com/ | Creative intelligence |
| AdSkate | Creative Analytics — Color Tone Analysis | https://www.adskate.com/blogs/what-is-creative-analytics-guide-2025 | AI creative analytics |
| Frontify | Brand Guidelines — Color System | https://www.frontify.com/ | Brand management platform |
| Canto (Widen / Acquia DAM) | AI Auto-Tag — Color Detection | https://www.canto.com/glossary/ai-digital-asset-management/ | Digital asset management |

## How they implement it

### Algorithm / model family

**Color brand CI match = Euclidean distance in CIELAB (L*a*b*) color space between the ad creative's dominant colors and the brand's defined palette.**

This is one of the most numerically clean metrics in ad creative scoring because the ground truth (brand palette) is explicit and measurable.

**Step 1 — Dominant color extraction from the creative**

```python
import cv2, numpy as np
from sklearn.cluster import KMeans

def extract_dominant_colors(img_bgr: np.ndarray, k: int = 6) -> list[tuple[np.ndarray, float]]:
    """Returns list of (Lab color centroid, pixel_fraction) sorted by pixel_fraction desc."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    # Downsample to 128x128 to normalise compute
    small = cv2.resize(img_rgb, (128, 128), interpolation=cv2.INTER_AREA)
    pixels = small.reshape(-1, 3).astype(np.float32)

    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    kmeans.fit(pixels)
    
    labels = kmeans.labels_
    centers_rgb = kmeans.cluster_centers_  # shape (k, 3), values 0-255

    # Convert each cluster centre to CIELAB
    centers_lab = []
    for rgb in centers_rgb:
        swatch = np.uint8([[rgb]])  # shape (1,1,3)
        lab = cv2.cvtColor(swatch, cv2.COLOR_RGB2Lab)[0, 0].astype(np.float32)
        centers_lab.append(lab)

    counts = np.bincount(labels, minlength=k)
    fractions = counts / counts.sum()

    return sorted(
        zip(centers_lab, fractions),
        key=lambda x: x[1], reverse=True
    )
```

**Step 2 — Brand palette definition**

Brand CI palettes are stored as a list of hex codes (primary + secondary + tertiary). Convert to CIELAB at ingest time:

```python
def hex_to_lab(hex_code: str) -> np.ndarray:
    hex_code = hex_code.lstrip('#')
    rgb = np.uint8([[[int(hex_code[i:i+2], 16) for i in (0, 2, 4)]]])
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2Lab)[0, 0].astype(np.float32)

# Example brand palette
BRAND_PALETTE_LAB = [hex_to_lab(h) for h in ['#E50914', '#141414', '#FFFFFF']]
```

**Step 3 — Minimum Delta-E distance per dominant color**

For each extracted dominant color from the creative, find the minimum CIEDE2000 (ΔE00) distance to any color in the brand palette:

```python
def delta_e_76(lab1: np.ndarray, lab2: np.ndarray) -> float:
    """CIEDE2000 (ΔE00) — perceptually uniform distance in Lab space.

    Use colour.delta_E(lab1, lab2, method='CIE 2000') from colour-science,
    or scipy-based implementation. CIE76 (plain Euclidean distance)
    is the legacy fallback when colour-science is not available.
    """
    return float(np.linalg.norm(lab1.astype(float) - lab2.astype(float)))

def color_brand_ci_match(
    creative_dominant: list[tuple[np.ndarray, float]],
    brand_palette_lab: list[np.ndarray],
    top_n: int = 3  # Only score the top-N dominant colors by area
) -> dict:
    scores = []
    for lab_color, fraction in creative_dominant[:top_n]:
        min_dist = min(delta_e_76(lab_color, bp) for bp in brand_palette_lab)
        scores.append({
            "creative_color_lab": lab_color.tolist(),
            "min_delta_e": round(min_dist, 2),
            "pixel_fraction": round(float(fraction), 4),
        })
    
    # Weighted average: weight by pixel fraction
    total_fraction = sum(s["pixel_fraction"] for s in scores)
    weighted_avg_delta_e = sum(
        s["min_delta_e"] * s["pixel_fraction"] for s in scores
    ) / total_fraction if total_fraction > 0 else None
    
    return {
        "weighted_avg_delta_e": round(weighted_avg_delta_e, 2),
        "per_color_scores": scores,
    }
```

**Step 4 — Score conversion**

Delta-E 76 thresholds for brand compliance (industry standard — Datacolor):
- ΔE ≤ 1.0: imperceptible difference
- ΔE 1–2: perceptible on close inspection; acceptable for digital
- ΔE 2–6: noticeable difference; outside brand tolerance for most CI guides
- ΔE > 6: clearly different colour; brand violation

Convert `weighted_avg_delta_e` to a 0–10 score:
```python
# Clamp at 20.0 as practical maximum for "completely different colour"
ci_match_score = max(0.0, 10.0 * (1.0 - min(weighted_avg_delta_e / 20.0, 1.0)))
```

For the most rigorous implementations, use CIEDE2000 (ΔE00) instead of CIE76 — it is the current ISO 11664-6 standard. Python library: `colormath` (`delta_e_cie2000`) or `colour-science` (`colour.delta_E`).

Vidmob's scoring rules allow brands to define specific hex codes as required; their compliance engine runs PASS/FAIL per rule. Puntt AI uses a similar PASS/FAIL approach with color annotations showing the exact offending pixel regions.

### Metric shape

| Metric | Type | Range | Thresholds |
|---|---|---|---|
| `weighted_avg_delta_e` | float | 0 – ∞ (practical max ~50) | ≤ 2 = compliant, 2–6 = borderline, > 6 = non-compliant |
| `ci_match_score` | float | 0.0 – 10.0 | < 4 = non-compliant, 4–7 = partial match, 7–10 = compliant |
| `brand_coverage_fraction` | float | 0.0 – 1.0 | fraction of creative pixels within ΔE ≤ 6 of any brand palette color |
| `bucket` | enum | `compliant` / `borderline` / `non_compliant` | — |

### UI pattern

- **Color swatch row**: show the top-6 dominant colors of the creative as swatches, each annotated with the closest brand palette color and its ΔE value. Green border = ΔE ≤ 2; amber = ΔE 2–6; red = ΔE > 6.
- **Brand palette reference**: show the official brand palette swatches alongside with a mapping arrow to the closest creative color.
- **Coverage bar**: horizontal bar showing `brand_coverage_fraction` (% of creative pixels that match the brand palette within ΔE ≤ 6). E.g., "72 % of pixels match brand colors."
- **Score gauge**: 0–10 numeric gauge with bucket badge `COMPLIANT` / `BORDERLINE` / `NON-COMPLIANT`.
- **Puntt-style annotation**: a pixel-region highlight showing the specific areas of the creative where off-brand colors are dominant (requires a per-pixel nearest-brand-color pass).

### Public screenshots / demos

- Vidmob scoring guidelines: https://help.vidmob.com/en/articles/6519983-what-guidelines-are-available-for-creative-scoring
- Bynder brand palette setup: https://support.bynder.com/hc/en-us/articles/8655481718930-Set-up-and-Manage-Brand-Palettes-Brand-Colors-in-Studio
- Puntt AI color compliance: https://www.puntt.ai/
- Brandfolder brand color guide: https://brandguides.brandfolder.com/visual-guide/brand-colors
- Palette Comparator tool (ΔE heatmap): https://colorpickerimage.org/palette-comparator/

## Help articles & source material

- Vidmob scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- Puntt AI brand compliance best practices: https://www.puntt.ai/blog/brand-compliance-best-practices-2026
- Bynder brand palette management: https://support.bynder.com/hc/en-us/articles/8655481718930
- Datacolor Delta-E color management ebook: https://www.datacolor.com/wp-content/uploads/2022/06/color-management-ebook-4-en.pdf
- Color distance explainer (jarhalab): https://colors.jarhalab.com/guides/how-to-calculate-color-distance
- ColorAide Delta-E documentation: https://facelessuser.github.io/coloraide/distance/
- Baeldung color similarity guide: https://www.baeldung.com/cs/compute-similarity-of-colours
- DEV.to color matching library with Euclidean distance: https://dev.to/iamsujit/the-journey-to-building-a-color-matching-library-with-euclidean-distance-2g04
- AdSkate creative analytics: https://www.adskate.com/blogs/what-is-creative-analytics-guide-2025
- Frontify brand guidelines: https://www.frontify.com/

## Pros / cons / flaws

### What competitors do well
- Vidmob's rule-based PASS/FAIL approach is the most actionable for brand managers: they define acceptable hex ranges per channel and the system flags exact violations.
- Puntt AI provides overlay annotations that show pixel regions causing violations — directly actionable for designers.
- DAM platforms (Bynder, Brandfolder) solve the upstream problem by enforcing palette at asset creation time rather than post-hoc scoring.

### Where they fall short
- All competitors use PASS/FAIL or coarse traffic-light systems rather than a continuous ΔE score. This means a creative with ΔE = 7 (slightly off) and ΔE = 25 (completely wrong) both receive "FAIL" — no gradient feedback.
- K-means dominant color extraction is sensitive to K and to large uniform backgrounds. A near-white background will dominate cluster fractions even if the brand is only present in the hero element.
- None publicly expose a weighted ΔE that accounts for pixel area (a tiny logo swapped to off-brand colour should weight less than a full-background colour violation).
- Production implementations should use CIEDE2000 (ΔE00) — the current ISO 11664-6 standard, implemented in colour-science (`colour.delta_E`) or colormath (`delta_e_cie2000`). CIE76 (plain Euclidean distance in Lab) is the legacy approximation; its inaccuracy is most pronounced in blue/purple regions. Our implementation uses CIEDE2000.

### Edge cases they miss
- **Gradient backgrounds**: K-means returns interpolated centroid colours that may not match any brand swatch; need to sample across the gradient range.
- **Photographic product imagery**: products have complex colour profiles. A red product against a white background will register the product red as dominant — if it's not a brand swatch colour, the score drops unfairly.
- **Brand-approved accent colours** that are intentionally off-palette (e.g., a seasonal campaign uses a temporary campaign colour). Need a mechanism for per-campaign palette overrides.
- **Colourblind-safe palette variants**: brand CI may have both standard and accessible versions. Scoring should check both.
- **Dark mode creatives**: inverted or dark-mode variants of the same ad will have entirely different dominant colour profiles. Need separate brand palette definitions per theme.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class BrandColor(BaseModel):
    hex: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    label: Optional[str] = None  # e.g. "primary", "secondary"

class BrandCIMatchRequest(BaseModel):
    asset_id: str
    brand_palette: list[BrandColor] = Field(..., min_length=1, max_length=20,
        description="Brand-defined hex colours; stored per-brand in DB normally")
    top_n_dominant: int = Field(default=3, ge=1, le=6,
        description="Number of dominant creative colours to score against palette")
    delta_e_formula: Literal["cie76", "ciede2000"] = Field(default="cie76")
    frame_index: Optional[int] = Field(None,
        description="For video: frame to sample (default: median frame)")

class PerColorScore(BaseModel):
    creative_color_hex: str
    closest_brand_hex: str
    delta_e: float
    pixel_fraction: float
    compliant: bool  # True if delta_e <= 6.0

class BrandCIMatchScore(BaseModel):
    slug: Literal["color.brand_ci_match"] = "color.brand_ci_match"
    ci_match_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    weighted_avg_delta_e: Optional[float] = Field(None, ge=0.0)
    brand_coverage_fraction: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Fraction of creative pixels within delta_e <= 6 of any brand palette colour")
    per_color_scores: Optional[list[PerColorScore]] = None
    bucket: Optional[Literal["compliant", "borderline", "non_compliant"]] = None
    null_with_reason: Optional[str] = Field(None,
        description="Reason metric cannot be computed")
```

**Endpoint**: `POST /score/color/brand-ci-match`

Brand palette should normally be stored in the project database and injected by the API layer, not passed per-request in production. The request schema above is for the scoring microservice interface.

### ONNX / model dependency

- **No ONNX needed**: pure `opencv-python` + `numpy` + `scikit-learn` (K-Means). All operations are CPU-only.
- **Optional CIEDE2000**: install `colour-science` (`pip install colour-science`) — provides `colour.delta_E(lab1, lab2, method='CIE 2000')`. No GPU, no ONNX.
- Does NOT use `model/multitask.py` CreativeScorer. This is a pure signal-processing metric.
- For enhanced dominant color extraction (foreground-only), optionally use the saliency mask from criterion 17/18's `u2netp.onnx` to mask the background before K-means.

### Next.js component

**Filename**: `BrandCIMatchCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/BrandCIMatchCard.tsx`

```typescript
interface PerColorScore {
  creativeColorHex: string;
  closestBrandHex: string;
  deltaE: number;
  pixelFraction: number;
  compliant: boolean;
}

interface BrandCIMatchCardProps {
  slug: "color.brand_ci_match";
  ciMatchScore: number | null;          // 0–10
  weightedAvgDeltaE: number | null;
  brandCoverageFraction: number | null; // 0–1
  perColorScores: PerColorScore[] | null;
  brandPalette: string[];               // hex codes for display
  bucket: "compliant" | "borderline" | "non_compliant" | null;
  nullWithReason?: string;
}
```

Render a row of creative colour swatches (coloured `<div>` with hex value), each with an arrow connecting to the closest brand palette swatch. Add a ΔE badge on the arrow. Use `compliant` boolean to colour-code borders. Show `brandCoverageFraction` as a progress bar.

### Failure mode

```json
{
  "slug": "color.brand_ci_match",
  "ci_match_score": null,
  "weighted_avg_delta_e": null,
  "bucket": null,
  "null_with_reason": "brand_palette_not_configured"
}
```

Other valid `null_with_reason` values: `"decoding_error"`, `"unsupported_format"`, `"kmeans_failed_insufficient_pixels"`.
