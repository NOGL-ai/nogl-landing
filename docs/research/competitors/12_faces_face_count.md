# 12 — faces.face_count

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Realeyes (PreView) | Attention scoring — face capture/retain signals | https://www.realeyesit.com/preview/ | Neuro-AI ad testing |
| Affectiva (iMotions) | Facial Coding SDK — face count + emotion per face | https://imotions.com/products/affectiva-facial-coding-sdk/ | Emotion AI / biometric research |
| Vidmob | Aperture — face present, face size, face count signals | https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring | AI creative analytics |
| Brainsight | Predictive attention — face salience contribution | https://www.brainsight.app | AI eye-tracking / saliency |
| CreativeX | Creative Quality — human presence guideline | https://www.creativex.com/products/creative-quality | Creative intelligence |
| Neurons Inc | Predict API — face prominence signal | https://www.neuronsinc.com/api | Neuro-AI attention |
| MediaPipe (Google) | Face Detector / FaceMesh solutions | https://developers.google.com/mediapipe/solutions/vision/face_detector | Open-source CV framework |
| Nielsen | Creative Evaluation suite — human presence analytics | https://www.nielsen.com/news-center/2024/nielsen-expands-campaign-effectiveness-suite-to-include-creative-evaluation/ | Measurement & analytics |

## How they implement it

### Algorithm / model family

**Industry context:**

Neuro-marketing research consistently finds that human faces (particularly those making eye contact with the viewer) are among the strongest attention anchors in visual content. The engagement-optimizing range is 1–2 faces at "meaningful" scale (face bounding box occupying roughly 5–30% of frame area). Zero faces correlates with lower emotional engagement; many small faces (crowd shots) dilutes the interpersonal signal; a single large face at high confidence is the strongest predictor of recall.

**Realeyes PreView**: The core detection layer is a proprietary CNN that performs frame-level face detection with head-pose estimation (pitch/yaw/roll), palpebral aperture (eye openness), and gaze direction. Face count across frames is aggregated; the PreView "Capture" sub-score (ability to hook attention in first seconds) is partially driven by whether a face appears in frames 0–3 s. Face size relative to frame area is an implicit signal in the Attention score (0–100).

**Affectiva Facial Coding SDK**: Returns per-face bounding boxes, action unit intensities (AU1–AU27), and 6 basic emotion labels. Face count is a direct output. For ad testing, Affectiva computes frame-by-frame face presence and size; the SDK processes 180–200 fps in real-time. Primary model: deep CNN (custom architecture, not published).

**Vidmob Aperture**: Uses Amazon Rekognition DetectFaces API. Returns face bounding boxes, confidence, pose, and quality attributes. Scoring rules can check: "face present = true," "face count ≥ 1," "face area > X% of frame." Multiple signals are fed into the ensemble creative score. The face_count and face_size signals are confirmed as input features in Vidmob's AWS blog post on their CV pipeline.

**YuNet (OpenCV face_detection_yunet.onnx) — a native ONNX face detector, no GPU required. Face count = len(detections). Face size = max(box_w * box_h) / (img_w * img_h).

**Our implementation**:
1. Run MediaPipe Face Detector ONNX or YOLOv8-face ONNX on the primary keyframe (static ads) or the median frame of the first 3 seconds (video ads).
2. Count detected faces above `conf ≥ 0.60` threshold.
3. Compute `max_face_coverage = largest_face_bbox_area / total_frame_area`.
4. Map to score using the bucketed function below.

### Metric shape

- **face_count**: integer 0–N
- **max_face_coverage**: float 0.0–1.0 (largest face box as fraction of frame)
- **dominant_face_size_tier**: `"micro"` (< 2% of frame), `"small"` (2–5%), `"readable"` (5–30%), `"large"` (> 30%)

Score table (research-backed engagement correlation):

| face_count | dominant_face_size_tier | score | rationale |
|---|---|---|---|
| 0 | — | 0.45 | No face — lower emotional engagement; acceptable for product-only ads |
| 1 | micro | 0.40 | Face present but too small to register |
| 1 | small | 0.65 | Face visible but below optimal |
| 1 | readable | 1.00 | Optimal: single face, clear scale |
| 1 | large | 0.80 | Strong but slight "intense" feel |
| 2 | readable | 0.90 | Two faces — slightly diluted but still strong for dialogue ads |
| 2 | small | 0.55 | Two faces, both too small |
| 3+ | any | 0.50 | Crowd / group — interpersonal signal diluted |

Fallback for ambiguous cases: score = `min(1.0, face_count / 2) * face_size_modifier`

Buckets (for badge):
- `no_face` (face_count == 0)
- `optimal` (face_count 1–2, dominant_face_size_tier == "readable")
- `faces_too_small` (face_count > 0, dominant_face_size_tier in ["micro", "small"])
- `crowded` (face_count >= 3)

### UI pattern

- **Realeyes PreView**: Line chart of frame-by-frame attention score (0–100), with face-detection events overlaid as tick marks on the timeline. No explicit "face count" widget — it is embedded in the Capture/Retain breakdown.
- **Affectiva / iMotions**: Data grid showing per-face bounding box coordinates + emotion scores per frame. Visual: annotated video frame with box overlays and emotion label tags.
- **Vidmob**: Creative score breakdown panel — "Human Presence" shown as a PASS/FAIL component card alongside other creative signals. No raw face count number visible in the public UI.
- **Our target**: Three UI elements:
  1. Ad image thumbnail with bounding box overlays for each detected face (different color per face index), labeled with confidence score.
  2. Numeric badge: "Faces Detected: N" with a large digit, and a sub-label "Largest face: X% of frame."
  3. Tier badge: `no_face` (gray), `optimal` (green), `faces_too_small` (amber), `crowded` (amber).

### Public screenshots / demos

- Realeyes PreView attention analysis: https://www.realeyesit.com/preview/
- Affectiva Facial Coding SDK product page: https://imotions.com/products/affectiva-facial-coding-sdk/
- Vidmob AWS CV pipeline: https://aws.amazon.com/blogs/machine-learning/vidmob-combines-computer-vision-and-language-ai-services-for-data-driven-creative-asset-production/
- MediaPipe Face Detector guide: https://developers.google.com/mediapipe/solutions/vision/face_detector

## Help articles & source material

- https://blog.realeyesit.com/vidmob-integrates-realeyes-attention-to-its-creative-data-platform (Realeyes + Vidmob integration)
- https://www.realeyesit.com/technology/how-it-works/ (Realeyes methodology — face detection + attention)
- https://imotions.com/solutions/facial-coding-for-ad-testing/ (Affectiva facial coding for advertising)
- https://www.tandfonline.com/doi/full/10.1080/00913367.2024.2407644 (Computer Vision Models for Ad Research — academic review)
- https://aws.amazon.com/blogs/machine-learning/vidmob-combines-computer-vision-and-language-ai-services-for-data-driven-creative-asset-production/ (Vidmob AWS Rekognition pipeline)
- https://developers.google.com/mediapipe/solutions/vision/face_detector (MediaPipe Face Detector — BlazeFace)
- https://www.sievedata.com/resources/how-to-run-face-detection-with-yolo-and-mediapipe (YOLO vs MediaPipe face detection comparison)
- https://www.nielsen.com/news-center/2024/nielsen-expands-campaign-effectiveness-suite-to-include-creative-evaluation/ (Nielsen creative evaluation with human presence)
- https://arxiv.org/abs/1907.05047 (BlazeFace — MediaPipe's underlying face detector paper)
- https://www.tvisioninsights.com/resources/tvision-realeyes-creative-attention-report (TVision + Realeyes attention research)

## Pros / cons / flaws

### What competitors do well

- Realeyes' temporal approach (frame-by-frame face presence over ad duration) is more informative than a single keyframe check — a face that appears only at second 7 of a 15-second ad has less impact than one present from frame 1.
- Affectiva's per-face emotion labeling adds a second dimension beyond mere count/size: a face present but showing neutral or negative emotion may not benefit engagement.
- Vidmob's PASS/FAIL rule architecture lets brands define their own thresholds — "faces required for lifestyle category ads" vs. "faces optional for product-only SKU ads."

### Where they fall short

- No competitor publicly exposes a **face_count × face_size composite score** as a standalone, auditable metric. It is always folded into a broader attention or quality score.
- Affectiva and Realeyes require human panel data (webcam sessions) to calibrate predictions — their pre-test scores are probabilistic, not based on the creative asset alone.
- None of the free/open tools (MediaPipe, YOLO) score **eye contact** (is the face looking at camera vs. in profile?). Eye contact strongly increases perceived engagement but is not checked.
- Crowd shots with 6+ faces are uniformly penalized in all tools, even when the crowd is the creative concept (e.g., a concert brand sponsorship ad or political campaign).

### Edge cases they miss

- **Face partially occluded**: a face half-covered by a CTA bar or product overlay. Detector may return a low-confidence detection or miss it entirely. Should fire `faces_occluded: true` warning.
- **Non-human faces**: a cartoon character face or animal face. MediaPipe/YOLO will sometimes detect these; they do not carry the same engagement signal. Needs a `is_human_face` classification step.
- **Extreme close-up**: a single eye or forehead filling the frame. Face detector fails or returns a very large box; `dominant_face_size_tier = "large"` but the face is not "readable." Needs aspect-ratio and landmark confidence check.
- **Illustrated/illustrated faces**: vector cartoon or illustration faces may not be detected by models trained on real face photos. Should return `face_count: 0` with `null_with_reason: "non_photorealistic"`.
- **Video: face appears only in last second**: a face reveal at the end of an ad may spike engagement at the end but not serve the hook. The metric should separately flag `face_in_hook` (0–3 s) vs. `face_in_body`.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/face-count
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

FaceTier = Literal["no_face", "optimal", "faces_too_small", "crowded"]
FaceSizeTier = Literal["micro", "small", "readable", "large"]

class FaceBox(BaseModel):
    x1: float   # normalized 0..1
    y1: float
    x2: float
    y2: float
    confidence: float

class FaceCountRequest(BaseModel):
    ad_id: int
    image_b64: str     # base64-encoded JPEG/PNG or video keyframe, max 4 MB

class FaceCountResponse(BaseModel):
    ad_id: int
    slug: str = "faces.face_count"
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[FaceTier] = None
    face_count: Optional[int] = Field(None, ge=0)
    max_face_coverage: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Largest face bbox area as fraction of total frame area")
    dominant_face_size_tier: Optional[FaceSizeTier] = None
    face_boxes: Optional[List[FaceBox]] = Field(None,
        description="All detected face bounding boxes above confidence threshold")
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

Do NOT use `model/multitask.py` CreativeScorer. Use MediaPipe Face Detector exported to ONNX:

**Primary model**: `face_detection_yunet_2023mar.onnx  (from opencv_zoo)`
- Source: export via `mediapipe` Python package: `mp.solutions.face_detection`
- Alternatively use `yunet_face_detector.onnx` from OpenCV's model zoo (faster, no MediaPipe dependency)
- Input: `[1, 3, 128, 128]` float32
- Output: bounding boxes + scores tensor

**Fallback**: OpenCV Haar Cascade face detector (built into `opencv-python`, no model file download):
```python
import cv2
cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
faces = cascade.detectMultiScale(gray_img, scaleFactor=1.1, minNeighbors=5)
```

**Score lookup** (implement in `services/face_count.py`):
```python
def face_coverage_tier(coverage: float) -> str:
    if coverage < 0.02:   return "micro"
    if coverage < 0.05:   return "small"
    if coverage <= 0.30:  return "readable"
    return "large"

SCORE_TABLE = {
    (0, None):           0.45,
    (1, "micro"):        0.40,
    (1, "small"):        0.65,
    (1, "readable"):     1.00,
    (1, "large"):        0.80,
    (2, "readable"):     0.90,
    (2, "small"):        0.55,
}

def face_score(face_count: int, size_tier: str) -> float:
    if face_count >= 3:
        return 0.50
    key = (min(face_count, 2), size_tier if face_count > 0 else None)
    return SCORE_TABLE.get(key, 0.50)
```

Dependencies: `onnxruntime>=1.17`, `opencv-python>=4.9`, `numpy>=1.26`, `Pillow>=10.0`

### Next.js component

```
File: ui/src/components/application/ad-scoring/FaceCountCard.tsx

Props interface:
  interface FaceCountCardProps {
    adId: number;
    score: number | null;
    tier: "no_face" | "optimal" | "faces_too_small" | "crowded" | null;
    faceCount: number | null;
    maxFaceCoverage: number | null;     // 0.0–1.0
    dominantFaceSizeTier: "micro" | "small" | "readable" | "large" | null;
    faceBoxes: Array<{ x1: number; y1: number; x2: number; y2: number; confidence: number }> | null;
    imageUrl: string;
    nullWithReason?: string;
  }

Render:
  - Large numeric counter badge: "N Faces" (0, 1, 2, 3+)
  - Ad image with colored bounding box overlays for each detected face
    (color varies by index: teal, coral, yellow, …)
  - Sub-metric chip: "Largest face: X% of frame" with colored dot
    (red < 2%, amber 2–5%, green 5–30%, amber > 30%)
  - Tier badge: no_face=gray, optimal=green, faces_too_small=amber, crowded=amber
  - If nullWithReason is set: gray "N/A" badge with tooltip
```

### Failure mode

```python
# null_with_reason values:
"image_decode_error"          # PIL/base64 decode failed
"image_too_small"             # image < 64×64 px
"face_detector_model_missing" # no ONNX model AND OpenCV cascade unavailable
"inference_exception"         # both detection paths threw runtime exceptions
```

Return `score: null, tier: null, face_count: null` for all above cases.
