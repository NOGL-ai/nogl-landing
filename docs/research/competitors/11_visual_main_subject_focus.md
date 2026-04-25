# 11 — visual.main_subject_focus

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Vidmob | Aperture Creative Scoring — subject presence / prominence signal | https://vidmob.com/creative-scoring | AI creative analytics |
| CreativeX | Creative Quality Score — Clear Presence guideline | https://www.creativex.com/products/creative-quality | Creative intelligence |
| AdCreative.ai | Creative Scoring AI — Component Analysis + Saliency AI | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Brainsight | Predictive Attention API — focus area detection | https://www.brainsight.app/features/api | AI eye-tracking / saliency |
| Clarifai | Visual Detection API — object bounding box + coverage | https://docs.clarifai.com/api-guide/predict/images/ | Computer vision platform |
| Memorable AI | Ad memorability scoring — subject salience signal | https://www.memorable.io | Neuro-AI ad pre-testing |
| Neurons Inc | Predict API — visual attention + subject clarity | https://www.neuronsinc.com/api | Neuro-AI attention prediction |
| Meta (internal) | Ad Relevance Diagnostics — visual quality signal | https://www.facebook.com/business/help/1967166020228503 | Self-serve ad platform |

## How they implement it

### Algorithm / model family

**Subject detection and area measurement pipeline:**

No competitor publishes an explicit "main subject focus" score as a standalone API field — the concept is folded into saliency, "clear presence," or visual quality scores. Implementation approaches observed:

- **Vidmob (Aperture)**: Uses Amazon Rekognition + custom SageMaker models for object/product detection with bounding box output. The subject bounding box area divided by total frame area yields an implicit coverage ratio. Vidmob's scoring rules (configured per brand) can fire a PASS/FAIL if a product appears below a certain size threshold (e.g., "product must be visible and occupy > N% of the frame"). Occlusion is indirectly flagged by checking whether detected logo/CTA text overlaps the primary bounding box.

- **CreativeX**: "Clear Presence" guideline checks that the hero product or person is unobscured and visually prominent. Internally this maps to a salient object detection pass; occlusion is inferred when a text/logo bounding box overlaps the primary subject mask by > 20% of the subject area.

- **AdCreative.ai**: Component Analysis AI identifies logo, CTA, and product bounding boxes. Saliency AI generates a per-pixel attention heatmap (model family: DeepGaze-style encoder-decoder trained on eye-tracking data). Subject focus quality = fraction of total saliency mass that falls on the product region. Subject too small → saliency mass below threshold; subject too large (cropped feel) → subject mask extends to frame edge.

- **Brainsight**: Predictive eye-tracking heatmap. Focus quality is read as: what fraction of the top-10% highest-attention pixels fall inside the inferred subject bounding box? Uses a custom CNN-based saliency model (94% correlation with real eye-tracking). Brand object detection (logos, text) layered on top.

- **Clarifai**: General-purpose visual detection API returns bounding boxes with class labels and confidence scores. Subject coverage = bounding box area / total image area. No built-in occlusion check; the caller must implement overlap logic.

- **Our implementation**: Three-stage pipeline combining YOLOv8 (subject detection → bounding box), SAM2 (precise subject segmentation → pixel mask), and a rule-based occlusion checker (text/logo box intersection-over-subject-area):
  1. Run YOLOv8n (ONNX) on the frame → top-1 detected object as "main subject" (by confidence × area product).
  2. If no YOLO detection, fall back to U2-Net salient object mask (reuse from criteria 09/10).
  3. Compute `subject_coverage = subject_mask_pixels / total_frame_pixels`.
  4. Detect text bounding boxes via OpenCV EAST text detector or pass pre-computed text boxes from criterion 03.
  5. Compute `occlusion_ratio = overlap_pixels(subject_mask, text_logo_boxes) / subject_mask_pixels`.
  6. Output composite score (see Metric shape below).

### Metric shape

- **Coverage range**: 0.0–1.0 (fraction of frame occupied by subject mask)
  - `too_small`: coverage < 0.20 (subject lost, likely background-dominant or small product shot)
  - `optimal`: 0.20 ≤ coverage ≤ 0.70 (clear subject, breathing room preserved)
  - `too_large`: coverage > 0.70 (cropped feel, subject bleeds out of frame, claustrophobic)
- **Occlusion range**: 0.0–1.0 (fraction of subject mask overlapped by text/logo elements)
  - `clean`: occlusion < 0.10
  - `partial`: 0.10 ≤ occlusion ≤ 0.30
  - `occluded`: occlusion > 0.30

Composite score formula (trapezoid for coverage, penalty for occlusion):
```
cov = subject_coverage      # 0.0–1.0
occ = occlusion_ratio       # 0.0–1.0

# Coverage component (inverted U)
if 0.20 <= cov <= 0.70:
    cov_score = 1.0
elif cov < 0.20:
    cov_score = cov / 0.20        # 0.10 → 0.50
else:
    cov_score = max(0.0, 1.0 - (cov - 0.70) / 0.30)  # 0.90 → 0.33

# Occlusion penalty (linear)
occ_penalty = min(occ * 1.5, 1.0)   # full penalty at occlusion ≥ 0.67

score = cov_score * (1.0 - occ_penalty)
```

Buckets (for badge display):
- `lost` (coverage < 0.20): subject too small to read
- `focused` (0.20–0.70, occlusion < 0.10): ideal
- `cropped` (coverage > 0.70): subject bleeds out
- `obstructed` (occlusion > 0.30): text/logo overlaps subject

### UI pattern

- **Vidmob**: No public screenshot. Score is surfaced as a component of the overall creative score in the Aperture dashboard — numeric gauge + PASS/FAIL badge per rule.
- **AdCreative.ai**: Saliency heatmap overlay (red = high attention). No explicit subject coverage percentage shown.
- **Brainsight**: Heatmap overlay with attention percentage readout. A "Focus Score" percentile vs. benchmark shown as a horizontal bar.
- **Our target**: Three UI elements:
  1. Ad image with two-layer SVG overlay: green semi-transparent fill on subject mask, red outline on occluding text/logo boxes.
  2. Two mini gauges side-by-side: "Subject Coverage" (0–100%) and "Occlusion" (0–100%), each with colored zone bands.
  3. Tier badge: `lost` (red), `focused` (green), `cropped` (amber), `obstructed` (red).

### Public screenshots / demos

- AdCreative.ai saliency/scoring page: https://www.adcreative.ai/creative-scoring
- Brainsight AI heatmaps demo: https://www.brainsight.app/features/ai-heatmaps
- Clarifai visual detection demo: https://clarifai.com/clarifai/main/models/general-image-detection
- Vidmob creative scoring FAQ: https://help.vidmob.com/en/articles/6314118-creative-scoring-frequently-asked-questions

## Help articles & source material

- https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring (Vidmob scoring methodology)
- https://aws.amazon.com/blogs/machine-learning/vidmob-combines-computer-vision-and-language-ai-services-for-data-driven-creative-asset-production/ (Vidmob + AWS Rekognition pipeline)
- https://www.creativex.com/products/creative-quality (CreativeX Clear Presence guideline)
- https://www.brainsight.app/features/api (Brainsight Predictive Attention API)
- https://docs.clarifai.com/api-guide/predict/images/ (Clarifai detection API)
- https://arxiv.org/abs/2005.09007 (U2-Net salient object detection — fallback model)
- https://docs.ultralytics.com/models/sam-2/ (SAM 2 segmentation — mask generation)
- https://docs.ultralytics.com/models/yolov8/ (YOLOv8 object detection)
- https://arxiv.org/abs/2011.09350 (DETR — alternative object detection transformer)
- https://blog.roboflow.com/how-to-use-yolov8-with-sam/ (YOLOv8 + SAM integration pattern)
- https://www.adcreative.ai/post/how-does-ai-scoring-transform-ad-creatives-in-digital-marketing (AdCreative.ai methodology overview)

## Pros / cons / flaws

### What competitors do well

- Vidmob's per-brand configurable thresholds are the right UX: "product must occupy > 25% of frame" is a brand-specific rule, not universal. Their PASS/FAIL API allows clients to set their own thresholds.
- AdCreative.ai's saliency approach is model-agnostic: it doesn't need to know what "the subject" is — if it attracts the eye, it counts. This handles diverse creative types (abstract art, lifestyle photos) that YOLO won't classify cleanly.
- Brainsight's benchmarking (compare your score vs. industry category) gives the metric a relative frame of reference, not just an absolute value.

### Where they fall short

- None of the tools explicitly separate **occlusion by text/CTA** from **occlusion by background clutter**. These are very different problems: CTA overlap is intentional and controllable; background clutter is a composition flaw.
- Saliency-based approaches (AdCreative.ai, Brainsight) conflate subject focus with brightness/color contrast. A very dark subject on a dark background will score low even if it is well-composed.
- Clarifai's detection API requires the caller to specify which object class is the "main subject" — it has no concept of saliency-ranked primary subject.
- All competitors that use a coverage ratio only check the **aggregate bounding box**, not the actual mask. A thin tall bottle with a lot of empty space inside the bounding box is over-counted.

### Edge cases they miss

- **Multi-subject ads**: an ad showing two people or two products. Which one is "the subject"? Current approaches pick the highest-confidence YOLO detection. The metric should handle multi-subject by summing coverage of top-N subjects.
- **Full-bleed lifestyle**: a person occupying 85% of frame in a fashion ad. Coverage > 0.70 triggers `too_large`, but this is intentional brand style. Needs a `brand_style: fashion` override parameter.
- **Semi-transparent logo overlays**: a watermark-style brand logo overlaying the subject at low opacity. EAST/pixel-based text detection will miss low-contrast overlays; needs luminosity-threshold tuning.
- **Subject partially off-screen**: the main product extends beyond the frame boundary. Coverage is under-counted; the metric should detect edge-contact of the subject mask and flag `subject_cropped: true`.
- **Video frames**: subject coverage varies per frame. Only the representative keyframe (e.g., 2-second mark) or the worst-frame within the hook (0–3 s) should be evaluated.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/main-subject-focus
from pydantic import BaseModel, Field
from typing import Optional, Literal

SubjectTier = Literal["lost", "focused", "cropped", "obstructed"]

class MainSubjectFocusRequest(BaseModel):
    ad_id: int
    image_b64: str                        # base64-encoded JPEG/PNG, max 4 MB
    # Optional: pre-computed text/logo bounding boxes from criterion 03/06
    # List of [x1, y1, x2, y2] normalized 0..1 boxes
    text_logo_boxes: Optional[list] = None

class MainSubjectFocusResponse(BaseModel):
    ad_id: int
    slug: str = "visual.main_subject_focus"
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[SubjectTier] = None
    subject_coverage: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Fraction of frame pixels in subject mask")
    occlusion_ratio: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Fraction of subject mask overlapped by text/logo elements")
    subject_cropped: Optional[bool] = Field(None,
        description="True if subject mask contacts any frame edge")
    detection_method: Optional[str] = Field(None,
        description="yolov8 | u2net_fallback")
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

Two-stage pipeline — neither stage uses `model/multitask.py` CreativeScorer:

**Stage 1 — Subject detection (preferred path):**
- Model: `yolov8n.onnx` (~6 MB, download from `ultralytics/assets`)
- Session: `onnxruntime.InferenceSession("models/yolov8n.onnx")`
- Input: `[1, 3, 640, 640]` float32 normalized image
- Output: `[1, 84, 8400]` detection tensor; take top-1 box by `conf * box_area` product
- Post-process: convert box to pixel mask (filled rectangle) for coverage calculation

**Stage 1 fallback — Salient object mask:**
- Model: U2-Net ONNX (same as criteria 09/10, reuse existing session)
- Threshold mask at 0.5; use as subject_mask

**Stage 2 — Occlusion check (pure OpenCV, no model):**
```python
# services/main_subject_focus.py
import cv2, numpy as np

def occlusion_ratio(subject_mask: np.ndarray,
                    text_boxes_norm: list,
                    img_h: int, img_w: int) -> float:
    """subject_mask: H×W binary uint8. text_boxes_norm: [[x1,y1,x2,y2],...] in 0..1."""
    if not text_boxes_norm:
        return 0.0
    text_mask = np.zeros_like(subject_mask)
    for x1n, y1n, x2n, y2n in text_boxes_norm:
        x1, y1 = int(x1n * img_w), int(y1n * img_h)
        x2, y2 = int(x2n * img_w), int(y2n * img_h)
        text_mask[y1:y2, x1:x2] = 1
    overlap = np.logical_and(subject_mask > 0, text_mask > 0).sum()
    subject_area = max((subject_mask > 0).sum(), 1)
    return float(overlap / subject_area)
```

Dependencies: `onnxruntime>=1.17`, `opencv-python>=4.9`, `numpy>=1.26`, `Pillow>=10.0`

### Next.js component

```
File: ui/src/components/application/ad-scoring/MainSubjectFocusCard.tsx

Props interface:
  interface MainSubjectFocusCardProps {
    adId: number;
    score: number | null;
    tier: "lost" | "focused" | "cropped" | "obstructed" | null;
    subjectCoverage: number | null;   // 0.0–1.0
    occlusionRatio: number | null;    // 0.0–1.0
    subjectCropped: boolean | null;
    detectionMethod: string | null;
    imageUrl: string;
    nullWithReason?: string;
  }

Render:
  - Two horizontal gauge bars:
      "Subject Coverage" — color zones: red <20%, green 20–70%, amber >70%
      "Occlusion by Text/Logo" — color zones: green <10%, amber 10–30%, red >30%
  - Tier badge: lost=red, focused=green, cropped=amber, obstructed=red
  - If subjectCropped is true: amber warning chip "Subject contacts frame edge"
  - If detectionMethod === "u2net_fallback": gray info chip "No object detected — using saliency fallback"
  - If nullWithReason is set: gray "N/A" badge with tooltip showing reason
  - Image overlay (toggle): green semi-transparent fill on subject mask;
    red dashed rectangle outlines on text/logo boxes that overlap subject
```

### Failure mode

```python
# null_with_reason values:
"image_decode_error"      # PIL/base64 decode failed before any inference
"image_too_small"         # image < 64×64 px
"yolov8_model_missing"    # yolov8n.onnx not found AND u2net also missing
"inference_exception"     # both YOLO and U2-Net threw runtime exceptions
"no_subject_detected"     # YOLO returned no boxes above conf=0.25 AND U2-Net mask is <1% of frame
```

Return `score: null, tier: null` for all above cases; always populate `null_with_reason`.
