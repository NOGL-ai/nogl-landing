# 22 — faces.emotion_strength

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Affectiva (iMotions) | Affdex Facial Coding SDK / Media Analytics | https://imotions.com/products/affectiva-facial-coding-sdk/ | Emotion AI / ad testing |
| Realeyes (now Adverteyes) | PreView — Emotion Analytics Platform | https://adverteyes.ai/human-measurement/ | Webcam-based emotion measurement |
| iMotions | Facial Expression Analysis (FEA) module | https://imotions.com/products/imotions-lab/modules/fea-facial-expression-analysis/ | Biometric research platform |
| Microsoft Azure AI | Face API — Emotion detection | https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/how-to/use-face-api | Cloud vision API |
| Amazon Rekognition | DetectFaces — FaceDetail.Emotions | https://docs.aws.amazon.com/rekognition/latest/dg/faces-detect-images.html | Cloud vision API |
| Smart Eye (Affectiva acquirer) | Affdex for Market Research | https://go.smarteye.se/affdex-for-market-research | Automotive + media research |
| AdAmigo.ai | Emotional Trigger Testing for Ads | https://www.adamigo.ai/blog/ai-tools-for-testing-emotional-triggers-in-ads | AI ad testing |
| Neurons Inc | Predict AI — Engagement score | https://www.neuronsinc.com/neurons-ai | Neuroscience-based creative testing |

## How they implement it

### Algorithm / model family

**Industry standard pipeline: face detection → landmark alignment → expression classification**

**Stage 1 — Face detection**

All production systems use a fast face detector as the first stage. Common choices:
- MediaPipe FaceDetector (BlazeFace) — sub-millisecond on CPU, returns bounding box + 6 keypoints.
- MTCNN (Multi-task Cascaded CNN) — more accurate but ~3× slower.
- RetinaFace — best accuracy for small/occluded faces; ONNX available (`retinaface_resnet50.onnx`).

**Stage 2 — Face alignment and normalisation**

Align detected face to a canonical 68-point landmark template using affine transform. MediaPipe FaceMesh provides 468 landmarks for precise alignment. Crop and resize to 112×112 px (standard for ArcFace-family models) or 224×224 px for ResNet-based classifiers.

**Stage 3 — Emotion classification**

Two dominant approaches in production:

*Approach A — Action Unit (AU) based (Affectiva Affdex)*: Detect 20+ Facial Action Units (FACS system) from the aligned face. Combine AU activations through a learned mapping to emotion labels. Affectiva's Affdex SDK detects 7 basic emotions (joy, fear, disgust, sadness, anger, surprise, contempt) plus confusion and sentimentality. Each emotion score is in **0–100** (probability of expression being present). A threshold of **50** is recommended as initial detection boundary.

*Approach B — End-to-end CNN classifier*: FER-2013 / RAF-DB trained CNNs (e.g., ResNet-18 or EfficientNet-B0) output 7-class softmax. Labels: `angry`, `disgust`, `fear`, `happy`, `sad`, `surprise`, `neutral`. Output is a probability vector; the argmax gives the dominant emotion and the corresponding softmax value gives the intensity in **[0, 1]**.

For our stack, Approach B (lightweight CNN classifier) is preferred because Affdex SDK requires a commercial licence. DeepFace (pip: `deepface`) wraps multiple backends (VGG-Face, OpenCV, SSD) and exposes FER2013 emotion outputs normalised to **[0, 100]** natively. Internally normalise to **[0.0, 1.0]** for the API.

**Stage 4 — Video aggregation**

For video ads, sample at 5 fps. For each face per frame, record the dominant emotion and intensity. Aggregate across the video:
- `dominant_emotion`: label with highest cumulative weight (intensity × frame_count).
- `emotion_intensity`: peak intensity of `dominant_emotion` across all frames.
- `happiness_mean`: mean joy/happy score across all frames with a detected face (this is the engagement-predictive metric per Nielsen and Affectiva research).
- `surprise_peak`: max surprise score across all frames.

Ad-testing research (Affectiva / Nielsen 2016 study, 100k+ ad exposures): happiness response correlates r=0.52 with brand recall; surprise correlates r=0.41 with purchase intent.

```python
from deepface import DeepFace
import numpy as np

def analyse_frame_emotions(frame_bgr):
    try:
        result = DeepFace.analyze(
            img_path=frame_bgr,
            actions=["emotion"],
            enforce_detection=False,
            detector_backend="retinaface"
        )
        emotions = result[0]["emotion"]  # dict: label -> float 0-100
        dominant = result[0]["dominant_emotion"]
        intensity = emotions[dominant] / 100.0
        return {"emotions": {k: v/100.0 for k, v in emotions.items()},
                "dominant": dominant, "intensity": intensity}
    except Exception:
        return None
```

### Metric shape

| Metric | Type | Range | Interpretation |
|---|---|---|---|
| `dominant_emotion` | enum | `happy`, `surprise`, `neutral`, `sad`, `angry`, `fear`, `disgust` | Most prevalent emotion across video |
| `emotion_intensity` | float | 0.0 – 1.0 | Intensity of dominant emotion (0 = absent, 1 = fully expressed) |
| `happiness_mean` | float | 0.0 – 1.0 | Mean happiness score across all frames; primary engagement proxy |
| `surprise_peak` | float | 0.0 – 1.0 | Peak surprise score; secondary engagement proxy |
| `positive_rate` | float | 0.0 – 1.0 | Fraction of frames where `happy` or `surprise` is dominant |
| `engagement_tier` | enum | `low`, `medium`, `high` | Bucketed: low < 0.2, medium 0.2–0.5, high > 0.5 (happiness_mean) |

Affectiva (0–100 scale) threshold for "emotion detected": score > 50. In our normalised [0, 1] scale this maps to > 0.5.

Realeyes tracks "Happiness Peaks" as discrete events (frame-level spikes) and "Negativity Peaks." Our implementation tracks continuous means and a peak value instead.

### UI pattern

- **Emotion timeline**: stacked area chart (using a `<AreaChart>` chart component) showing happiness, surprise, and neutral scores per sampled frame across the video duration. Happiness in green, surprise in yellow, neutral in grey.
- **Dominant emotion badge**: large emoji-style pill with the dominant emotion label and intensity as a percentage (e.g., "HAPPY 73 %").
- **Gauge pair**: two `<RadialBarChart>` dials side-by-side — "Happiness Mean" and "Surprise Peak" — coloured green and amber respectively.
- **Engagement tier badge**: `LOW` / `MEDIUM` / `HIGH` tier pill in the card header, coloured red/amber/green.
- **Per-face overlay** (optional): on the keyframe thumbnail, bounding box coloured by dominant emotion for that frame.

### Public screenshots / demos

- Affectiva emotion AI for ad testing: https://go.affectiva.com/emotion-ai-for-ad-testing
- Realeyes PreView platform overview: https://adverteyes.ai/human-measurement/
- iMotions facial expression analysis: https://imotions.com/products/imotions-lab/modules/fea-facial-expression-analysis/
- Amazon Rekognition face emotions demo: https://docs.aws.amazon.com/rekognition/latest/dg/faces-detect-images.html

## Help articles & source material

- Affectiva Facial Coding API (HTTP, JSON/CSV output): https://imotions.com/products/affectiva-facial-coding-api/
- AI-Driven Emotion Recognition 101 (iMotions blog): https://imotions.com/blog/insights/research-insights/ai-driven-emotion-recognition/
- Affectiva for market research (Smart Eye): https://go.smarteye.se/affdex-for-market-research
- Realeyes Developer Portal: https://documentation.realeyesit.com/
- DeepFace library (GitHub): https://github.com/serengil/deepface
- FER2013 dataset and RAF-DB (emotion recognition benchmarks): https://paperswithcode.com/dataset/fer2013
- Comparison of Affectiva iMotions FEA vs EMG (Frontiers in Psychology): https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.00329/full
- Amazon Rekognition DetectFaces docs: https://docs.aws.amazon.com/rekognition/latest/dg/faces-detect-images.html
- Azure Face API emotion detection: https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/how-to/use-face-api
- MediaPipe FaceDetector (BlazeFace): https://mediapipe.readthedocs.io/en/latest/solutions/face_detection.html
- Top 10 companies in emotion AI market 2025: https://www.emergenresearch.com/blog/top-10-companies-in-global-emotion-ai-market
- AI tools for testing emotional triggers in ads (AdAmigo): https://www.adamigo.ai/blog/ai-tools-for-testing-emotional-triggers-in-ads

## Pros / cons / flaws

### What competitors do well

- Affectiva/iMotions offers the most granular output: 20+ Action Units plus 9 compound emotion labels, all scored on a continuous 0–100 scale. Frame-by-frame JSON/CSV export is production-ready.
- Realeyes provides second-by-second emotional traces with "Happiness Peaks" flagged as discrete events, which are directly actionable for creative editing (trim the low-happiness segment).
- Amazon Rekognition and Azure Face API require zero model management — single HTTP call returns bounding box + emotion probabilities in under 200 ms, ideal for batch pipelines.
- Neurons Inc combines emotion signal with neuroscience-based memory prediction, producing an "Engagement" score that is validated against EEG data.

### Where they fall short

- Affectiva's SDK is not free — commercial licence required; no public ONNX export.
- Realeyes requires live webcam panel recruitment for consumer testing; it cannot score static creatives from a file path alone.
- Amazon Rekognition "disgust," "contempt," and "fear" are often confused with each other at moderate intensities; confidence intervals are not returned.
- All cloud APIs send frames to external servers — a GDPR concern for ads featuring real consumer faces.
- None of the listed tools expose `happiness_mean` as a pre-computed creative-level aggregate; all require post-processing raw frame data.

### Edge cases they miss

- **Faces in illustration/cartoon style**: DeepFace and Affdex fail on drawn characters (common in DTC/gaming ads); output will be random or all-`neutral`. Detect cartoon faces with a separate classifier or skip emotion scoring.
- **Multiple faces**: aggregation strategy matters — do you average across all faces, or report the most prominent (largest) face only? Competitors differ; our implementation should default to the largest-bounding-box face.
- **Occluded or partial faces** (face only in bottom third of frame, e.g., smiling mouth only): detectors miss these. `enforce_detection=False` in DeepFace returns a low-confidence result — add a minimum face area filter (face bbox area ≥ 1 % of frame area).
- **Low-light / heavily filtered video** (dark aesthetic common in luxury/finance ads): face detection fails; return `null_with_reason: "no_face_detected"` rather than `neutral` with intensity 0.
- **Static image ads**: run analysis on the single image frame; set `happiness_mean` = single-frame happiness score. No aggregation needed.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class FacesEmotionStrengthRequest(BaseModel):
    asset_id: str
    sample_fps: int = Field(default=5, ge=1, le=15,
        description="Frames per second to sample for emotion analysis")
    face_selection: Literal["largest", "all_average"] = Field(
        default="largest",
        description="Use largest detected face per frame, or average across all faces")

class FacesEmotionStrengthScore(BaseModel):
    slug: Literal["faces.emotion_strength"] = "faces.emotion_strength"
    dominant_emotion: Optional[Literal[
        "happy", "surprise", "neutral", "sad", "angry", "fear", "disgust"
    ]] = None
    emotion_intensity: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Intensity of dominant emotion, normalised 0-1")
    happiness_mean: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Mean happiness score across all frames with detected face")
    surprise_peak: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Peak surprise score across all frames")
    positive_rate: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Fraction of frames where happy or surprise is dominant emotion")
    engagement_tier: Optional[Literal["low", "medium", "high"]] = None
    null_with_reason: Optional[str] = Field(None,
        description="Populated when metric cannot be computed")
```

**Endpoint**: `POST /score/faces/emotion-strength`

### ONNX / model dependency

- **Preferred runtime**: `deepface` pip package with `retinaface` detector backend. Add to `requirements.txt`: `deepface>=0.0.93`.
- **ONNX path**: export FER+ or RAF-DB ResNet-18 emotion classifier to `model/weights/emotion_classifier.onnx`. Load once in `model/multitask.py` CreativeScorer:
  ```python
  import onnxruntime as ort
  self.emotion_session = ort.InferenceSession("model/weights/emotion_classifier.onnx")
  ```
  Input: aligned face crop `[1, 3, 224, 224]` float32 normalised; output: softmax probabilities `[1, 7]` for `[angry, disgust, fear, happy, sad, surprise, neutral]`.
- Alternatively, reuse the existing ResNet-50 backbone in `model/multitask.py` CreativeScorer as a feature extractor and add a 7-class emotion head trained on RAF-DB.

### Next.js component

**Filename**: `FacesEmotionStrengthCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/FacesEmotionStrengthCard.tsx`

```typescript
interface FacesEmotionStrengthCardProps {
  slug: "faces.emotion_strength";
  dominantEmotion: "happy" | "surprise" | "neutral" | "sad" | "angry" | "fear" | "disgust" | null;
  emotionIntensity: number | null;    // 0–1
  happinessMean: number | null;       // 0–1, primary engagement proxy
  surprisePeak: number | null;        // 0–1
  positiveRate: number | null;        // 0–1
  engagementTier: "low" | "medium" | "high" | null;
  frameEmotions?: Array<{ frameS: number; happy: number; surprise: number; neutral: number }>;
  nullWithReason?: string;
}
```

Render an emotion badge (emoji + label) for `dominantEmotion`, a `<RadialBarChart>` for `emotionIntensity`, and a `<AreaChart>` sparkline for `frameEmotions` showing happiness (green) and surprise (amber) across video time. Tier badge `LOW`/`MEDIUM`/`HIGH` in card header.

### Failure mode

```json
{
  "slug": "faces.emotion_strength",
  "dominant_emotion": null,
  "emotion_intensity": null,
  "happiness_mean": null,
  "engagement_tier": null,
  "null_with_reason": "no_face_detected"
}
```

Other valid `null_with_reason` values: `"cartoon_or_illustrated_face"`, `"face_area_too_small"`, `"low_confidence_all_frames"`, `"asset_is_static_image_no_face"`, `"decoding_error"`.
