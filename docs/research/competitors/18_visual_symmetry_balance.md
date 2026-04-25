# 18 — visual.symmetry_balance

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Dragonfly AI | Creative Testing — Visual Weight Scoring | https://dragonflyai.co/ | Biological AI creative analytics |
| Neurons Inc | Predict AI — Cognitive Demand Score | https://www.neuronsinc.com/neurons-ai | Neuroscience-based creative testing |
| CreativeScore.ai | Enterprise Creative Intelligence | https://www.creativescore.ai/ | Creative performance platform |
| AdCreative.ai | Creative Scoring AI — Layout Analysis | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Hawky | Creative Analytics — Visual Hierarchy | https://hawky.ai/blog/best-ai-tools-ad-creative-analysis | AI creative analytics |
| Attention Insight | Focus Score — Hotspot Distribution | https://attentioninsight.com/features/ | Predictive eye-tracking |
| Visily | UI Design — Asymmetry vs Symmetry Scoring | https://www.visily.ai/blog/asymmetrical-symmetrical-ui-design/ | UI design intelligence |
| ResearchGate (VME model) | Visual Moment Equilibrium — Academic | https://www.researchgate.net/publication/272752870_Study_of_balance_of_images_using_visual_weight | Academic research |

## How they implement it

### Algorithm / model family

**Bilateral visual balance = the visual weight on the left half vs right half of the image, without requiring mirror symmetry.**

The key insight: "balance" is not the same as "symmetry." A large dark object on the left can be balanced by a smaller but brighter object on the right. Visual weight depends on luminance, colour contrast, size, and position.

**Step 1 — Visual weight map generation**

Convert the image to a single-channel weight map using a linear combination:

```python
import cv2, numpy as np

img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

# Luminance channel (perceptual)
lum = 0.2126 * img_rgb[:, :, 0] + 0.7152 * img_rgb[:, :, 1] + 0.0722 * img_rgb[:, :, 2]

# Local contrast (edge intensity adds visual weight)
edges = cv2.Canny((lum * 255).astype(np.uint8), 50, 150).astype(np.float32) / 255.0

# Saturation (saturated colours draw more attention)
img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV).astype(np.float32) / 255.0
saturation = img_hsv[:, :, 1]

# Combine into a single weight map
weight_map = 0.5 * lum + 0.3 * edges + 0.2 * saturation
```

For higher accuracy, replace or augment with a saliency model output (U2-Net or Dragonfly AI's biologically-inspired saliency). Dragonfly AI's approach is based on neural architecture modelling of the visual cortex, assigning each pixel a numeric saliency value.

**Step 2 — Bilateral asymmetry computation**

Split the weight map down the vertical centre and compute total weight on each side:

```python
H, W = weight_map.shape
mid = W // 2

left_weight = weight_map[:, :mid].sum()
right_weight = weight_map[:, mid:].sum()

total_weight = left_weight + right_weight

# Balance ratio: 0.5 = perfectly balanced, 0.0 or 1.0 = all weight on one side
balance_ratio = left_weight / total_weight if total_weight > 0 else 0.5

# Imbalance score: 0.0 = perfect balance, 1.0 = complete imbalance
imbalance = abs(balance_ratio - 0.5) * 2.0  # maps [0, 0.5] -> [0, 1]

# Balance score (higher = better balanced)
balance_score = round((1.0 - imbalance) * 10, 2)  # 0.0–10.0
```

**Step 3 — Visual Moment Equilibrium refinement (optional)**

The academic Visual Moment Equilibrium (VME) model (ResearchGate 2022) improves on raw pixel weight by applying:
- A **nine-grid weighting system** (centre cells weighted higher; edges lower) — reflects that centre-heavy images feel less balanced.
- **Manhattan distance** from element centroids to the image centre.
- **Shape Sparsity Ratio** — corrects for the Gestalt closure principle (sparse shapes are perceived as lighter than their pixel coverage implies).

Dragonfly AI uses a proprietary saliency-based weight model trained on eye-tracking data; its "Overall Creative Effectiveness Score" incorporates balance as a sub-dimension.

Neurons Inc's "Cognitive Demand" score correlates with visual clutter/imbalance: high demand = many competing visual weights on different sides; low demand = either symmetrical or well-balanced layout.

### Metric shape

| Metric | Type | Range | Thresholds |
|---|---|---|---|
| `balance_ratio` | float | 0.0 – 1.0 | ideal near 0.50; warn if < 0.35 or > 0.65 |
| `imbalance` | float | 0.0 – 1.0 | 0 = perfect; > 0.30 = visually unbalanced |
| `balance_score` | float | 0.0 – 10.0 | < 4 = unbalanced, 4–7 = acceptable, 7–10 = balanced |
| `weight_centre_x` | float | 0.0 – 1.0 | normalised x position of visual weight centroid |
| `bucket` | enum | `balanced` / `slightly_unbalanced` / `unbalanced` | — |

### UI pattern

- **Split weight bar**: a horizontal bar divided at the centre; left fill = left_weight proportion (blue), right fill = right_weight proportion (orange). A tick mark at 50 %. Deviation from 50 % annotated as "Left-heavy: +18 %."
- **Weight heatmap overlay**: the `weight_map` rendered as a transparent warm-coloured overlay on the creative (similar to an attention heatmap). High-weight pixels are red/orange; low-weight pixels transparent.
- **Balance gauge**: circular gauge from 0–10, labelled "Visual Balance." Bucket badge: `BALANCED` (green) / `SLIGHTLY UNBALANCED` (amber) / `UNBALANCED` (red).
- **Centre-of-mass dot**: a single dot overlaid on the creative marking the visual weight centroid `(weight_centre_x, weight_centre_y)`. Ideal = near (0.5, 0.5). Arrow shows direction and magnitude of deviation from centre.

### Public screenshots / demos

- Dragonfly AI heatmap guide: https://dragonflyai.co/resources/blog/the-ultimate-heatmap-guide-make-smarter-design-decisions
- Neurons cognitive demand score: https://www.neuronsinc.com/insights/predict-ai-new-attention-aoi-scores-view-time-audience-reach-brand-performance
- Attention Insight features: https://attentioninsight.com/features/
- Visual weight and balance research: https://www.researchgate.net/publication/272752870_Study_of_balance_of_images_using_visual_weight

## Help articles & source material

- Dragonfly AI FAQs: https://dragonflyai.co/faqs
- Dragonfly AI biological algorithm: https://neonconsulting.tech/articles/spotlight-dragonfly
- Neurons Inc Cognitive Demand: https://knowledge.neuronsinc.com/how-neurons-attention-prediction
- Visual weight ultimate guide: https://www.numberanalytics.com/blog/ultimate-guide-visual-weight
- Visual moment equilibrium study: https://www.researchgate.net/publication/272752870_Study_of_balance_of_images_using_visual_weight
- scikit-image moments API: https://scikit-image.org/docs/stable/api/skimage.measure.html
- Balance in photography guide: https://greatbigphotographyworld.com/balance-in-photography/
- Visily symmetry vs asymmetry design: https://www.visily.ai/blog/asymmetrical-symmetrical-ui-design/
- RMCAD visual balance science: https://www.rmcad.edu/blog/the-science-of-composition-understanding-visual-balance/
- Hawky visual hierarchy scoring: https://hawky.ai/blog/best-ai-tools-ad-creative-analysis

## Pros / cons / flaws

### What competitors do well
- Dragonfly AI's biologically-grounded saliency model (trained on 10 years of eye-tracking at Queen Mary University of London) produces the most accurate visual weight map for its balance score.
- Neurons separates "cognitive demand" (how hard is it to process?) from "balance" conceptually — useful because a perfectly balanced but visually complex layout can still have high cognitive demand.
- Attention Insight's "Spread" sub-metric (distance between attention hotspots) is a useful proxy for balance without needing explicit weight computation.

### Where they fall short
- Raw pixel luminance weight maps over-weight dark, saturated backgrounds even when the designer uses them as neutral frames. Needs foreground/background segmentation.
- No competitor publicly reports separate top/bottom balance (radial balance vs. bilateral). Many ads intentionally shift weight toward the bottom (product) or top (logo), which a strict bilateral scorer will penalise unfairly.
- Competitors that use pure attention/saliency models conflate "attention-attracting" with "heavy" — a plain white area is attention-light but visually heavy in the sense of negative space / breathing room.

### Edge cases they miss
- **Dark background ads** (common in luxury/automotive): a near-black background with a centred white product will score perfectly balanced by weight but the background dominates pixel count and incorrectly inflates left or right weight if any vignette gradient is present.
- **Multi-panel / grid creatives** (carousel or split-screen): the vertical split heuristic is meaningless for a 2-column layout; need panel-aware segmentation.
- **Animated ads**: balance can oscillate frame-to-frame. Should report mean and variance of balance_score across frames, not just a single frame.
- **Intentional asymmetry as a design choice**: some high-performing ad styles (Bauhaus, avant-garde) deliberately break balance for tension. A low score is not necessarily a flaw.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class SymmetryBalanceRequest(BaseModel):
    asset_id: str
    use_saliency_map: bool = Field(default=False,
        description="Use U2-Net saliency for weight map instead of luminance+edges")
    frame_index: Optional[int] = Field(None,
        description="For video: which frame to analyse (default: median frame)")

class SymmetryBalanceScore(BaseModel):
    slug: Literal["visual.symmetry_balance"] = "visual.symmetry_balance"
    balance_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    balance_ratio: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Left-weight fraction of total weight; 0.5 = perfect balance")
    imbalance: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="0 = perfectly balanced, 1 = completely imbalanced")
    weight_centre_x: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Normalised x position of visual weight centroid")
    weight_centre_y: Optional[float] = Field(None, ge=0.0, le=1.0)
    bucket: Optional[Literal["balanced", "slightly_unbalanced", "unbalanced"]] = None
    null_with_reason: Optional[str] = Field(None,
        description="Reason metric cannot be computed")
```

**Endpoint**: `POST /score/visual/symmetry-balance`

### ONNX / model dependency

- **Baseline (no extra model)**: luminance + Canny edges + HSV saturation weight map — implemented entirely with `opencv-python` and `numpy`. No ONNX needed.
- **Enhanced**: U2-Net saliency ONNX (`u2netp.onnx`, ~4 MB) from `model/multitask.py` CreativeScorer. Reuse the `saliency_session` attribute added for criterion 17. The saliency output replaces the luminance channel in the weight map.
- `skimage.measure.moments` can compute the visual centroid analytically from the weight map (treat `weight_map` as a 2D intensity image, compute first-order moments).
- No GPU required; all operations are on downsampled 256×256 images for speed.

### Next.js component

**Filename**: `SymmetryBalanceCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/SymmetryBalanceCard.tsx`

```typescript
interface SymmetryBalanceCardProps {
  slug: "visual.symmetry_balance";
  balanceScore: number | null;          // 0–10
  balanceRatio: number | null;          // 0–1; 0.5 = perfect
  imbalance: number | null;             // 0–1
  weightCentreX: number | null;         // normalised 0–1
  weightCentreY: number | null;
  bucket: "balanced" | "slightly_unbalanced" | "unbalanced" | null;
  weightMapDataUrl?: string;            // base64 PNG heatmap overlay (optional)
  nullWithReason?: string;
}
```

Render a two-bar split widget (left vs right weight percentage), a score gauge 0–10, and optionally a semi-transparent heatmap overlay if `weightMapDataUrl` is provided. Add a centroid dot overlay at `(weightCentreX * imageWidth, weightCentreY * imageHeight)` on the creative thumbnail.

### Failure mode

```json
{
  "slug": "visual.symmetry_balance",
  "balance_score": null,
  "balance_ratio": null,
  "bucket": null,
  "null_with_reason": "decoding_error"
}
```

Other valid `null_with_reason` values: `"unsupported_format"`, `"image_too_small_under_32px"`.
