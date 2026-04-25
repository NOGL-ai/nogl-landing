# 25 — cta.distraction_avoidance

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Brainsight | Clarity Score — visual clutter analysis | https://www.brainsight.app/post/why-visual-clarity-is-a-make-or-break-factor | Predictive eye-tracking |
| Neurons Inc | Predict AI — Cognitive Demand score | https://knowledge.neuronsinc.com/neurons-ai-metrics-and-explanations | Neuroscience-based creative testing |
| Attention Insight | Clarity Score + Focus Score — CTA distraction | https://attentioninsight.com/features/ | AI attention analytics |
| Vidmob | Creative Scoring — visual complexity tagging | https://vidmob.com/creative-scoring | Creative data platform |
| AdCreative.ai | Creative Scoring AI — clarity / focal point | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Lumen Research | Attention to CTA measurement | https://www.lumen-research.com/ | Attention analytics |
| OpenAI GPT-4o | Vision — clutter/distraction analysis via prompt | https://platform.openai.com/docs/guides/vision | Cloud VLM API |
| Salesforce BLIP-2 | VLM VQA — focal element analysis | https://huggingface.co/Salesforce/blip2-opt-2.7b | Open-source VLM |

## How they implement it

### Algorithm / model family

**Two-layer approach: (A) programmatic spatial entropy / saliency analysis, and (B) VLM distraction reasoning.**

**Approach A — Programmatic clutter analysis**

Neurons Inc explicitly states their Cognitive Demand metric measures "visual information viewers have to process" via pixel intensity dissimilarity/entropy. This is reproducible without a proprietary model:

```python
import cv2
import numpy as np
from scipy.stats import entropy as scipy_entropy

def compute_visual_entropy(frame_bgr: np.ndarray) -> float:
    """Spatial entropy as proxy for visual clutter. Higher = more cluttered."""
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    # Histogram entropy
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    hist = hist / hist.sum()
    return float(scipy_entropy(hist, base=2))   # bits; max ~8 for uniform image

def compute_edge_density(frame_bgr: np.ndarray) -> float:
    """Canny edge density as proxy for visual complexity."""
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1=50, threshold2=150)
    return float(edges.sum() / 255) / (frame_bgr.shape[0] * frame_bgr.shape[1])
```

Combine into a `clutter_index`:

```python
def clutter_index(frame_bgr: np.ndarray) -> float:
    """Returns 0.0 (clean) to 1.0 (extremely cluttered)."""
    ent = compute_visual_entropy(frame_bgr)    # 0–8 bits
    edge_d = compute_edge_density(frame_bgr)  # 0–1
    # Normalise: entropy 6+ = high clutter; edge density 0.15+ = high clutter
    norm_ent   = min(ent / 7.0, 1.0)
    norm_edge  = min(edge_d / 0.15, 1.0)
    return float(0.6 * norm_ent + 0.4 * norm_edge)
```

**CTA attention fraction** (Attention Insight method): define the CTA bounding box as an Area of Interest (AOI). Use a saliency model (e.g., `pySaliencyMap` or a pretrained ONNX saliency net such as `sam_resnet.onnx`) to get a saliency map. Compute the fraction of total saliency inside the CTA AOI:

```python
def cta_saliency_fraction(saliency_map: np.ndarray, cta_bbox: list) -> float:
    """
    saliency_map: 2D float32, values in [0,1], same size as frame.
    cta_bbox: [x1, y1, x2, y2] in pixel coordinates.
    Returns fraction of total saliency within the CTA region.
    """
    x1, y1, x2, y2 = [int(v) for v in cta_bbox]
    cta_region = saliency_map[y1:y2, x1:x2]
    total_sal = saliency_map.sum()
    if total_sal < 1e-6:
        return 0.0
    return float(cta_region.sum() / total_sal)
```

Attention Insight benchmark: CTA region should capture ≥ 3 % of total saliency (minimum threshold); ≥ 4 % is "excellent." If CTA captures < 3 % of saliency, the design has competing focal points distracting from the CTA.

**Approach B — VLM distraction reasoning**

VLM analysis produces a structured distraction assessment that goes beyond spatial entropy, identifying specific distractors (e.g., "busy patterned background," "multiple product thumbnails competing with CTA"):

```python
VLM_DISTRACTION_PROMPT = """Analyse this advertising creative for elements that may distract viewers
from the call-to-action (CTA). Consider:
1. Background complexity (busy pattern, multiple competing objects, cluttered layout)
2. Number of distinct focal points (faces, products, text blocks)
3. Whether one element clearly dominates the composition

Return JSON only:
{
  "distraction_level": "low" | "medium" | "high",
  "distraction_score": float (0.0=no distraction, 1.0=severe distraction),
  "competing_focal_points": integer (count of distinct visual attractors),
  "distractor_types": list of strings (e.g. ["busy_background", "multiple_products", "text_overload"]),
  "cta_visibility": "clear" | "partially_obscured" | "buried"
}"""
```

Use GPT-4o for highest accuracy or BLIP-2 with instruction-tuned prompting for local inference. For BLIP-2, split into multiple yes/no VQA questions to avoid hallucination on open-ended prompts:

```python
questions = [
    "Does this image have a cluttered or busy background? Answer yes or no.",
    "Are there more than two distinct focal points competing for attention? Answer yes or no.",
    "Is the call-to-action button or text clearly visible? Answer yes or no.",
]
```

**Hybrid scoring** (recommended):

```python
def distraction_avoidance_score(
    clutter_idx: float,          # programmatic, 0–1 (higher = more cluttered)
    cta_sal_frac: float,         # programmatic, 0–1 (higher = better CTA salience)
    vlm_distraction_score: float # VLM, 0–1 (higher = more distraction)
) -> float:
    """Returns distraction_avoidance_score in [0,1]. 1.0 = no distraction, perfect CTA focus."""
    programmatic = (1.0 - clutter_idx) * 0.5 + cta_sal_frac * 0.5
    combined = 0.4 * programmatic + 0.6 * (1.0 - vlm_distraction_score)
    return round(combined, 3)
```

### Metric shape

| Metric | Type | Range | Interpretation |
|---|---|---|---|
| `distraction_avoidance_score` | float | 0.0 – 1.0 | 1.0 = clean, CTA-focused; 0.0 = severely cluttered |
| `distraction_level` | enum | `low`, `medium`, `high` | Tier bucket; low ≥ 0.65, medium 0.35–0.65, high < 0.35 |
| `clutter_index` | float | 0.0 – 1.0 | Programmatic entropy+edge density score |
| `cta_saliency_fraction` | float | 0.0 – 1.0 | Fraction of total saliency in CTA region; < 0.03 = failing |
| `competing_focal_points` | int | 0 – N | Count of distinct visual attractors detected by VLM |
| `distractor_types` | list[str] | — | E.g. `["busy_background", "text_overload", "multiple_faces"]` |
| `cta_visibility` | enum | `clear`, `partially_obscured`, `buried` | VLM assessment of CTA findability |

Threshold mapping:
- `distraction_avoidance_score` ≥ 0.65 → `low` distraction (passing)
- 0.35 – 0.65 → `medium` distraction (needs review)
- < 0.35 → `high` distraction (failing, CTA likely not reached)

Brainsight Clarity Score: "low scores mean customers will experience your design as cluttered and hard to understand." Neurons Cognitive Demand: scores 0–24 = low complexity (clean), 75–100 = high complexity (cluttered).

### UI pattern

- **Distraction overlay**: heatmap of the saliency model output rendered semi-transparently over the creative thumbnail. CTA bounding box outlined in green if `cta_saliency_fraction ≥ 0.03`, orange if borderline, red if below threshold.
- **Clutter meter**: horizontal bar gauge from 0 (clean) to 1 (cluttered) for `clutter_index`. Fills red beyond 0.7.
- **Tier badge**: `LOW DISTRACTION` (green) / `MEDIUM` (amber) / `HIGH DISTRACTION` (red) as the primary card header element.
- **Distractor chips**: tags listing each entry in `distractor_types` — e.g. `busy_background`, `text_overload` — displayed as coloured chips below the score.
- **CTA focus callout**: stat box showing `cta_saliency_fraction` as a percentage with label "CTA attention share" and a benchmark line at 3 %.
- **Focal points count**: numeric badge "N competing focal points" coloured by severity (1 = green, 2 = amber, 3+ = red).

### Public screenshots / demos

- Brainsight clarity score and visual clutter analysis: https://www.brainsight.app/post/why-visual-clarity-is-a-make-or-break-factor
- Attention Insight clarity score + focus map features: https://attentioninsight.com/features/
- Neurons Inc cognitive demand metric explanation: https://knowledge.neuronsinc.com/neurons-ai-metrics-and-explanations
- Neurons Inc attention heatmap interpretation: https://knowledge.neuronsinc.com/neurons-ai-heatmaps-and-interpretation
- Attention Insight heatmap and CTA attention guide: https://socialtrait.com/blog/from-views-to-clicks-how-to-predict-ad-performance-using-ai-attention-heatmaps

## Help articles & source material

- Brainsight visual clarity critical for attention: https://www.brainsight.app/post/why-visual-clarity-is-a-make-or-break-factor
- Attention Insight features (Clarity Score, Focus Score, CTA detection): https://attentioninsight.com/features/
- Attention Insight FAQ (CTA minimum 3 % attention threshold): https://attentioninsight.com/faq/
- Neurons AI metrics and explanations (Cognitive Demand definition): https://knowledge.neuronsinc.com/neurons-ai-metrics-and-explanations
- Neurons attention heatmaps and interpretation: https://knowledge.neuronsinc.com/neurons-ai-heatmaps-and-interpretation
- Brainsight gaze plots optimizing visual hierarchy: https://www.brainsight.app/post/gaze-plots-optimizing-visual-hierarchy
- Attention metrics in digital advertising 2025 (Britopian): https://www.britopian.com/data/attention-metrics/
- Why visual clarity is make-or-break in UX and marketing: https://www.brainsight.app/post/why-visual-clarity-is-a-make-or-break-factor
- Predictive eye-tracking for ad pre-testing (Brainsight guide): https://www.brainsight.app/post/how-to-pre-test-benchmark-ads
- OpenAI GPT-4o vision guide: https://platform.openai.com/docs/guides/vision
- BLIP-2 HuggingFace model card: https://huggingface.co/Salesforce/blip2-opt-2.7b
- Visual complexity and attention entropy in VLMs: https://openaccess.thecvf.com/content/ICCV2025/papers/Zhang_Beyond_Text-Visual_Attention_Exploiting_Visual_Cues_for_Effective_Token_Pruning_ICCV_2025_paper.pdf

## Pros / cons / flaws

### What competitors do well

- Brainsight's Clarity Score maps directly to viewer experience: low Clarity = customers experience the design as cluttered. The 94 % accuracy against live eye-tracking validates the AI saliency approach.
- Attention Insight's minimum 3 % CTA attention threshold is a concrete, actionable benchmark — the first published numeric threshold for this criterion in the industry.
- Neurons Inc's Cognitive Demand metric is scientifically grounded (EEG correlation) — the entropy-based pixel dissimilarity measure can be reproduced programmatically.
- Vidmob's frame-by-frame element tagging allows identifying *which specific element* is distracting (e.g., "product image in top-left is getting more attention than CTA in bottom-right").

### Where they fall short

- Brainsight and Neurons measure where a hypothetical viewer would look, not whether existing visual elements are distracting from the CTA specifically. They don't name the distractor.
- Attention Insight's CTA AOI analysis requires the user to manually draw the CTA region — no automatic CTA detection integrated into the distraction workflow.
- None of the tools expose `competing_focal_points` count as a structured metric; all surface it only indirectly through heatmap visualisation.
- Vidmob tags elements but does not compute a distraction score — the correlation between "many tagged elements" and distraction requires manual analysis by the user.
- No competitor uses a VLM to identify the specific *type* of distractor (pattern background vs. multiple faces vs. text overload) — they only provide a general clutter score.

### Edge cases they miss

- **Minimalist ads with one large off-brand focal point**: low edge density scores "clean" but a single large face or object draws all attention away from a small CTA. Entropy-only metrics miss this — need saliency fraction check even when overall clutter is low.
- **Dark/nighttime background**: Canny edge detection misses soft-light boundaries in low-contrast dark images. Use adaptive thresholding (`cv2.adaptiveThreshold`) rather than fixed Canny thresholds.
- **Text-heavy ads** (e.g., legal disclaimers filling 30 % of frame): high visual entropy from text but the text is understood by viewers as fine-print and does not actually attract fixations. Tag text regions separately and down-weight their contribution to `clutter_index`.
- **Animated/video ads**: clutter can vary dramatically by frame — the first frame may be clean while the body of the ad is extremely cluttered. Score each sampled frame and report `max_clutter_index` (worst frame) and `mean_clutter_index` (average) separately.
- **CTA at the very edge of frame** (common on vertical mobile ads where CTA is partially off-screen): saliency fraction will be artificially low regardless of clutter. Detect this case and add a note `cta_near_edge_boundary: true`.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class CtaDistractionAvoidanceRequest(BaseModel):
    asset_id: str
    cta_region: Optional[List[float]] = Field(
        default=None,
        description="Normalised [x1,y1,x2,y2] of CTA bbox in [0,1]. If null, auto-detected from criterion 06 result or skipped.")
    use_vlm: bool = Field(default=True,
        description="Run VLM distraction analysis in addition to programmatic scoring")
    vlm_backend: Literal["blip2", "gpt4o"] = Field(default="blip2")
    sample_fps: int = Field(default=3, ge=1, le=10,
        description="Frames per second for video clutter sampling")

class CtaDistractionAvoidanceScore(BaseModel):
    slug: Literal["cta.distraction_avoidance"] = "cta.distraction_avoidance"
    distraction_avoidance_score: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="1.0 = no distraction; 0.0 = severely cluttered, CTA buried")
    distraction_level: Optional[Literal["low", "medium", "high"]] = None
    clutter_index: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Programmatic entropy+edge density; 0=clean, 1=cluttered")
    cta_saliency_fraction: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Fraction of total saliency captured by CTA region; null if no CTA region provided")
    competing_focal_points: Optional[int] = Field(None, ge=0,
        description="Count of distinct visual attractors detected by VLM")
    distractor_types: Optional[List[str]] = Field(None,
        description="E.g. ['busy_background', 'multiple_faces', 'text_overload']")
    cta_visibility: Optional[Literal["clear", "partially_obscured", "buried"]] = None
    cta_near_edge_boundary: bool = Field(default=False)
    null_with_reason: Optional[str] = Field(None)
```

**Endpoint**: `POST /score/cta/distraction-avoidance`

### ONNX / model dependency

- **Programmatic path**: `cv2.calcHist`, `cv2.Canny`, `scipy.stats.entropy` — no ONNX needed.
- **Saliency model**: use `pySaliencyMap` (pip: `pysaliency`) or export a lightweight saliency network to ONNX. A suitable lightweight model is `UNISAL` or `SimpleNet-Saliency` exportable to `model/weights/saliency.onnx`. Input: `[1, 3, 224, 224]` normalised RGB; output: `[1, 1, H, W]` saliency map. Load once in `model/multitask.py` CreativeScorer:
  ```python
  self.saliency_session = ort.InferenceSession("model/weights/saliency.onnx")
  ```
- **VLM path (BLIP-2)**: reuse the `self.blip2_model` already added for criterion 24 (`color.emotional_color_effect`). Both criteria can share the same loaded BLIP-2 instance if processed in the same scoring pass.
- **VLM path (GPT-4o)**: reuse `services/vlm_client.py` established for criterion 24.
- CTA bounding box: pulled from criterion 06/07 result passed as request param. No redundant detection needed if the multi-criterion scoring pipeline is called in order.

### Next.js component

**Filename**: `CtaDistractionAvoidanceCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/CtaDistractionAvoidanceCard.tsx`

```typescript
interface CtaDistractionAvoidanceCardProps {
  slug: "cta.distraction_avoidance";
  distractionAvoidanceScore: number | null;  // 0–1 (1 = no distraction)
  distractionLevel: "low" | "medium" | "high" | null;
  clutterIndex: number | null;               // 0–1
  ctaSaliencyFraction: number | null;        // 0–1; show as percentage
  competingFocalPoints: number | null;       // integer count
  distractorTypes: string[] | null;          // chip list
  ctaVisibility: "clear" | "partially_obscured" | "buried" | null;
  ctaNearEdgeBoundary: boolean;
  nullWithReason?: string;
}
```

Render a tier badge `LOW DISTRACTION` / `MEDIUM` / `HIGH DISTRACTION` as the primary header element. Show `distractionAvoidanceScore` as a large `<RadialBarChart>` gauge (0–1, coloured green→red). Display `ctaSaliencyFraction` as a percentage stat box with benchmark line at 3 %. Show `distractorTypes` as small coloured chips. Show `competingFocalPoints` as a numbered badge (1 = green, 2 = amber, 3+ = red). If `ctaNearEdgeBoundary` is true, show a warning chip "CTA near frame edge."

### Failure mode

```json
{
  "slug": "cta.distraction_avoidance",
  "distraction_avoidance_score": null,
  "distraction_level": null,
  "clutter_index": null,
  "cta_saliency_fraction": null,
  "null_with_reason": "no_cta_region_detected_or_provided"
}
```

Other valid `null_with_reason` values: `"decoding_error"`, `"vlm_rate_limit_programmatic_only"`, `"image_too_small_under_100px"`, `"video_too_short_under_1s"`. When VLM is unavailable, fall back to programmatic-only score using `clutter_index` alone; set `analysis_method: "programmatic_only"` (add this field if VLM was expected but failed).
