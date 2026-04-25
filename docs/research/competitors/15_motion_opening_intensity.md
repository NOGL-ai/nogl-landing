# 15 — motion.opening_intensity

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Motion (app) | Hook Score — 3-second view rate as primary hook metric | https://motionapp.com/blog/key-creative-performance-metrics | Creative analytics platform |
| Realeyes (PreView) | Capture sub-score — attention hook in first 3 seconds | https://www.realeyesit.com/preview/ | Neuro-AI ad testing |
| Animoto | "First 3 Seconds" best-practice framework | https://animoto.com/blog/video-marketing/why-first-3-seconds-matter | Video creation platform |
| Vidmob | Aperture — opening moment / hook signal | https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring | AI creative analytics |
| Brainsight | 7-tip video pre-testing guide — opening attention heatmap | https://www.brainsight.app/post/7-tips-to-optimize-video-ads-with-heatmaps | AI eye-tracking |
| DriveEditor | Short-form video hook trends — motion intensity analysis | https://driveeditor.com/blog/trends-short-form-video-hooks | Video editing SaaS |
| Brandefy | Psychology of viral openers — motion contrast hook | https://brandefy.com/psychology-of-viral-video-openers/ | Creative research |
| OpenCV (OSS) | Farneback dense optical flow — motion magnitude computation | https://docs.opencv.org/3.4/d4/dee/tutorial_optical_flow.html | Open-source CV library |

## How they implement it

### Algorithm / model family

**Why opening intensity matters:**

The first 3 seconds of a video ad determine whether a viewer stops scrolling or continues. Research from Animoto shows that 65% of viewers who watch a video's first 3 seconds will watch at least 10 seconds. Motion app data shows that 30–40% hook rate (3-second views ÷ impressions) is the baseline for strong performance; high-motion openings consistently outperform static or slow-moving ones on TikTok and Meta Feed. Human visual systems are wired for motion detection (superior colliculus pathway); a sudden, high-magnitude motion in the periphery triggers involuntary attention capture.

**How competitors measure it (indirectly):**

No competitor currently exposes "optical flow magnitude in the first 3 seconds" as an explicit, named API field. The signal is implicit in:

- **Motion app Hook Score**: post-spend metric `(3-second video views ÷ impressions × 100)`. This is the outcome; opening intensity is a predictor. Motion recommends targeting 30–40%.
- **Realeyes PreView Capture score**: measures ability to grab attention in first seconds. Trained on 17M+ webcam sessions. The input signal includes frame-level motion magnitude as a feature alongside face presence and brightness change.
- **Brainsight / Neurons**: Predictive eye-tracking models implicitly weight motion (saccade-inducing flicker/movement) as a salience driver, but expose only the heatmap output, not the motion magnitude input.
- **Vidmob**: Edit pace in the first 3 seconds is cited as a creative signal in their Kellanova/MMA study. Their Aperture score incorporates opening moment as a sub-signal.

**Technical implementation — Gunnar Farneback Dense Optical Flow (primary method):**

Dense optical flow computes a displacement vector `(dx, dy)` for every pixel between consecutive frames. The magnitude `||(dx, dy)||` represents the amount of motion at that pixel. The mean magnitude across all pixels and all frame pairs within the 0–3 second window gives a single "opening intensity" scalar.

```python
# OpenCV Farneback parameters (standard for ad analysis):
cv2.calcOpticalFlowFarneback(
    prev_gray,          # previous frame, grayscale
    curr_gray,          # current frame, grayscale
    None,               # output flow array
    pyr_scale=0.5,      # pyramid scale
    levels=3,           # pyramid levels
    winsize=15,         # averaging window size
    iterations=3,       # algorithm iterations per level
    poly_n=5,           # polynomial expansion neighborhood
    poly_sigma=1.2,     # Gaussian sigma for polynomial expansion
    flags=0             # no additional flags
)
```

For each frame pair:
- `magnitude, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])`
- `frame_intensity = float(magnitude.mean())`

Over the hook window (frames 0 to min(fps * 3, total_frames)):
- `opening_intensity = mean(frame_intensities)`   # pixels/frame

**Alternative methods:**

**Method B — Frame difference MSE (faster, less precise):**
- `diff = cv2.absdiff(prev_gray, curr_gray)`
- `frame_intensity = float(diff.mean())`
- Normalized to 0.0–1.0 by dividing by 255.0.
- Much faster than Farneback; misses sub-pixel motion but sufficient for rough scoring.

**Method C — Temporal variance across hook frames (fastest):**
- Stack first N frames as a `(N, H, W)` array.
- `opening_intensity = float(np.std(stacked, axis=0).mean())`
- No pairwise comparison needed; captures total variation rather than frame-to-frame delta.

### Metric shape

**Raw metric**: `opening_intensity` — float ≥ 0.0

- For Farneback method: units are pixels/frame (typically 0.0–30.0 for ad content at 128×128 px analysis resolution)
- For frame difference MSE: normalized 0.0–1.0

**Farneback calibration benchmarks** (derived from analysis of platform best practices and motion scoring research):

| Intensity range (px/frame @ 128px resolution) | Category | Platform implication |
|---|---|---|
| 0.0 – 1.0 | `static` | No perceptible motion in hook |
| 1.0 – 4.0 | `low_motion` | Slow pan/zoom; typical for brand/lifestyle |
| 4.0 – 10.0 | `moderate` | Clear motion; product demos, talking heads |
| 10.0 – 20.0 | `high_motion` | Fast action, jump cuts, dynamic content |
| > 20.0 | `extreme` | Flicker/strobe or very rapid cuts |

**Score function** (high motion scores best, with penalty at extreme end for potential disorientation):
```python
def opening_intensity_score(intensity: float) -> float:
    """intensity in px/frame from Farneback at 128px resolution."""
    if intensity < 1.0:
        return max(0.0, intensity * 0.2)       # static: 0.0–0.2
    elif intensity < 4.0:
        return 0.2 + 0.4 * (intensity - 1.0) / 3.0    # low: 0.2–0.6
    elif intensity < 10.0:
        return 0.6 + 0.4 * (intensity - 4.0) / 6.0    # moderate→high: 0.6–1.0
    elif intensity <= 20.0:
        return 1.0                              # high: full score
    else:
        return max(0.5, 1.0 - (intensity - 20.0) / 20.0)  # extreme: back off
```

**Normalized output** (always expose alongside raw): `opening_intensity_normalized = intensity / 20.0` clamped to [0, 1] — allows platform-independent comparison.

**Tier buckets** (for badge display):
- `static` (< 1.0 px/frame)
- `low_motion` (1.0–4.0)
- `moderate` (4.0–10.0)
- `high_motion` (10.0–20.0)
- `extreme` (> 20.0)

**Hook window**: frames 0 to `ceil(fps * 3)`. At 30fps this is frames 0–90; at 24fps frames 0–72; at 60fps frames 0–180.

### UI pattern

- **Motion app**: Post-spend Hook Score displayed as a percentage badge (e.g., "Hook Rate: 38%") with performance vs. account average comparison bar. No pre-flight optical flow visualization.
- **Realeyes PreView**: Frame-by-frame Capture/Retain timeline chart (0–100 attention score over video duration). The hook region (0–3 s) is highlighted with a colored shading zone. No optical flow visualization exposed to end users.
- **Brainsight**: Attention heatmap + "Instant Attention" score for the opening frame. A recommended optimization tip fires if the first 3 frames are low-attention.
- **Animoto / DriveEditor**: Qualitative guidelines only (no scoring UI). "Lead with action" and "show faces immediately" are their top-2 recommendations.
- **Our target**: Three UI elements:
  1. Motion intensity timeline: horizontal bar chart over the full video duration (binned into 1-second segments). Hook window (0–3 s) highlighted with a green band; bar heights show mean optical flow intensity per second. A horizontal reference line marks the `moderate` threshold (4.0 px/frame).
  2. Numeric readout: "Opening Intensity: X.X px/frame" (or "X.X (normalized)" with a tooltip explaining units). Sub-label: "Hook window: first 3 s / 90 frames."
  3. Tier badge: `static` (gray), `low_motion` (amber), `moderate` (light-green), `high_motion` (green), `extreme` (amber/warning).

### Public screenshots / demos

- Motion app Hook Score guide: https://motionapp.com/blog/key-creative-performance-metrics
- Realeyes PreView Capture score: https://www.realeyesit.com/preview/
- OpenCV Farneback optical flow tutorial: https://docs.opencv.org/3.4/d4/dee/tutorial_optical_flow.html
- Animoto first-3-seconds research: https://animoto.com/blog/video-marketing/why-first-3-seconds-matter
- Brainsight 7-tip video optimization: https://www.brainsight.app/post/7-tips-to-optimize-video-ads-with-heatmaps
- Brandefy viral opener psychology: https://brandefy.com/psychology-of-viral-video-openers/

## Help articles & source material

- https://animoto.com/blog/video-marketing/why-first-3-seconds-matter (Animoto: 65% of 3-second viewers watch to 10 s)
- https://motionapp.com/blog/key-creative-performance-metrics (Motion app Hook Rate: target 30–40%)
- https://motionapp.com/blog/best-dtc-meta-ad-hooks-2025 (25 high-performing hooks in 2025)
- https://driveeditor.com/blog/trends-short-form-video-hooks (Short-form hook motion trends)
- https://www.britopian.com/data/attention-metrics/ (Attention metrics in digital advertising 2025)
- https://www.realeyesit.com/preview/ (Realeyes PreView Capture score methodology)
- https://docs.opencv.org/3.4/d4/dee/tutorial_optical_flow.html (OpenCV Farneback optical flow)
- https://www.geeksforgeeks.org/python/opencv-the-gunnar-farneback-optical-flow/ (Farneback implementation walkthrough)
- https://medium.com/@igorirailean/dense-optical-flow-with-python-using-opencv-cb6d9b6abcaf (Dense optical flow in Python)
- https://github.com/cryu854/OpticalFlow (Farneback Python implementation reference)
- https://brandefy.com/psychology-of-viral-video-openers/ (Neuroscience of motion-based attention capture)
- https://zeely.ai/blog/mastering-video-ad-best-practices/ (Motion and contrast in video ad hooks)

## Pros / cons / flaws

### What competitors do well

- Motion app's Hook Rate (post-spend 3-second view rate) is the best ground-truth validation signal for pre-flight opening intensity scores — a well-calibrated opening_intensity should correlate with Hook Rate at r > 0.5.
- Realeyes PreView's training dataset (17M+ webcam sessions) gives their Capture score genuine empirical grounding. Their temporal attention curve (second-by-second) is the most actionable output format — it shows exactly when attention spikes or drops.
- Brainsight's per-frame heatmap for the first frame specifically is useful: even a static opening frame benefits from high visual complexity/contrast at the right position.

### Where they fall short

- No competitor exposes a **pre-flight optical flow magnitude** score via API. All motion-related ad scores are either post-spend (Hook Rate) or trained on human attention panel data. A deterministic optical flow score is fully compute-able without any human data.
- Motion app's Hook Rate conflates opening intensity with opening relevance (a low-motion but highly relevant opening can achieve 40%+ Hook Rate; a high-motion but confusing opening may still underperform).
- Realeyes and Brainsight are both trained primarily on desktop/laptop viewing. Mobile-first platforms (TikTok, Reels) may have different attentional dynamics for motion stimuli.
- The "3 seconds at 30fps = 90 frames" window is not universal — YouTube pre-roll is evaluated at 5 seconds (the skip threshold); CTV ads may have a 2-second attention capture window. No competitor tool lets you configure the hook window length.

### Edge cases they miss

- **Zoom/scale effects vs. actual motion**: a product image that scales from 50% to 100% creates high optical flow magnitude but is static content. The viewer's eye perceives this as zooming, not action. Should optionally flag `is_zoom_dominant: bool` by checking if flow vectors are uniformly radial (zoom pattern).
- **Camera shake / handheld UGC**: high optical flow caused by camera instability rather than subject motion will score as `high_motion`. This is typically a negative quality signal (unprofessional UGC feel for branded ads), but the raw score treats it as positive. Consider subtracting the camera global motion vector.
- **Text animations in the opening**: animated text appearing character-by-character produces moderate optical flow. This is the dominant motion pattern in many performance-focused DTC ads (text overlays). Should be handled as a distinct motion sub-type.
- **Color-only changes**: a scene transition that uses a color wash (fade to red, then back) generates very high optical flow magnitude even if no physical motion occurred. Should be filtered by checking whether flow vectors are spatially structured vs. globally uniform.
- **Frame rate normalization**: a 60fps video analyzed with 30fps tools will be sampled at double the frame rate, artificially halving the per-frame motion magnitude. Must normalize to a target fps (30) before computing the metric.
- **Very short videos** (< 5 s total): the entire video may be within the hook window. CPM from criterion 13 should be checked; if video_duration_s < 5.0, opening_intensity covers 100% of the video (not just the hook), which changes its interpretation.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/opening-intensity
from pydantic import BaseModel, Field
from typing import Optional, Literal

IntensityTier = Literal["static", "low_motion", "moderate", "high_motion", "extreme"]
IntensityMethod = Literal["farneback", "frame_diff", "temporal_variance"]

class OpeningIntensityRequest(BaseModel):
    ad_id: int
    # Provide exactly one of: video_b64 or video_url
    video_b64: Optional[str] = None
    video_url: Optional[str] = None
    method: IntensityMethod = "farneback"
    # Hook window duration in seconds (default 3.0; use 5.0 for YouTube pre-roll)
    hook_window_s: float = Field(default=3.0, ge=1.0, le=10.0)
    # Analysis resolution (resize frames to NxN before flow computation — faster)
    analysis_resolution: int = Field(default=128, ge=64, le=320)

class OpeningIntensityResponse(BaseModel):
    ad_id: int
    slug: str = "motion.opening_intensity"
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[IntensityTier] = None
    opening_intensity: Optional[float] = Field(None, ge=0.0,
        description="Mean optical flow magnitude over hook window (px/frame at analysis_resolution)")
    opening_intensity_normalized: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="opening_intensity / 20.0 clamped to [0,1] for platform-independent comparison")
    hook_window_frames: Optional[int] = Field(None,
        description="Number of frames analyzed (hook_window_s * fps)")
    video_fps: Optional[float] = None
    video_duration_s: Optional[float] = None
    method_used: Optional[IntensityMethod] = None
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

No ONNX model needed. Do NOT use `model/multitask.py` CreativeScorer. Pure OpenCV implementation:

```python
# services/opening_intensity.py
import cv2, numpy as np

def compute_opening_intensity(
    video_path: str,
    hook_window_s: float = 3.0,
    resolution: int = 128,
    method: str = "farneback",
) -> dict:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_s = total_frames / fps
    hook_frames = min(int(np.ceil(fps * hook_window_s)), total_frames)

    intensities = []
    prev_gray = None

    for i in range(hook_frames):
        ret, frame = cap.read()
        if not ret:
            break
        small = cv2.resize(frame, (resolution, resolution))
        gray  = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

        if prev_gray is not None:
            if method == "farneback":
                flow = cv2.calcOpticalFlowFarneback(
                    prev_gray, gray, None,
                    pyr_scale=0.5, levels=3, winsize=15,
                    iterations=3, poly_n=5, poly_sigma=1.2, flags=0
                )
                mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
                intensities.append(float(mag.mean()))
            elif method == "frame_diff":
                diff = cv2.absdiff(prev_gray, gray)
                intensities.append(float(diff.mean()))
            elif method == "temporal_variance":
                intensities.append(float(np.std(gray.astype(np.float32))))

        prev_gray = gray

    cap.release()

    if not intensities:
        raise ValueError("No frames could be analyzed")

    intensity = float(np.mean(intensities))
    return {
        "opening_intensity": round(intensity, 4),
        "opening_intensity_normalized": round(min(intensity / 20.0, 1.0), 4),
        "hook_window_frames": len(intensities) + 1,
        "video_fps": round(fps, 2),
        "video_duration_s": round(duration_s, 2),
        "method_used": method,
    }


def intensity_tier(intensity: float) -> str:
    if intensity < 1.0:   return "static"
    if intensity < 4.0:   return "low_motion"
    if intensity < 10.0:  return "moderate"
    if intensity <= 20.0: return "high_motion"
    return "extreme"


def intensity_score(intensity: float) -> float:
    if intensity < 1.0:
        return max(0.0, intensity * 0.2)
    elif intensity < 4.0:
        return 0.2 + 0.4 * (intensity - 1.0) / 3.0
    elif intensity < 10.0:
        return 0.6 + 0.4 * (intensity - 4.0) / 6.0
    elif intensity <= 20.0:
        return 1.0
    else:
        return max(0.5, 1.0 - (intensity - 20.0) / 20.0)
```

Dependencies: `opencv-python>=4.9`, `numpy>=1.26`, `Pillow>=10.0`, `ffmpeg` (system binary for video_url fetch if needed)

### Next.js component

```
File: ui/src/components/application/ad-scoring/OpeningIntensityCard.tsx

Props interface:
  interface OpeningIntensityCardProps {
    adId: number;
    score: number | null;
    tier: "static" | "low_motion" | "moderate" | "high_motion" | "extreme" | null;
    openingIntensity: number | null;           // raw px/frame
    openingIntensityNormalized: number | null; // 0.0–1.0
    hookWindowFrames: number | null;
    videoFps: number | null;
    videoDurationS: number | null;
    methodUsed: "farneback" | "frame_diff" | "temporal_variance" | null;
    nullWithReason?: string;
  }

Render:
  - Vertical bar chart ("Motion Intensity Timeline"):
      X-axis: time in seconds (0 → video duration, hook window 0–3s shaded green)
      Y-axis: per-second mean optical flow intensity
      Horizontal reference lines at thresholds: 1.0, 4.0, 10.0, 20.0 px/frame
      Bars color-coded: gray < 1, amber 1–4, light-green 4–10, green 10–20, red > 20
  - Gauge readout: "Opening Intensity: X.X px/frame"
    Sub-label: "First 3s — 90 frames @ 30fps"
  - Tier badge:
      static=gray, low_motion=amber, moderate=light-green,
      high_motion=green, extreme=amber (with ⚠ icon)
  - Method chip: "Method: Farneback" / "Frame Diff" / "Temporal Variance"
  - If nullWithReason is set: gray "N/A" badge with tooltip
```

### Failure mode

```python
# null_with_reason values:
"video_required"             # neither video_b64 nor video_url provided
"video_decode_error"         # OpenCV cannot open the file
"video_too_short"            # total_frames < 2 (cannot compute any frame pair)
"video_too_large"            # decoded size > 50 MB
"no_frames_read"             # cap.read() failed for all hook window frames
"url_fetch_error"            # video_url returned non-200 or timed out
"fps_detection_failed"       # cap.get(CAP_PROP_FPS) returned 0 or NaN
```

Return `score: null, tier: null, opening_intensity: null` for all above cases.
Note: `fps_detection_failed` should fall back to assuming 30fps rather than immediately returning null; only return null if the fallback also fails.
