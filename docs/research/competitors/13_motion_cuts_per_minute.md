# 13 — motion.cuts_per_minute

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Motion (app) | Creative Analytics — video pacing / hook scoring | https://motionapp.com/blog/key-creative-performance-metrics | Creative analytics platform |
| Vidmob | Aperture — scene cut count, edit pace signal | https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring | AI creative analytics |
| CreativeX | Creative Quality — video pace / edit rhythm | https://www.creativex.com/products/creative-quality | Creative intelligence |
| Wistia | Video analytics — engagement graph (drop-off correlates with cut density) | https://wistia.com/learn/product-updates/product-spotlight-december-2024 | Video hosting + analytics |
| PySceneDetect (OSS) | Scene cut detection library — ContentDetector, HashDetector | https://www.scenedetect.com/ | Open-source CV tool |
| FFmpeg | select=scene filter — frame difference threshold cut detection | https://ffmpeg.org/ffmpeg-filters.html#select | Video processing framework |
| Sprout Social / Dash Social | TikTok benchmark reporting — edit pace best practices | https://www.dashsocial.com/social-media-benchmarks/tiktok | Social media analytics |
| Google (YouTube) | YouTube creative guidelines — pre-roll pacing best practices | https://www.thinkwithgoogle.com/marketing-strategies/video/youtube-video-ad-specs-targeting-formats/ | Platform guidelines |

## How they implement it

### Algorithm / model family

**Scene cut detection** is a solved problem in video analysis. The dominant open-source approach is inter-frame pixel difference thresholding; the main industrial implementations use the same core algorithm with platform-specific calibration.

**PySceneDetect ContentDetector** (primary reference implementation):
- Converts consecutive frames from RGB → HSV colorspace.
- Computes weighted average of per-channel absolute differences: `delta = w_h * |ΔH| + w_s * |ΔS| + w_v * |ΔV|` where default weights are `w_h=1.0, w_s=1.0, w_v=2.0` (value channel double-weighted).
- A cut is detected when `delta > threshold` (default `threshold=27.0` on a 0–255 scale).
- The `luma_only=True` mode uses only the value channel — faster and nearly as accurate for most ad content.

**PySceneDetect HashDetector** (alternative):
- Computes perceptual hash (pHash) of each frame at reduced resolution (8×8 grayscale).
- Hamming distance between consecutive frame hashes; cut when distance > `threshold` (default `threshold=5` out of 64 bits).
- More robust to noise and compression artifacts than pixel delta.

**PySceneDetect HistogramDetector**:
- Y-channel histogram difference in YUV space.
- Trades some precision for speed on heavily compressed video.

**FFmpeg `select=scene` filter**:
- Computes SAD (Sum of Absolute Differences) between consecutive frames normalized to 0..1.
- `ffprobe -v quiet -print_format json -show_frames -select_streams v -read_intervals "%+60" -f lavfi "movie=input.mp4,select=gt(scene\,0.4)" input.mp4`
- Scene score > 0.4 triggers a cut. The threshold is platform-dependent; 0.3–0.4 works for most ad content.

**Vidmob**: Uses AWS Rekognition Video `GetSegmentDetection` API (shot detection mode). Returns `ShotSegments` array with timecodes. CPM is derived as `len(segments) / (video_duration_s / 60)`.

**Our implementation**:
1. Accept video file as base64 or URL; decode to temporary file via `tempfile.NamedTemporaryFile`.
2. Run PySceneDetect `ContentDetector(threshold=27.0)` via its Python API.
3. Count detected scenes: `num_cuts = len(scene_list) - 1`.
4. `cuts_per_minute = num_cuts / (video_duration_s / 60)`.
5. Score using platform-aware buckets (see below).

### Metric shape

**Raw metric**: `cuts_per_minute` — float, typically 0.0–60.0+ for ads.

**Platform-specific sweet-spot ranges** (research-backed):
- **TikTok / Reels / Shorts** (vertical short-form, ≤ 60 s): optimal 8–15 CPM; < 5 = slow/boring; > 20 = disorienting
- **YouTube pre-roll / in-stream** (skippable 15–30 s): optimal 2–6 CPM; very fast cutting alienates the audience who chose the content
- **Meta Feed (static/15 s)**: optimal 4–8 CPM
- **CTV / Connected TV** (15–30 s): optimal 1–4 CPM (lean-back viewing; rapid cuts create fatigue)

Score formula (platform-parameterized):
```python
PLATFORM_RANGES = {
    "tiktok":   {"low": 5.0,  "opt_lo": 8.0,  "opt_hi": 15.0, "high": 20.0},
    "youtube":  {"low": 1.0,  "opt_lo": 2.0,  "opt_hi": 6.0,  "high": 10.0},
    "meta":     {"low": 2.0,  "opt_lo": 4.0,  "opt_hi": 8.0,  "high": 15.0},
    "ctv":      {"low": 0.5,  "opt_lo": 1.0,  "opt_hi": 4.0,  "high": 6.0},
    "generic":  {"low": 2.0,  "opt_lo": 4.0,  "opt_hi": 12.0, "high": 20.0},
}

def cpm_score(cpm: float, platform: str = "generic") -> float:
    r = PLATFORM_RANGES.get(platform, PLATFORM_RANGES["generic"])
    if r["opt_lo"] <= cpm <= r["opt_hi"]:
        return 1.0
    elif cpm < r["opt_lo"]:
        if cpm <= r["low"]:
            return 0.2
        return 0.2 + 0.8 * (cpm - r["low"]) / (r["opt_lo"] - r["low"])
    else:  # cpm > opt_hi
        if cpm >= r["high"]:
            return 0.2
        return 1.0 - 0.8 * (cpm - r["opt_hi"]) / (r["high"] - r["opt_hi"])
```

Tier buckets:
- `static` (CPM < platform low): too few cuts, static feel
- `optimal` (CPM within opt range): on-platform best practice
- `fast` (CPM between opt_hi and high): above ideal, still acceptable
- `frantic` (CPM > platform high): disorienting pace

### UI pattern

- **Motion app**: Creative score card shows Hook Score + Watch Score. No dedicated CPM widget is public-facing, but pacing is cited in their best practices blog as a key factor in watch score.
- **Vidmob**: Edit pace is surfaced as a component in the Aperture creative breakdown. No public UI screenshot available.
- **PySceneDetect**: CLI tool only — outputs a CSV of detected scene timecodes. No dashboard.
- **Our target**: Three UI elements:
  1. Timeline visualization: a horizontal strip showing the full video duration with vertical tick marks at each detected cut. Color of the strip: green for cuts within optimal range density, orange for too fast/slow zones.
  2. Large numeric readout: "Cuts/min: X.X" with the platform-optimal range shown as a reference bracket (e.g., "TikTok: 8–15").
  3. Tier badge: `static` (gray), `optimal` (green), `fast` (amber), `frantic` (red).

### Public screenshots / demos

- PySceneDetect documentation: https://www.scenedetect.com/docs/latest/api/detectors.html
- Motion app metrics guide: https://motionapp.com/blog/key-creative-performance-metrics
- Vidmob creative scoring FAQ: https://help.vidmob.com/en/articles/6314118-creative-scoring-frequently-asked-questions
- TikTok fast-cut engagement data (Creatify): https://creatify.ai/blog/tiktok-ads-complete-guide-to-creating-high-performing-creatives-in-2026

## Help articles & source material

- https://www.scenedetect.com/docs/latest/api/detectors.html (PySceneDetect ContentDetector, HashDetector, HistogramDetector algorithms)
- https://pypi.org/project/scenedetect/ (PySceneDetect PyPI)
- https://zwolf12.medium.com/video-scene-detection-and-classification-pyscenedetect-places365-and-mozilla-deepspeech-engine-51338e3dbacc (PySceneDetect + Places365 pipeline for video classification)
- https://github.com/Breakthrough/PySceneDetect (PySceneDetect source code)
- https://ffmpeg.org/ffmpeg-filters.html#select (FFmpeg scene filter documentation)
- https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring (Vidmob Aperture scoring methodology)
- https://motionapp.com/blog/key-creative-performance-metrics (Motion app creative metrics — hook/watch scoring)
- https://creatify.ai/blog/tiktok-ads-complete-guide-to-creating-high-performing-creatives-in-2026 (TikTok CPM pacing + engagement data)
- https://marketingltb.com/blog/statistics/tiktok-ads-statistics/ (TikTok fast-cut retention stat: +34% retention with fast-paced editing)
- https://aws.amazon.com/rekognition/video-features/ (AWS Rekognition Shot Detection — what Vidmob uses)
- https://www.thinkwithgoogle.com/marketing-strategies/video/youtube-video-ad-specs-targeting-formats/ (YouTube pre-roll creative best practices)

## Pros / cons / flaws

### What competitors do well

- AWS Rekognition's Shot Detection (used by Vidmob) handles both hard cuts and gradual transitions (fades, dissolves) — most simple pixel-delta approaches only detect hard cuts.
- PySceneDetect's `adaptive_threshold` mode can auto-calibrate the detection threshold per video, avoiding under/over-detection on high-contrast vs. low-contrast content.
- Motion app's tiered scoring (Hook → Watch → Click → Conversion) implicitly captures pacing: low Watch Score on a slowly-cut ad is a leading indicator for high mid-video drop-off.

### Where they fall short

- No competitor exposes a **platform-parameterized CPM score** — they either give you raw cut count data or a generic "edit pace" signal without reference to TikTok vs. YouTube optima.
- Gradual transitions (cross-dissolves, wipes) are not counted by PySceneDetect ContentDetector unless `threshold` is tuned very low — this is important for older-style broadcast TV cuts.
- AWS Rekognition Shot Detection is expensive at scale ($0.10 per minute of video); PySceneDetect is free but requires server-side video decoding.
- None of the tools account for **within-scene movement** (camera pan/zoom) vs. actual scene cuts — both are "dynamic" but only cuts correlate with the edit-pace signal.

### Edge cases they miss

- **Transition effects**: a 12-frame cross-dissolve triggers multiple pixel-delta spikes before settling; naive detectors produce 2–3 false cuts per transition. PySceneDetect's min_scene_len parameter (default 15 frames) suppresses most of these.
- **Flicker / strobe effects**: rapid on/off flicker (e.g., a neon sign effect) produces very high CPM readings. Should be detected separately and exempted from the CPM count (and flagged as an accessibility concern).
- **Freeze frames / still sections**: a 10-second product shot within an otherwise fast-paced ad will pull CPM down dramatically. The metric should optionally report `active_segment_cpm` (CPM computed only over the first N seconds to match the "hook" evaluation window).
- **Very short videos** (< 5 s): CPM is unreliable for clips under 5 seconds because even 1 cut produces a CPM of 12+. Should return `null_with_reason: "video_too_short"` for videos < 5 s.
- **Variable frame rate**: VFR video (common in phone-recorded UGC) causes frame timestamp errors in PySceneDetect. Must normalize to CFR via `ffmpeg -vf fps=30` before analysis.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/cuts-per-minute
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

PlatformTarget = Literal["tiktok", "youtube", "meta", "ctv", "generic"]
CpmTier = Literal["static", "optimal", "fast", "frantic"]

class CutsPerMinuteRequest(BaseModel):
    ad_id: int
    # Provide exactly one of: video_b64 (base64 MP4/MOV ≤ 50 MB) or video_url
    video_b64: Optional[str] = None
    video_url: Optional[str] = None
    platform: PlatformTarget = "generic"
    # Optional: override detection threshold (default 27.0 for ContentDetector)
    detection_threshold: float = Field(default=27.0, ge=5.0, le=100.0)

class CutsPerMinuteResponse(BaseModel):
    ad_id: int
    slug: str = "motion.cuts_per_minute"
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[CpmTier] = None
    cuts_per_minute: Optional[float] = Field(None, ge=0.0,
        description="Detected scene cuts per minute of video")
    total_cuts: Optional[int] = Field(None, ge=0)
    video_duration_s: Optional[float] = Field(None, ge=0.0)
    platform_optimal_range: Optional[str] = Field(None,
        description="e.g. '8–15 CPM (TikTok)'")
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

No neural network model needed. Use PySceneDetect + FFmpeg only:

```python
# services/cuts_per_minute.py
import tempfile, os, subprocess
from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector

def detect_cuts(video_path: str, threshold: float = 27.0) -> dict:
    """Returns dict with total_cuts, video_duration_s, cuts_per_minute."""
    video = open_video(video_path)
    sm = SceneManager()
    sm.add_detector(ContentDetector(threshold=threshold, luma_only=True))
    sm.detect_scenes(video, show_progress=False)
    scenes = sm.get_scene_list()
    duration_s = video.duration.get_seconds()
    num_cuts = max(len(scenes) - 1, 0)
    cpm = num_cuts / (duration_s / 60.0) if duration_s > 0 else 0.0
    return {
        "total_cuts": num_cuts,
        "video_duration_s": round(duration_s, 2),
        "cuts_per_minute": round(cpm, 2),
    }
```

For VFR normalization (run before analysis if needed):
```bash
ffmpeg -i input.mp4 -vf fps=30 -c:v libx264 -preset ultrafast output_cfr.mp4
```

Dependencies: `scenedetect[opencv]>=0.6.3`, `opencv-python>=4.9`, `ffmpeg` (system binary, required for video decoding backend)

### Next.js component

```
File: ui/src/components/application/ad-scoring/CutsPerMinuteCard.tsx

Props interface:
  interface CutsPerMinuteCardProps {
    adId: number;
    score: number | null;
    tier: "static" | "optimal" | "fast" | "frantic" | null;
    cutsPerMinute: number | null;
    totalCuts: number | null;
    videoDurationS: number | null;
    platformOptimalRange: string | null;   // e.g. "8–15 CPM (TikTok)"
    platform: string;
    nullWithReason?: string;
  }

Render:
  - Horizontal "cut density timeline" SVG strip:
      Width proportional to video duration.
      Vertical tick marks at each detected cut position (evenly distributed
      from the total cuts count if exact positions not returned).
      Strip background color: green in optimal CPM zone, amber in fast/static,
      red in frantic zone.
  - Large numeric readout: "X.X cuts/min" with reference bracket chip
    "Platform optimal: 8–15 (TikTok)"
  - Tier badge: static=gray, optimal=green, fast=amber, frantic=red
  - If nullWithReason is set: gray "N/A" badge with tooltip
```

### Failure mode

```python
# null_with_reason values:
"video_required"              # neither video_b64 nor video_url provided
"video_decode_error"          # ffmpeg/OpenCV cannot open the file
"video_too_short"             # video_duration_s < 5.0 — CPM not meaningful
"video_too_large"             # video_b64 decoded size > 50 MB
"scenedetect_exception"       # PySceneDetect threw a runtime exception
"url_fetch_error"             # video_url returned non-200 or timed out
```

Return `score: null, tier: null, cuts_per_minute: null` for all above cases.
