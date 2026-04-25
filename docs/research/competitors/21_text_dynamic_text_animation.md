# 21 — text.dynamic_text_animation

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Vidmob | Creative Analytics — Frame-by-frame text tagging | https://vidmob.com/creative-scoring | Creative data platform |
| Segwise | AI Creative Intelligence — on-screen text tagging | https://segwise.ai/ | Mobile UA creative analytics |
| Pencil | Predictive Performance — video element breakdown | https://trypencil.com/ | Generative ad platform |
| AdSkate | Creative Element Analytics | https://www.adskate.com | AI creative analytics |
| AdCreative.ai | Creative Scoring AI — video analysis | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Bestever.ai | Ad Analysis — text pacing | https://www.bestever.ai/lp/analytics | AI creative analytics |
| Motion (motionapp) | Creative Analytics — text performance | https://motionapp.com/ | Creative performance analytics |

## How they implement it

### Algorithm / model family

No competitor publicly documents a dedicated "text animation detection" pipeline; however, frame-by-frame text detection combined with bounding-box displacement analysis is the standard academic and production approach.

**Stage 1 — Per-frame text detection**

Use CRAFT (Character Region Awareness for Text Detection; clovaai/CRAFT-pytorch) or the lighter EAST detector (via `cv2.dnn.readNet("frozen_east_text_detection.pb")`). CRAFT produces word-level bounding boxes `[x1, y1, x2, y2]` per frame. Sample the video at a reduced frame rate (5–10 fps is sufficient for animation detection; typography does not move faster than ~30 px/frame).

```python
import cv2
from craft_text_detector import Craft

craft = Craft(output_dir=None, crop_type="poly", cuda=False)

# Per-frame loop:
bboxes_per_frame = []
for frame_idx, frame in sampled_frames:
    result = craft.detect_text(frame)
    bboxes_per_frame.append({
        "frame": frame_idx,
        "boxes": result["boxes"]   # list of [x1,y1,x2,y2] quads
    })
```

**Stage 2 — Cross-frame identity matching**

Match text regions across consecutive frames using IoU overlap (threshold 0.4). A text block present in frame N with IoU > 0.4 to a block in frame N+1 is considered the same text element. Track centroids across matched pairs.

```python
def centroid(box):
    return ((box[0]+box[2])/2, (box[1]+box[3])/2)

def iou(a, b):
    xi1, yi1 = max(a[0],b[0]), max(a[1],b[1])
    xi2, yi2 = min(a[2],b[2]), min(a[3],b[3])
    inter = max(0, xi2-xi1) * max(0, yi2-yi1)
    area_a = (a[2]-a[0])*(a[3]-a[1])
    area_b = (b[2]-b[0])*(b[3]-b[1])
    return inter / (area_a + area_b - inter + 1e-6)
```

**Stage 3 — Trajectory variance computation**

For each tracked text element, collect its centroid trajectory `[(cx_t0, cy_t0), (cx_t1, cy_t1), ...]`. Compute displacement variance:

```python
import numpy as np

def bbox_trajectory_variance(centroids: list[tuple]) -> float:
    if len(centroids) < 2:
        return 0.0
    pts = np.array(centroids, dtype=float)
    displacements = np.diff(pts, axis=0)          # (N-1, 2)
    magnitudes = np.linalg.norm(displacements, axis=1)
    return float(np.var(magnitudes))              # variance of step magnitudes
```

A high variance indicates non-uniform motion (e.g., ease-in kinetic type, bounce, or staggered reveal). A low variance close to zero indicates either a static text block or a constant-speed pan.

Additionally compute `mean_displacement_px` (mean step magnitude across frames): values above ~3 px/frame at 10 fps sampling confirm motion.

**Stage 4 — Animation classification**

| Condition | Label |
|---|---|
| `mean_disp < 2 px` and `variance < 1.0` | `static` |
| `mean_disp >= 2 px` and `variance < 5.0` | `slide` (linear pan) |
| `mean_disp >= 2 px` and `variance >= 5.0` | `kinetic` (non-linear / eased motion) |
| Text present in frame N, absent in N+1 (fade-out via area drop) | `fade` |
| Text absent in frame N, present in N+1 | `appear` |

Aggregate to a video-level `animation_type` = the most prevalent non-`static` label, plus a boolean `has_animated_text`.

### Metric shape

| Metric | Type | Range | Interpretation |
|---|---|---|---|
| `has_animated_text` | bool | true/false | Primary binary flag |
| `animation_type` | enum | `static`, `slide`, `kinetic`, `fade`, `appear`, `mixed` | Dominant animation type |
| `text_motion_score` | float | 0.0 – 10.0 | Composite; 0 = fully static, 10 = aggressive kinetic typography |
| `mean_displacement_px` | float | 0.0 – frame_width | Mean px/frame displacement of text centroids |
| `trajectory_variance` | float | 0.0 – unbounded | Variance of step magnitudes; > 10 = kinetic |
| `animated_text_onset_s` | float | 0.0 – duration | Timestamp of first text animation |

Thresholds from ad-testing literature: ads with animated text in the first 3 seconds show 15–30 % higher dwell time on social feeds (Pencil internal data; Meta Creative Guidance 2024).

### UI pattern

- **Timeline annotation**: coloured span markers below the video scrubber — grey for `static` text, blue for `slide`, purple for `kinetic`, orange for `appear`/`fade`.
- **Overlay mode**: per-frame bounding box drawn on the keyframe preview with a motion-trail ghost (semi-transparent prior-frame bbox shifted slightly) to visualise trajectory.
- **Numeric badge**: `text_motion_score` displayed as a 0–10 pill badge with tier label `STATIC` / `ANIMATED` / `KINETIC`.
- **Stat row**: "Animated text onset: 1.2 s" and "Animation type: kinetic" shown as metadata below the score.

### Public screenshots / demos

- Segwise creative tagging demo (on-screen text analysis): https://segwise.ai/blog/understanding-creative-intelligence-examples-insights
- Vidmob creative element tagging overview: https://help.vidmob.com/en/articles/6376785-what-creative-elements-can-creative-analytics-identify
- CRAFT text detection Colab: https://colab.research.google.com/github/tugstugi/dl-colab-notebooks/blob/master/notebooks/CRAFT.ipynb

## Help articles & source material

- CRAFT text detection (clovaai): https://github.com/clovaai/CRAFT-pytorch
- craft-text-detector PyPI package: https://pypi.org/project/craft-text-detector/
- EAST text detector with OpenCV (PyImageSearch): https://pyimagesearch.com/2018/08/20/opencv-text-detection-east-text-detector/
- Scene Text Detection with EAST and CRAFT (Technovators): https://medium.com/technovators/scene-text-detection-in-python-with-east-and-craft-cbe03dda35d5
- OpenCV optical flow docs: https://docs.opencv.org/4.x/dc/d6b/group__video__track.html
- Object tracking path mapping (Lucas-Kanade): https://medium.com/@siromermer/object-tracking-and-path-mapping-using-lucas-kanade-optical-flow-in-opencv-2ea018e391d4
- Vidmob creative scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- Segwise creative intelligence platform: https://segwise.ai/blog/top-creative-intelligence-tools
- AdSkate creative analytics guide 2025: https://www.adskate.com/blogs/what-is-creative-analytics-guide-2025
- Top 10 AI tools transforming ad creative analysis (AdSkate): https://www.adskate.com/blogs/top-10-ai-tools-transforming-ad-creative-analysis-in-2025

## Pros / cons / flaws

### What competitors do well

- Vidmob's frame-by-frame element tagging catches text presence timing correctly (onset frame is accurate).
- Segwise correctly treats on-screen text as a separate dimension from voiceover/audio, avoiding conflation of copy type and delivery.
- Pencil tags "text style" (static headline vs. animated lower-third) and maps it to quartile ROAS, providing business context.
- AdSkate maps specific text styles to performance outcomes (e.g., "bold kinetic text correlates with +12 % CTR for fitness vertical").

### Where they fall short

- No competitor publicly exposes trajectory variance as a metric; all reduce to binary "has text animation" or a presence timestamp.
- Vidmob does not distinguish animation type (`slide` vs. `kinetic` vs. `fade`) — all animated text is treated equivalently.
- Segwise's tagging is multimodal NLP-heavy; it detects what text says but not how it moves.
- None handle 3D text (text with perspective/depth transformation), which is common in After Effects-style mobile ads.

### Edge cases they miss

- **Subtitle/caption tracks**: SRT/ASS subtitle burns appearing sequentially get incorrectly labelled `appear` repeatedly; need a minimum persistent-display-duration filter (> 0.5 s per block before classifying as animated).
- **Opacity-only fades**: text that fades in without moving has zero centroid displacement — `static` label is technically correct but misleading; need per-pixel alpha variance on the text region.
- **Warped/curved text** (e.g., text on a spinning product): CRAFT bounding boxes flicker, producing false high variance; apply a median filter over centroid trajectory before variance calculation.
- **White text on white background**: CRAFT fails silently; use `text_coverage_score` (criterion 03) as a pre-filter to detect high-contrast text before running animation detection.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class TextDynamicAnimationRequest(BaseModel):
    asset_id: str
    sample_fps: int = Field(default=8, ge=1, le=30,
        description="Frames per second to sample; 8 fps sufficient for animation detection")

class TextDynamicAnimationScore(BaseModel):
    slug: Literal["text.dynamic_text_animation"] = "text.dynamic_text_animation"
    has_animated_text: Optional[bool] = None
    animation_type: Optional[Literal["static", "slide", "kinetic", "fade", "appear", "mixed"]] = None
    text_motion_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    mean_displacement_px: Optional[float] = Field(None, ge=0.0)
    trajectory_variance: Optional[float] = Field(None, ge=0.0)
    animated_text_onset_s: Optional[float] = Field(None, ge=0.0,
        description="Seconds from video start to first text animation; null if no animation")
    null_with_reason: Optional[str] = Field(None,
        description="Populated when metric cannot be computed")
```

**Endpoint**: `POST /score/text/dynamic-text-animation`

### ONNX / model dependency

- **Text detection**: `craft-text-detector` pip package (wraps CRAFT-pytorch); alternatively use `cv2.dnn.readNet("frozen_east_text_detection.pb")` bundled in the repo under `model/weights/`.
- **No separate ONNX session needed** if using craft-text-detector — it handles its own weights. To integrate with `model/multitask.py` CreativeScorer, add a `text_detector` attribute initialised once at startup:
  ```python
  from craft_text_detector import Craft
  self.text_detector = Craft(output_dir=None, crop_type="poly", cuda=torch.cuda.is_available())
  ```
- For the bounding-box tracking and variance computation, pure NumPy suffices — no additional model.

### Next.js component

**Filename**: `TextDynamicAnimationCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/TextDynamicAnimationCard.tsx`

```typescript
interface TextDynamicAnimationCardProps {
  slug: "text.dynamic_text_animation";
  hasAnimatedText: boolean | null;
  animationType: "static" | "slide" | "kinetic" | "fade" | "appear" | "mixed" | null;
  textMotionScore: number | null;        // 0–10
  meanDisplacementPx: number | null;
  trajectoryVariance: number | null;
  animatedTextOnsetS: number | null;     // seconds
  nullWithReason?: string;
}
```

Render a tier badge (`STATIC` / `ANIMATED` / `KINETIC`) derived from `animationType`, a `<RadialBarChart>` gauge for `textMotionScore` (0–10), and a stat row showing onset timestamp. When `hasAnimatedText` is false, show a muted "No text animation detected" state.

### Failure mode

```json
{
  "slug": "text.dynamic_text_animation",
  "has_animated_text": null,
  "animation_type": null,
  "text_motion_score": null,
  "null_with_reason": "asset_is_static_image"
}
```

Other valid `null_with_reason` values: `"video_too_short_under_1s"`, `"no_text_detected_in_any_frame"`, `"decoding_error"`, `"unsupported_format"`.
