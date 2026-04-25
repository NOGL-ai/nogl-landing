# 20 — cta.logo_visibility

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Vidmob | Creative Scoring — Logo Detection Rules | https://vidmob.com/scoring-2 | Creative data platform |
| AdCreative.ai | Creative Scoring AI — Component Analysis (Logo) | https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it | AI ad generation + scoring |
| API4AI | Brand Recognition API — Logo Detection | https://api4.ai/blog/ai-driven-logo-detection-and-advertising-analytics | Computer vision API |
| Eden AI | Logo Detection API (aggregator) | https://www.edenai.co/feature/logo-detection-apis | AI API aggregator |
| Folio3 AI | Logo Recognition Software | https://www.folio3.ai/logo-recognition-software/ | Computer vision services |
| Brainsight | Brand Tracking — Logo Visibility Score | https://www.brainsight.app/features/api | Predictive eye-tracking |
| AIM Technologies | Logo Identification in Videos | https://www.aimtechnologies.co/2025/07/22/logo-identification-in-videos-the-future-of-visual-brand-monitoring/ | Brand monitoring |
| Springer/arxiv (Packaging paper) | Logo Detection + Saliency + Placement Analysis | https://link.springer.com/article/10.1007/s42452-025-07043-9 | Academic research |

## How they implement it

### Algorithm / model family

**Three detection approaches: (A) custom-trained YOLOv8, (B) template matching, (C) CLIP-based embedding similarity. Most production systems use (A) as primary, (B) as fallback for exact-match logos, (C) for variant detection.**

#### Approach A — YOLOv8 fine-tuned logo detector (recommended)

Fine-tune YOLOv8-nano or YOLOv8-small on a brand-specific logo dataset (Roboflow Universe has public datasets: "Brand Logo Recognition - YOLOv8" at https://universe.roboflow.com/data6000/brand-logo-recognition-yolov8). Export to ONNX via `model.export(format="onnx")`.

Inference pipeline:

```python
import onnxruntime as ort
import cv2, numpy as np

def detect_logos(
    img_bgr: np.ndarray,
    session: ort.InferenceSession,
    conf_threshold: float = 0.40,
    iou_threshold: float = 0.45,
) -> list[dict]:
    """
    Returns list of detections: {
        'class_id': int, 'class_name': str,
        'confidence': float,
        'bbox': [x1, y1, x2, y2],   # absolute pixels
        'bbox_area_fraction': float  # bbox area / image area
    }
    """
    H, W = img_bgr.shape[:2]
    # Preprocess: resize to 640x640, normalise to [0,1], NCHW
    img_resized = cv2.resize(img_bgr, (640, 640))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    inp = (img_rgb.astype(np.float32) / 255.0).transpose(2, 0, 1)[np.newaxis]
    
    outputs = session.run(None, {session.get_inputs()[0].name: inp})
    # YOLOv8 output shape: (1, 84, 8400) — filter by conf, NMS
    detections = _postprocess_yolov8(outputs[0], W, H, conf_threshold, iou_threshold)
    
    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        bbox_area = (x2 - x1) * (y2 - y1)
        det['bbox_area_fraction'] = bbox_area / (W * H)
    
    return detections
```

#### Approach B — Template matching (exact logo, known orientation)

Use `cv2.matchTemplate` with `cv2.TM_CCOEFF_NORMED`. Requires the brand logo as a clean RGBA template. Only works for logos at approximately the expected scale; combine with multi-scale search:

```python
def template_match_logo(img_gray, template_gray, scales=np.linspace(0.3, 1.5, 20)):
    best_val, best_loc, best_scale = -1, None, 1.0
    for scale in scales:
        resized = cv2.resize(template_gray, None, fx=scale, fy=scale)
        if resized.shape[0] > img_gray.shape[0] or resized.shape[1] > img_gray.shape[1]:
            continue
        result = cv2.matchTemplate(img_gray, resized, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(result)
        if max_val > best_val:
            best_val, best_loc, best_scale = max_val, max_loc, scale
    return best_val, best_loc, best_scale  # best_val >= 0.75 = confident match
```

#### Approach C — CLIP embedding similarity (variant logos, no fine-tuning)

Encode both the detected region and the reference logo image via CLIP. If cosine similarity ≥ 0.85, treat as logo match. Useful for detecting logo variants (monochrome, inverted).

**Visibility quality scoring (post-detection)**

After a bounding box is obtained, compute three quality signals:

```python
def logo_visibility_quality(img_bgr, bbox, min_area_fraction=0.005):
    x1, y1, x2, y2 = bbox
    H, W = img_bgr.shape[:2]
    
    # 1. Size adequacy: logo must be >= 0.5% of image area
    area_fraction = (x2 - x1) * (y2 - y1) / (W * H)
    size_ok = area_fraction >= min_area_fraction
    
    # 2. Occlusion / clutter: measure local background complexity
    #    Expand bbox by 20% in each direction for context region
    pad_x = int((x2 - x1) * 0.2)
    pad_y = int((y2 - y1) * 0.2)
    ctx = img_bgr[
        max(0, y1 - pad_y):min(H, y2 + pad_y),
        max(0, x1 - pad_x):min(W, x2 + pad_x)
    ]
    # Edge density in context region = proxy for clutter
    ctx_gray = cv2.cvtColor(ctx, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(ctx_gray, 50, 150)
    clutter_score = edges.mean() / 255.0  # 0 = no clutter, 1 = very cluttered
    
    # 3. Legibility: logo region sharpness (Laplacian variance)
    logo_region = img_bgr[y1:y2, x1:x2]
    logo_gray = cv2.cvtColor(logo_region, cv2.COLOR_BGR2GRAY) if logo_region.size > 0 else None
    sharpness = cv2.Laplacian(logo_gray, cv2.CV_64F).var() if logo_gray is not None else 0.0
    legible = sharpness > 50.0  # threshold empirically set; < 50 = blurry/occluded
    
    return {
        "area_fraction": round(area_fraction, 4),
        "size_ok": size_ok,
        "clutter_score": round(clutter_score, 3),
        "is_cluttered": clutter_score > 0.15,
        "sharpness": round(sharpness, 1),
        "legible": legible,
    }
```

API4AI's exposure scoring model measures "pixel share (area), maps the bounding box to an attention heatmap (position), and applies blur/contrast algorithms to quantify sharpness" — this matches the above pattern exactly.

The Springer packaging paper (2025) uses a CNN-Transformer pipeline: YOLOv8 for detection → saliency map for attention weighting → a brand attention score = sum of normalised saliency values within the logo bounding box.

Brainsight's brand tracking feature computes a "Brand Visibility Score" combining detection confidence, logo area fraction, and whether the logo falls in a high-attention saliency region.

### Metric shape

| Metric | Type | Range | Thresholds |
|---|---|---|---|
| `logo_detected` | bool | true/false | — |
| `detection_confidence` | float | 0.0 – 1.0 | < 0.40 = uncertain |
| `area_fraction` | float | 0.0 – 1.0 | < 0.005 = too small, 0.005–0.05 = acceptable, > 0.05 = prominent |
| `is_cluttered` | bool | true/false | clutter_score > 0.15 |
| `legible` | bool | true/false | Laplacian variance > 50 |
| `logo_visibility_score` | float | 0.0 – 10.0 | < 4 = invisible/poor, 4–7 = visible, 7–10 = prominent and legible |

Score computation:
```python
if not logo_detected:
    logo_visibility_score = 0.0
else:
    size_sub = min(area_fraction / 0.02, 1.0)  # full score at 2% area
    legibility_sub = 1.0 if legible else 0.4
    clutter_sub = 1.0 - clutter_score
    logo_visibility_score = round(10.0 * (0.4*size_sub + 0.3*legibility_sub + 0.3*clutter_sub), 2)
```

### UI pattern

- **Bounding box overlay**: draw the detected logo bounding box on the creative thumbnail in green (score ≥ 7), amber (4–7), or red (< 4 or not detected). Label shows "Logo: 87 % conf."
- **Attribute badges**: three inline badges next to the bounding box:
  - Size: `TOO SMALL` (red) / `OK` (green) with area percentage
  - Legibility: `LEGIBLE` (green) / `BLURRY` (red)
  - Clutter: `CLEAN REGION` (green) / `CLUTTERED` (amber)
- **Visibility score gauge**: 0–10 radial gauge.
- **Not detected state**: a placeholder with dashed border labelled "No logo detected — upload logo template to enable detection." This is the null state UI.
- **Video mode**: for video ads, show a timeline bar with frames where the logo is detected (green tick marks) vs absent (grey); annotate first-frame logo appearance.

### Public screenshots / demos

- API4AI logo detection and advertising analytics: https://api4.ai/blog/ai-driven-logo-detection-and-advertising-analytics
- API4AI exposure scoring methodology: https://medium.com/@API4AI/calculating-exposure-score-size-meets-clarity-8f4f8c531c14
- API4AI logo heatmap analytics: https://medium.com/@API4AI/logo-heatmaps-pinpointing-viewer-focus-in-ads-89be17a8f812
- Eden AI logo detection API page: https://www.edenai.co/feature/logo-detection-apis
- YOLOv8 + Roboflow logo detection guide: https://medium.com/@ma-korotkov/unveiling-brand-logo-detection-leveraging-ultralytics-yolov8-and-roboflow-abc3ab42b06f
- Springer packaging logo visibility paper: https://link.springer.com/article/10.1007/s42452-025-07043-9

## Help articles & source material

- Vidmob Creative Scoring guidelines: https://help.vidmob.com/en/articles/6519983-what-guidelines-are-available-for-creative-scoring
- Vidmob Creative Analytics elements: https://help.vidmob.com/en/articles/6376785-what-creative-elements-can-creative-analytics-identify
- AdCreative.ai component analysis: https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- API4AI logo detection blog: https://api4.ai/blog/ai-driven-logo-detection-and-advertising-analytics
- Eden AI best logo detection APIs 2025: https://www.edenai.co/post/best-logo-detection-apis
- YOLOv8 ONNX inference guide: https://medium.com/@zain.18j2000/how-to-use-custom-or-official-yolov8-object-detection-model-in-onnx-format-ca8f055643df
- Roboflow brand logo recognition dataset: https://universe.roboflow.com/data6000/brand-logo-recognition-yolov8
- Analytics Vidhya open-source logo detector guide: https://www.analyticsvidhya.com/blog/2025/12/build-your-own-open-source-logo-detector/
- Bolster.ai YOLOv5 logo detection: https://bolster.ai/blog/logo-detection
- Brainsight brand tracking API: https://www.brainsight.app/features/api
- AIM Technologies logo identification in video: https://www.aimtechnologies.co/2025/07/22/logo-identification-in-videos-the-future-of-visual-brand-monitoring/
- arxiv logo packaging paper (preprint): https://arxiv.org/html/2403.02336v1

## Pros / cons / flaws

### What competitors do well
- API4AI's three-component exposure score (area + attention position + sharpness) is the most complete public methodology for logo visibility scoring.
- AdCreative.ai's component analysis correctly flags absent logos as a blocking issue in its action recommendations — treating missing logo as a hard failure.
- Vidmob's rule-based system allows brand managers to define minimum logo size as a percentage of frame area — directly maps to our `min_area_fraction` parameter.
- Brainsight combines detection with attention prediction — a logo in a low-attention region scores lower than an equally-sized logo in a high-attention region, which is the right weighting.

### Where they fall short
- Most tools require pre-uploading a logo reference. If the brand has 10 logo variants (horizontal, stacked, monochrome, white-on-dark), maintaining the template library is operationally expensive.
- Eden AI aggregates multiple providers but normalises to a lowest-common-denominator schema — it does not expose sharpness/legibility sub-scores.
- No competitor distinguishes between a logo that is technically visible (not occluded, large enough) and one that is visually legible (sufficient contrast against background). High-contrast detection confidence ≠ legibility.
- For animated ads: frame-by-frame logo visibility varies. Most tools report presence in one representative frame rather than time-averaged visibility across the video.

### Edge cases they miss
- **Transparent / watermark-style logos**: white logo on white background may not be detected by any of the above approaches because the contrast is near zero; requires alpha-channel awareness or background segmentation first.
- **Logo in motion / animated logo**: a spinning or scaling logo intro may not trigger a stable detection bounding box at any single frame. Need temporal aggregation over the animation duration.
- **Co-branded creatives**: two logos present — which is "the brand" logo? Needs a brand ID parameter at request time (logo class ID in the YOLO model).
- **Logo on product packaging within the image**: a product shot shows the brand logo on the bottle/box but it is not the "brand logo in the ad" per creative guidelines. Differentiating ad-level placement from incidental product placement requires spatial zone filtering.
- **Occluded by text overlays**: a text overlay partially covers the logo late in a video. Frame-average scoring may miss this frame and still report the logo as "visible."

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class LogoBoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int
    area_fraction: float

class LogoVisibilityRequest(BaseModel):
    asset_id: str
    logo_template_asset_id: Optional[str] = Field(None,
        description="Asset ID of the clean logo PNG for template matching fallback")
    detection_method: Literal["yolo", "template", "clip", "auto"] = "auto"
    min_area_fraction: float = Field(default=0.005, ge=0.001, le=0.5,
        description="Minimum logo bounding box area as fraction of frame area to count as 'visible'")
    conf_threshold: float = Field(default=0.40, ge=0.10, le=0.99)
    frame_sample_count: int = Field(default=5,
        description="For video: number of evenly-spaced frames to sample for logo detection")

class LogoVisibilityScore(BaseModel):
    slug: Literal["cta.logo_visibility"] = "cta.logo_visibility"
    logo_detected: Optional[bool] = None
    logo_visibility_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    detection_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    area_fraction: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_cluttered: Optional[bool] = None
    legible: Optional[bool] = None
    bounding_box: Optional[LogoBoundingBox] = None
    detection_method_used: Optional[Literal["yolo", "template", "clip"]] = None
    # For video: fraction of sampled frames where logo is detected
    video_presence_fraction: Optional[float] = Field(None, ge=0.0, le=1.0)
    null_with_reason: Optional[str] = Field(None,
        description="Reason metric cannot be computed")
```

**Endpoint**: `POST /score/cta/logo-visibility`

### ONNX / model dependency

- **Primary model**: `yolov8n_logo.onnx` — YOLOv8-nano fine-tuned on brand logos. Store under `model/weights/yolov8n_logo.onnx`. Load via `onnxruntime.InferenceSession` at startup inside `model/multitask.py` CreativeScorer as attribute `logo_detection_session`.
- **Fallback**: `cv2.matchTemplate` (OpenCV, no ONNX) when `logo_template_asset_id` is provided and YOLO confidence < 0.40.
- **CLIP variant detection**: `openai/clip-vit-base-patch32` exported as ONNX or called via `transformers` / `open_clip`. Only needed for logo variant matching (optional, heavy ~350 MB).
- Post-processing NMS: implement in NumPy (no torchvision needed); filter detections by `conf_threshold` then apply IoU-based NMS with `iou_threshold=0.45`.
- Sharpness: `cv2.Laplacian(logo_crop_gray, cv2.CV_64F).var()` — pure OpenCV.
- Clutter: `cv2.Canny` edge density in the padded context region — pure OpenCV.

### Next.js component

**Filename**: `LogoVisibilityCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/LogoVisibilityCard.tsx`

```typescript
interface LogoBoundingBox {
  x1: number; y1: number;
  x2: number; y2: number;
  areaFraction: number;
}

interface LogoVisibilityCardProps {
  slug: "cta.logo_visibility";
  logoDetected: boolean | null;
  logoVisibilityScore: number | null;   // 0–10
  detectionConfidence: number | null;   // 0–1
  areaFraction: number | null;          // 0–1
  isClustered: boolean | null;
  legible: boolean | null;
  boundingBox: LogoBoundingBox | null;
  videoPresenceFraction: number | null; // 0–1, for video assets
  imageWidth: number;                   // for bounding box overlay rendering
  imageHeight: number;
  nullWithReason?: string;
}
```

Render bounding box as an `<svg>` `<rect>` overlay on the creative thumbnail in green/amber/red. Show three inline badges (Size, Legibility, Clutter). For video, render a presence timeline bar using a a `<BarChart>` chart component with one bar per sampled frame — green if logo detected, grey if absent. Show the `logoVisibilityScore` as a gauge 0–10.

**Empty state** (logo not detected): display a dashed placeholder box with text "Logo not detected" and a suggestion: "Add logo or upload a logo template to enable detection."

### Failure mode

```json
{
  "slug": "cta.logo_visibility",
  "logo_detected": null,
  "logo_visibility_score": null,
  "null_with_reason": "no_logo_model_configured"
}
```

Other valid `null_with_reason` values:
- `"logo_not_detected"` — model ran but found no logo (score = 0.0, not null; use `logo_detected: false` with score instead)
- `"decoding_error"` — asset could not be decoded
- `"unsupported_format"` — file type not supported
- `"logo_model_unavailable"` — ONNX session not loaded (model file missing)
- `"template_not_provided"` — `detection_method` was `"template"` but no template asset supplied
