# 17 — visual.rule_of_thirds

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| AdCreative.ai | Creative Scoring AI — Composition Analysis | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Neurons Inc | Predict AI — Attention + Composition | https://www.neuronsinc.com/neurons-ai | Neuroscience-based creative testing |
| Attention Insight | AI Heatmaps — Focus Score | https://attentioninsight.com/features/ | Predictive eye-tracking |
| Brainsight | Predictive Attention API — Clarity Score | https://www.brainsight.app/features/api | Predictive eye-tracking |
| Dragonfly AI | Creative Testing — Attention Heatmaps | https://dragonflyai.co/ | Biological AI creative analytics |
| CreativeScore.ai | Enterprise Creative Intelligence | https://www.creativescore.ai/ | Creative performance platform |
| AdSkate | Creative Analytics — Composition Tags | https://www.adskate.com/blogs/what-is-creative-analytics-guide-2025 | AI creative analytics |
| Portland State / academic | Rule-of-Thirds Detection from Photograph (paper) | https://web.cecs.pdx.edu/~fliu/papers/ism2011.pdf | Computer vision research |

## How they implement it

### Algorithm / model family

**Rule-of-thirds alignment measures distance from subject centroid(s) to the four "power points" (grid intersections) of the RoT grid.**

The grid divides a W×H image with:
- Vertical lines at x = W/3 and x = 2W/3
- Horizontal lines at y = H/3 and y = 2H/3
- Four power points: (W/3, H/3), (2W/3, H/3), (W/3, 2H/3), (2W/3, 2H/3)

**Step 1 — Subject detection**

Detect up to 3 subject types in order of priority:
1. **Face centroids** — use YuNet face detection (ONNX-native via opencv_zoo) or RetinaFace. For each detected face, centroid = centre of bounding box `(x + w/2, y + h/2)`.
2. **Primary text block centroid** — run `pytesseract` or `easyocr` to get bounding boxes of text regions. Merge overlapping boxes; centroid of largest cluster.
3. **Salient object centroid** — U2-Net saliency (ONNX, ~176 MB) produces a soft mask; centroid = `np.average(np.indices(mask.shape), weights=mask)`.

Use the highest-priority subject type that yields a detection.

**Step 2 — Distance computation**

For each detected centroid `(cx, cy)`, compute the normalised distance to the nearest power point:

```python
power_points = [
    (W / 3, H / 3), (2 * W / 3, H / 3),
    (W / 3, 2 * H / 3), (2 * W / 3, 2 * H / 3),
]
# Normalise coordinates to [0, 1]
cx_n, cy_n = cx / W, cy / H
pp_n = [(x / W, y / H) for (x, y) in power_points]

distances = [math.sqrt((cx_n - px)**2 + (cy_n - py)**2) for (px, py) in pp_n]
min_distance = min(distances)  # 0.0 = perfectly on power point
```

The diagonal of the unit square is √2 ≈ 1.414. The farthest any point can be from all power points is ≈ 0.236 (image centre). Normalise `min_distance` to [0, 1] by dividing by 0.236 (the maximum possible distance from the nearest power point in a normalised frame), so a centred subject scores 1.0 (worst) and a perfectly placed subject scores 0.0 (best).

**Step 3 — Score conversion**

```python
rot_alignment = 1.0 - (min_distance / 0.236)  # 0 = centred (bad), 1 = on power point (perfect)
rot_score = round(rot_alignment * 10, 2)  # 0.0–10.0
```

Portland State ISM 2011 research uses a similar centroid-to-power-point distance as their primary composition feature alongside saliency map distances. Academic follow-up (ResearchGate 2024) adds interpretable geometric features: distance to lines as well as intersections.

AdCreative.ai wraps composition scoring (including RoT) inside its 450M-datapoint model; it does not expose raw geometric distances but produces a 1–100 composite score.

Neurons Inc focuses on attention heatmap correlation — if high-attention regions cluster around power points, RoT alignment is inferred implicitly via the saliency centroid method above.

### Metric shape

| Metric | Type | Range | Thresholds |
|---|---|---|---|
| `min_power_point_distance` | float | 0.0 – 0.236 (normalised) | ≤ 0.05 = excellent, 0.05–0.12 = good, > 0.12 = poor |
| `rot_alignment` | float | 0.0 – 1.0 | higher = better |
| `rot_score` | float | 0.0 – 10.0 | < 4 = centred (warn), 4–7 = acceptable, 7–10 = aligned |
| `subject_type` | enum | `face` / `text` / `saliency` / `none` | detection source |
| `nearest_power_point` | enum | `top_left` / `top_right` / `bottom_left` / `bottom_right` | which intersection |

### UI pattern

- **Grid overlay**: thin white 3×3 grid drawn over the creative thumbnail; detected subject centroid shown as a coloured dot (green if rot_score ≥ 7, amber if 4–7, red if < 4). The four power points are marked with small crosshairs.
- **Distance indicator**: a dashed line from the centroid dot to the nearest power point, with the pixel distance labelled.
- **Numeric score badge**: "Composition: 8.2 / 10" with a sub-label "Subject on power point."
- **Recommendation chip**: "Move subject ~48 px left to align with top-right power point" — derived from (cx - nearest_pp_x, cy - nearest_pp_y) delta.

### Public screenshots / demos

- AdCreative.ai creative scoring page: https://www.adcreative.ai/creative-scoring
- Neurons AI visual recommendations: https://www.neuronsinc.com/insights/visual-recommendations
- Attention Insight features page: https://attentioninsight.com/features/
- Rule-of-thirds detection paper: https://web.cecs.pdx.edu/~fliu/papers/ism2011.pdf
- Rule-of-thirds with geometric features paper: https://www.researchgate.net/publication/396917926_Rule-of-Thirds_Detection_with_Interpretable_Geometric_Features

## Help articles & source material

- AdCreative.ai scoring explainer: https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- Neurons Inc attention prediction: https://knowledge.neuronsinc.com/how-neurons-attention-prediction
- Neurons Inc visual recommendations: https://www.neuronsinc.com/insights/visual-recommendations
- Attention Insight API docs: https://attentioninsight.com/api/
- Brainsight API — clarity score: https://www.brainsight.app/features/api
- Dragonfly AI attention scoring: https://dragonflyai.co/
- PSU ISM 2011 RoT paper: https://web.cecs.pdx.edu/~fliu/papers/ism2011.pdf
- Geometric RoT features paper: https://www.researchgate.net/publication/396917926_Rule-of-Thirds_Detection_with_Interpretable_Geometric_Features
- LLM Layout Scoring blog (2026): https://datahacker.rs/llm_log-019-layout-scoring-does-furniture-placement-follow-the-rule-of-thirds/
- Rule of thirds Wikipedia: https://en.wikipedia.org/wiki/Rule_of_thirds
- IxDF rule-of-thirds guide: https://ixdf.org/literature/article/rule-of-thirds-examples

## Pros / cons / flaws

### What competitors do well
- AdCreative.ai wraps multiple composition rules (RoT, contrast, hierarchy) into one composite score backed by performance data — simpler UX for non-designers.
- Neurons uses real eye-tracking validation; their attention-centroid proxy is empirically calibrated, not just geometric.
- Attention Insight's Focus Score (hotspot size + distance) implicitly rewards scattered attention, which penalises off-centre subjects even without explicit RoT geometry — a different but complementary signal.

### Where they fall short
- No competitor exposes the raw power-point distance as a developer-accessible number; all wrap it in a black-box score.
- None disambiguates between subject types: a face centroid and a text centroid should be scored differently (faces near top-right / top-left; product shots near any power point; text blocks on grid lines not intersections).
- For video, no competitor reports RoT alignment per-frame or per-scene segment; they snapshot a representative frame.

### Edge cases they miss
- **Two subjects competing**: twin faces at top-left and bottom-right power points each score perfectly alone, but the creative may still look unbalanced. Need multi-centroid scoring.
- **Deliberately centred subjects**: brand book rules for some verticals (luxury, automotive) mandate centred composition. A hard "centred = bad" rule will misfire.
- **Vertical creatives (9:16)**: power points shift; the same pixel coordinates map to different RoT positions than a 1:1 or 16:9 frame. The W and H must be aspect-aware.
- **Text-heavy creatives with no clear subject**: all text blocks are similarly weighted; the "largest cluster" heuristic picks arbitrary text rather than the headline.
- **Partially cropped faces** (e.g., portrait mode close-up): bounding box centroid is off; use facial landmarks (nose tip or eye midpoint) as centroid instead.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class RuleOfThirdsRequest(BaseModel):
    asset_id: str
    frame_index: Optional[int] = Field(None,
        description="For video: which frame to analyse (default: frame at 1.5s)")

class RuleOfThirdsScore(BaseModel):
    slug: Literal["visual.rule_of_thirds"] = "visual.rule_of_thirds"
    rot_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    rot_alignment: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="1.0 = perfectly on power point, 0.0 = centred")
    min_power_point_distance: Optional[float] = Field(None, ge=0.0, le=0.236,
        description="Normalised Euclidean distance to nearest power point")
    nearest_power_point: Optional[Literal["top_left", "top_right", "bottom_left", "bottom_right"]] = None
    subject_type: Optional[Literal["face", "text", "saliency", "none"]] = None
    centroid_x: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Detected subject centroid x, normalised 0–1")
    centroid_y: Optional[float] = Field(None, ge=0.0, le=1.0)
    null_with_reason: Optional[str] = Field(None,
        description="Reason metric cannot be computed")
```

**Endpoint**: `POST /score/visual/rule-of-thirds`

### ONNX / model dependency

- **Face detection**: YuNet ONNX (face_detection_yunet_2023mar.onnx from opencv_zoo) — already available in many Python environments. Alternatively `retinaface_mobile0.25.onnx` from InsightFace (~2 MB).
- **Saliency fallback**: U2-Net ONNX (`u2net.onnx`, ~176 MB for full model; `u2netp.onnx`, ~4 MB for lightweight) loaded once in CreativeScorer. Add `saliency_session` attribute to `model/multitask.py`.
- **Text bounding box**: `easyocr` (no ONNX, wraps its own models) or `pytesseract` for bounding boxes without OCR text; much lighter than full OCR.
- Detection priority: try face → text → saliency; if none detected set `subject_type: "none"` and return `null_with_reason: "no_subject_detected"`.

### Next.js component

**Filename**: `RuleOfThirdsCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/RuleOfThirdsCard.tsx`

```typescript
interface RuleOfThirdsCardProps {
  slug: "visual.rule_of_thirds";
  rotScore: number | null;              // 0–10
  rotAlignment: number | null;          // 0–1
  nearestPowerPoint: "top_left" | "top_right" | "bottom_left" | "bottom_right" | null;
  subjectType: "face" | "text" | "saliency" | "none" | null;
  centroidX: number | null;            // normalised 0–1
  centroidY: number | null;            // normalised 0–1
  imageWidth: number;                   // px, for drawing overlay
  imageHeight: number;
  nullWithReason?: string;
}
```

Render an `<svg>` overlay on the creative thumbnail: draw the 3×3 grid as grey lines, mark the 4 power points as white crosshairs, and plot the detected centroid as a coloured dot (green/amber/red). Use a dashed line to the nearest power point. Score badge shown as `rot_score / 10`.

### Failure mode

```json
{
  "slug": "visual.rule_of_thirds",
  "rot_score": null,
  "rot_alignment": null,
  "null_with_reason": "no_subject_detected"
}
```

Other valid `null_with_reason` values: `"decoding_error"`, `"unsupported_format"`, `"saliency_model_unavailable"`.
