# 16 — motion.animated_elements

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Vidmob | Creative Analytics — Motion Scoring | https://vidmob.com/creative-scoring | Creative data platform |
| Bestever.ai | Ad Analysis — Pacing & Motion Score | https://www.bestever.ai/lp/analytics | AI creative analytics |
| Motion (Metric) | Creative Analytics Platform | https://motionapp.com/ | Creative performance analytics |
| Pencil | Predictive Performance — Video Pacing | https://trypencil.com/ | Generative ad platform |
| AdCreative.ai | Creative Scoring AI — Video Analysis | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Neurons Inc | Predict AI — Video Attention | https://www.neuronsinc.com/neurons-ai | Neuroscience-based creative testing |
| Brainsight | Predictive Attention API — Video | https://www.brainsight.app/features/api | Predictive eye-tracking |
| MotionScore (motion.dev) | Animation Performance Scoring | https://score.motion.dev/ | Web animation diagnostics |

## How they implement it

### Algorithm / model family

**Standard industry pipeline for element-level motion area ratio:**

All serious implementations separate element-level animation from camera motion (global motion) before computing area ratios. The pipeline has three mandatory stages:

**Stage 1 — Global motion compensation (camera stabilisation)**

Use a sparse optical flow (Lucas-Kanade on FAST keypoints, or cv2.calcOpticalFlowPyrLK) on background regions to estimate the dominant affine / homography transform between consecutive frames. Warp the previous frame with `cv2.warpAffine` using the estimated transform, then subtract. This removes camera pan, tilt, and zoom from the residual.

Alternatively for higher accuracy use RAFT (Recurrent All-Pairs Field Transforms; arxiv 2003.12039) which produces dense flow fields and allows explicit global-motion estimation via RANSAC-based homography fitting on the flow vectors. RAFT is exportable to ONNX (`raft_small.onnx`, ~9 MB).

**Stage 2 — Per-pixel motion mask**

After compensation, apply absolute frame differencing on the warped residual:

```python
diff = cv2.absdiff(prev_warped, curr_gray)
_, mask = cv2.threshold(diff, thresh=15, maxval=255, type=cv2.THRESH_BINARY)
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel=np.ones((5,5)))
```

A MOG2 background subtractor (cv2.createBackgroundSubtractorMOG2) is a viable alternative for clips with a stable background; it handles lighting variation better than pure frame differencing.

**Stage 3 — Area ratio computation**

```python
motion_pixels = np.count_nonzero(mask)
total_pixels = mask.shape[0] * mask.shape[1]
motion_ratio = motion_pixels / total_pixels  # float in [0.0, 1.0]
```

Compute per-frame, then aggregate:
- `mean_motion_ratio` across all frames
- `peak_motion_ratio` (95th percentile frame)
- `motion_onset_frame` — first frame where `motion_ratio > 0.05` (5 % threshold)

Vidmob tags creative elements frame-by-frame and scores motion presence as a binary/graded signal. Bestever explicitly reports pacing as a 0–10 sub-score derived from motion density across the video timeline. Pencil uses motion density in the first 3 seconds as a hook-strength input.

### Metric shape

| Metric | Type | Range | Thresholds |
|---|---|---|---|
| `mean_motion_ratio` | float | 0.0 – 1.0 | low < 0.05, medium 0.05–0.30, high > 0.30 |
| `peak_motion_ratio` | float | 0.0 – 1.0 | used for clipping/overload detection |
| `motion_onset_frame` | int | 0 – N | ideal: ≤ fps (motion within first second) |
| `motion_score` | float | 0.0 – 10.0 | normalised composite; < 3 = static, 3–7 = moderate, > 7 = high energy |

Bucket labels used in UI: `static` / `low_motion` / `moderate` / `high_motion` / `max_motion`.

### UI pattern

- **Timeline bar**: frame-level motion ratio plotted as a waveform below the video scrubber. Frames with ratio > 0.30 highlighted in orange. Bestever shows this as a "pacing chart."
- **Per-frame overlay**: motion mask rendered as a semi-transparent amber overlay on a representative key frame (similar to a heatmap). High-motion pixels are opaque amber; low-motion regions are transparent.
- **Numeric gauge**: single dial 0–10 labelled "Motion Energy" with bucket badge (`STATIC` / `MODERATE` / `HIGH`).
- **Hook window callout**: a separate stat box for motion_ratio averaged over frames 0–fps*3 (first 3 seconds), flagged as "Hook Motion."

### Public screenshots / demos

- Bestever pacing analysis demo: https://www.bestever.ai/lp/analytics
- Motion (motionapp.com) creative trend reports: https://motionapp.com/creative-trends
- MotionScore animation performance tool: https://score.motion.dev/

## Help articles & source material

- Vidmob Creative Analytics help: https://help.vidmob.com/en/articles/6376785-what-creative-elements-can-creative-analytics-identify
- Vidmob Scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- Bestever creative analysis overview: https://www.bestever.ai/post/creative-analysis
- RAFT optical flow paper (arxiv): https://arxiv.org/abs/2003.12039
- RAFT ONNX export (ailia): https://medium.com/axinc-ai/raft-a-machine-learning-model-for-estimating-optical-flow-6ab6d077e178
- OpenCV background subtraction guide: https://medium.com/@siromermer/detecting-and-tracking-moving-objects-with-background-subtractors-using-opencv-f2ff7f94586f
- OpenCV frame differencing tutorial: https://pyimagesearch.com/2015/05/25/basic-motion-detection-and-tracking-with-python-and-opencv/
- SEA-RAFT improved model: https://arxiv.org/html/2405.14793v1
- CapCut optical flow explainer: https://www.capcut.com/resource/what-is-optical-flow
- Viso.ai deep-learning optical flow survey: https://viso.ai/deep-learning/optical-flow/
- Motion (motionapp) 2025 trends: https://motionapp.com/creative-trends

## Pros / cons / flaws

### What competitors do well
- Vidmob and Bestever correctly tie motion density to first-3-second hook performance, which is the metric with highest causal link to CTR on Meta/TikTok.
- Pencil disaggregates motion density by scene segment (hook vs. body vs. outro), enabling targeted creative feedback.
- Neurons and Brainsight combine motion area with attention prediction — motion in salient regions counts more.

### Where they fall short
- None publicly document whether they perform global-motion compensation. Camera pans on product shots would otherwise register as high "element motion," inflating scores.
- Bestever's frame-by-frame scoring is per-frame not per-element; you cannot distinguish "bouncing text overlay" from "person walking" — both count equally.
- Motion (motionapp) is purely performance-correlation based; it has no computer-vision scoring, only statistical association from campaign data.
- MotionScore (motion.dev) targets CSS/JS web animation, not video — scores are not transferable.

### Edge cases they miss
- **Still-image ads with animated GIF layers**: single frames show zero motion even though the ad is animated; must decode all GIF frames separately.
- **Slow-motion video** (240 fps encoded to 30 fps): the perceived motion on playback is slow; frame-differencing at 30 fps overestimates motion vs. viewer experience.
- **Text crawl / ticker**: high area but low perceived "energy" — needs a minimum connected-component size filter (e.g., discard motion blobs < 0.5 % of frame area).
- **Green-screen chroma-key edges**: MOG2 will tag chroma edges as motion due to compression artefacts; median-blur pre-processing required.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class MotionAnimatedElementsRequest(BaseModel):
    asset_id: str
    sample_fps: int = Field(default=5, ge=1, le=30,
        description="Frames per second to sample for motion analysis")
    global_motion_compensation: bool = Field(default=True,
        description="Apply homography-based camera-motion removal before analysis")

class MotionAnimatedElementsScore(BaseModel):
    slug: Literal["motion.animated_elements"] = "motion.animated_elements"
    mean_motion_ratio: Optional[float] = Field(None, ge=0.0, le=1.0)
    peak_motion_ratio: Optional[float] = Field(None, ge=0.0, le=1.0)
    hook_motion_ratio: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Mean motion ratio for the first 3 seconds")
    motion_onset_frame: Optional[int] = None
    motion_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    bucket: Optional[Literal["static", "low_motion", "moderate", "high_motion", "max_motion"]] = None
    null_with_reason: Optional[str] = Field(None,
        description="Populated when metric cannot be computed (e.g. asset is static image, or video too short < 1s)")
```

**Endpoint**: `POST /score/motion/animated-elements`

For static images (JPEG/PNG), return `null_with_reason: "asset_is_static_image"`.

### ONNX / model dependency

- **Preferred**: `cv2.calcOpticalFlowFarneback` (no ONNX needed; ships with `opencv-python`) — fastest for sampling at 5 fps.
- **Higher quality**: RAFT-Small ONNX (`raft_small.onnx`) loaded via `onnxruntime.InferenceSession`. Cache the session at startup in `model/multitask.py` CreativeScorer — add a `motion_flow_session` attribute. Input: two consecutive normalised RGB frames `[1, 3, H, W]`; output: flow field `[1, 2, H, W]`.
- **Background subtractor**: `cv2.createBackgroundSubtractorMOG2(history=5, varThreshold=25)` — reset between clips.
- No GPU required for Farneback at 5 fps sampling; RAFT-Small needs ~200 ms/frame on CPU.

### Next.js component

**Filename**: `MotionAnimatedElementsCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/MotionAnimatedElementsCard.tsx`

```typescript
interface MotionAnimatedElementsCardProps {
  slug: "motion.animated_elements";
  meanMotionRatio: number | null;
  peakMotionRatio: number | null;
  hookMotionRatio: number | null;
  motionScore: number | null;           // 0–10
  bucket: "static" | "low_motion" | "moderate" | "high_motion" | "max_motion" | null;
  frameTimeline?: number[];             // per-sampled-frame motion ratios, for sparkline
  nullWithReason?: string;
}
```

Render a horizontal sparkline (`frameTimeline`) using a `<AreaChart>` chart component with a threshold line at 0.30, plus a `<RadialBarChart>` gauge for `motionScore`. Display `hookMotionRatio` as a stat badge labelled "Hook (0–3s)".

### Failure mode

```json
{
  "slug": "motion.animated_elements",
  "mean_motion_ratio": null,
  "motion_score": null,
  "bucket": null,
  "null_with_reason": "asset_is_static_image"
}
```

Other valid `null_with_reason` values: `"video_too_short_under_1s"`, `"decoding_error"`, `"unsupported_format"`.
