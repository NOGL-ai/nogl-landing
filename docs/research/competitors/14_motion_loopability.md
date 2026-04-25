# 14 — motion.loopability

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| TikTok (internal) | Loop rate signal in FYP algorithm — rewatch is a primary ranking signal | https://norbert-kathriner.ch/en/tiktok-algorithm-2025-how-companies-can-increase-the-reach-of-their-videos-in-a-targeted-manner/ | Platform algorithm |
| Pentos | TikTok analytics — loop rate metric (rewatches ÷ plays) | https://pentos.com | TikTok analytics |
| WAN / Hailuo AI | AI loop video generation — seamless loop optimization | https://hailuoai.video/pages/blog/how-to-make-seamless-loop-videos | AI video generation |
| LoopyCut (OSS) | Automated seamless loop video creation — frame similarity scoring | https://github.com/carmelosantana/loopycut-cli | Open-source tool |
| ReelMind | AI video looping — loop quality scoring | https://reelmind.ai/blog/ai-video-looping-how-to-create-seamless-loopable-clips | AI video platform |
| Vidmob | Aperture — completion rate / loop signals for short-form content | https://vidmob.com/creative-scoring | AI creative analytics |
| Motion (app) | Watch Score — completion rate proxy for loop quality | https://help.motionapp.com/en/articles/8991407-motion-metrics-for-meta-and-tiktok | Creative analytics |
| Stack Influence | Video content optimization — loopability as retention tactic | https://stackinfluence.com/video-content-optimization-in-2025/ | Influencer marketing |

## How they implement it

### Algorithm / model family

**Why loopability matters:**

TikTok's FYP ranking algorithm weights "rewatch" (playing a video more than once) as a strong quality signal — videos with loop rates above 15% receive 4.1× more impressions than those below 5% (Pentos Q3 2025 data). On Instagram Stories and Reels, seamless loops auto-replay; a visible "seam" (visual jump at the loop point) causes users to swipe away. For paid ads on these platforms, higher loop rate → better delivery efficiency.

**How the metric is measured (first/last frame similarity):**

The technical proxy for loopability is the similarity between the first frame and the last frame of the video. A perfectly seamless loop has similarity = 1.0; a hard cut from end-scene back to opening-scene has low similarity.

Three approaches (ascending complexity):

**Method A — Perceptual hash MSE (fastest):**
- Extract frame 0 (first frame) and frame N-1 (last frame), or use a small temporal window (average of frames 0–10 and frames N-10 to N-1) to avoid thumbnail compression artifacts.
- Compute pHash (8×8 DCT-based perceptual hash) for each frame using `imagehash.phash()`.
- `hamming_distance = bin(hash_first ^ hash_last).count('1')`  (0 = identical, 64 = maximum difference)
- `similarity_phash = 1.0 - hamming_distance / 64.0`

**Method B — Per-pixel MSE on downsampled frames (fast, interpretable):**
- Resize both frames to 128×128 pixels.
- Convert to grayscale.
- `mse = np.mean((frame_first.astype(float) - frame_last.astype(float)) ** 2)`
- Normalize: `similarity_mse = max(0.0, 1.0 - mse / 10000.0)` (MSE of 10 000 ≈ completely different frames on 0–255 scale)

**Method C — CLIP embedding cosine similarity (most semantic, slower):**
- Extract first and last frames.
- Run through CLIP ViT-B/32 ONNX model.
- `similarity_clip = cosine_similarity(embed_first, embed_last)`
- CLIP captures semantic content (objects, scene type) rather than pixel-level similarity. A fade-to-black end frame will score low on pixel MSE but also low on CLIP if the opening frame is a busy scene.

**LoopyCut OSS tool**: Uses SSIM (Structural Similarity Index) + histogram analysis + perceptual hashing in an ensemble to identify the best loop point. The "loop quality score" is SSIM between candidate first/last frame pairs.

**Our implementation (recommended)**:
1. Use Method B (MSE on downsampled frames) as the primary path — no ML model, fast, easy to interpret.
2. Use Method C (CLIP cosine) as an enhanced path when `model/multitask.py` is not suitable but a CLIP ONNX is available.
3. Use Method A (pHash) as the cheapest fallback.

Additionally compute: `first_frame_avg_color` vs `last_frame_avg_color` (per-channel mean) as a secondary check — a hard cut from a bright scene to a dark scene will be immediately apparent to a human viewer even if SSIM suggests moderate similarity.

### Metric shape

- **Primary output**: `loop_similarity` — float 0.0–1.0
  - Method B MSE mapping: `similarity_mse = max(0.0, 1.0 - mse / 10000.0)`
  - Method C CLIP cosine: direct output from `cosine_similarity()`
  - Method A pHash: `1.0 - hamming / 64.0`

- **Score function** (not linear — below 0.70 is where visible seams appear):
  ```python
  def loopability_score(similarity: float) -> float:
      if similarity >= 0.90:   return 1.00   # seamless
      if similarity >= 0.80:   return 0.85   # very smooth
      if similarity >= 0.70:   return 0.65   # minor seam visible
      if similarity >= 0.50:   return 0.40   # clear seam
      return max(0.0, similarity * 0.5)      # hard cut at loop point
  ```

- **Tier buckets**:
  - `seamless` (similarity ≥ 0.90): imperceptible loop point
  - `smooth` (0.80–0.90): minor transition; most viewers won't notice
  - `visible_seam` (0.70–0.80): loop jump is perceptible
  - `hard_cut` (< 0.70): obvious discontinuity at loop point

- **Secondary flag**: `color_jump: bool` — fires when `abs(mean_color_delta) > 30` (on 0–255 scale per channel average), regardless of similarity score.

### UI pattern

- **TikTok / Pentos**: "Loop rate" is reported as a post-campaign metric (replays ÷ total plays), not a pre-flight creative signal. No pre-scoring UI available.
- **LoopyCut**: CLI-only tool. Outputs a score and the "best loop point" timecode. No visual dashboard.
- **ReelMind**: AI platform shows a "loop quality" rating (5-star scale) alongside a preview of the looped video. No API or score documented publicly.
- **Our target**: Three UI elements:
  1. Side-by-side frame comparison: first frame thumbnail on the left, last frame thumbnail on the right, with a visual "diff" overlay option (red pixels highlight large per-pixel differences).
  2. Gauge bar: "Loop Similarity: X%" with color zones (red < 70%, amber 70–80%, green 80–90%, bright-green ≥ 90%).
  3. Tier badge: `hard_cut` (red), `visible_seam` (amber), `smooth` (light-green), `seamless` (green). If `color_jump` is true, show an amber chip "Brightness jump at loop point."

### Public screenshots / demos

- Pentos TikTok loop rate metric explanation: https://pentos.com
- LoopyCut CLI: https://github.com/carmelosantana/loopycut-cli
- Hailuo AI seamless loop guide: https://hailuoai.video/pages/blog/how-to-make-seamless-loop-videos
- ReelMind AI looping explainer: https://reelmind.ai/blog/ai-video-looping-how-to-create-seamless-loopable-clips
- TikTok algorithm rewatch signal: https://norbert-kathriner.ch/en/tiktok-algorithm-2025-how-companies-can-increase-the-reach-of-their-videos-in-a-targeted-manner/

## Help articles & source material

- https://norbert-kathriner.ch/en/tiktok-algorithm-2025-how-companies-can-increase-the-reach-of-their-videos-in-a-targeted-manner/ (TikTok rewatch as ranking signal)
- https://stackinfluence.com/video-content-optimization-in-2025/ (Loopability + short-form platform strategy)
- https://creoviral.com/blog/tiktok-algorithm-2025 (TikTok loop engineering: 7–15 s sweet spot)
- https://reelmind.ai/blog/ai-video-looping-how-to-create-seamless-loopable-clips (AI loop quality scoring methodology)
- https://link.springer.com/chapter/10.1007/11596981_12 (Perceptual Hashing of Video Content — academic basis for pHash approach)
- https://dzone.com/articles/deduplication-of-videos-using-fingerprints-clip-embeddings (CLIP embeddings for frame similarity — technical pattern)
- https://github.com/carmelosantana/loopycut-cli (LoopyCut source — SSIM + pHash loop detection)
- https://medium.com/data-science/clip-model-and-the-importance-of-multimodal-embeddings-1c8f6b13bf72 (CLIP embedding cosine similarity explanation)
- https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1717129/pdf (Video similarity and loop detection — recent survey)
- https://metaghost.io/blog/what-is-perceptual-hashing-and-how-platforms-use-it (pHash fundamentals — how TikTok uses it for content deduplication)

## Pros / cons / flaws

### What competitors do well

- Pentos exposes the actual in-market loop rate (post-spend), which is ground truth. Our pre-flight signal should be validated against Pentos loop rate data when available.
- LoopyCut's ensemble approach (SSIM + histogram + pHash) is more robust than any single method — it correctly handles fade-to-black endings that fool pHash alone.
- TikTok's native algorithm naturally rewards loop quality through delivery optimization — no explicit score is needed if the creative actually loops, because delivery data reveals it. But pre-flight scoring prevents waste.

### Where they fall short

- No competitor offers a **pre-flight** loopability score via API with a defined schema. The concept is only discussed qualitatively in best-practice guides.
- Post-spend loop rate (Pentos) is confounded by creative quality in other dimensions — a video might have a high loop rate because it is short (< 7 s), not because it loops seamlessly.
- SSIM and MSE approaches are purely visual — they detect pixel continuity but not **narrative/audio** continuity. An ad with matching first/last frames but a jarring audio cut still creates a bad loop experience.
- CLIP cosine similarity requires a GPU or a slow CPU inference pass; for real-time pipelines this may be too expensive per creative.

### Edge cases they miss

- **Fade-to-black endings**: last frame is nearly black; first frame is bright. MSE is very high (similarity low), but the loop may be acceptable because the black frame acts as a natural pause. Should detect `ending_type: "fade_out"` and adjust scoring.
- **Text card endings**: an ad that ends on a static "Learn More" card. High similarity to opening only if the opening also has a similar static card. Needs special handling: if `cuts_per_minute < 1` for the last 2 seconds, flag `static_ending: true`.
- **Audio loop**: a video might have a perfect visual loop but the audio track cuts mid-phrase at the loop point. Audio loopability is a separate (important) signal not captured by frame comparison.
- **Vertical vs. horizontal**: aspect ratio changes between first/last frame (e.g., a 9:16 creative letterboxed to 16:9 by the platform) will cause per-pixel differences even for identical frames. Must normalize to the same crop region before comparison.
- **Very long videos** (> 60 s): for a 30-second brand video, loopability is irrelevant — the video is not expected to loop. Should gate this metric: `null_with_reason: "not_applicable_long_form"` for videos > 30 s.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/loopability
from pydantic import BaseModel, Field
from typing import Optional, Literal

LoopTier = Literal["seamless", "smooth", "visible_seam", "hard_cut"]
LoopMethod = Literal["mse", "phash", "clip"]

class LoopabilityRequest(BaseModel):
    ad_id: int
    # Provide exactly one of: video_b64 or video_url
    video_b64: Optional[str] = None
    video_url: Optional[str] = None
    method: LoopMethod = "mse"       # primary similarity method
    # Number of frames to average at start/end to avoid thumbnail artifacts
    window_frames: int = Field(default=5, ge=1, le=30)

class LoopabilityResponse(BaseModel):
    ad_id: int
    slug: str = "motion.loopability"
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[LoopTier] = None
    loop_similarity: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Similarity between first and last frame (method-dependent)")
    color_jump: Optional[bool] = Field(None,
        description="True if mean color delta between first/last frame > 30 on 0–255 scale")
    method_used: Optional[LoopMethod] = None
    video_duration_s: Optional[float] = None
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

Do NOT use `model/multitask.py` CreativeScorer.

**Method mse (default, no model)**:
```python
# services/loopability.py
import cv2, numpy as np

def extract_window_mean_frame(cap: cv2.VideoCapture,
                               frame_indices: list) -> np.ndarray:
    """Average multiple frames to reduce compression noise."""
    frames = []
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frames.append(cv2.resize(frame, (128, 128)).astype(np.float32))
    if not frames:
        raise ValueError("Could not read frames")
    return np.mean(frames, axis=0)

def mse_similarity(video_path: str, window: int = 5) -> dict:
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration_s = total_frames / fps if fps > 0 else 0.0

    first_indices = list(range(0, min(window, total_frames)))
    last_indices  = list(range(max(0, total_frames - window), total_frames))

    first_frame = extract_window_mean_frame(cap, first_indices)
    last_frame  = extract_window_mean_frame(cap, last_indices)
    cap.release()

    mse = float(np.mean((first_frame - last_frame) ** 2))
    similarity = max(0.0, 1.0 - mse / 10000.0)

    # Color jump check (per-channel mean delta)
    color_delta = float(np.abs(first_frame.mean(axis=(0, 1)) - last_frame.mean(axis=(0, 1))).mean())
    return {
        "loop_similarity": round(similarity, 4),
        "color_jump": color_delta > 30.0,
        "video_duration_s": round(duration_s, 2),
        "method_used": "mse",
    }
```

**Method phash (fallback, `imagehash` library)**:
```python
import imagehash
from PIL import Image

def phash_similarity(first_frame_arr: np.ndarray, last_frame_arr: np.ndarray) -> float:
    h1 = imagehash.phash(Image.fromarray(first_frame_arr.astype(np.uint8)))
    h2 = imagehash.phash(Image.fromarray(last_frame_arr.astype(np.uint8)))
    return 1.0 - (h1 - h2) / 64.0
```

**Method clip (enhanced path, requires CLIP ONNX)**:
- Model: `clip_vit_b32_visual.onnx` (~170 MB) from `openai/CLIP` exported via `torch.onnx.export`
- Input: `[1, 3, 224, 224]` float32
- Output: `[1, 512]` embedding vector
- `similarity_clip = float(np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2)))`

Dependencies: `opencv-python>=4.9`, `numpy>=1.26`, `imagehash>=4.3` (for phash method), `onnxruntime>=1.17` (for clip method), `Pillow>=10.0`

### Next.js component

```
File: ui/src/components/application/ad-scoring/LoopabilityCard.tsx

Props interface:
  interface LoopabilityCardProps {
    adId: number;
    score: number | null;
    tier: "seamless" | "smooth" | "visible_seam" | "hard_cut" | null;
    loopSimilarity: number | null;   // 0.0–1.0
    colorJump: boolean | null;
    methodUsed: "mse" | "phash" | "clip" | null;
    videoDurationS: number | null;
    imageUrlFirstFrame: string;      // first frame thumbnail URL
    imageUrlLastFrame: string;       // last frame thumbnail URL
    nullWithReason?: string;
  }

Render:
  - Side-by-side frame thumbnails: "First Frame" | "Last Frame"
    with a visual similarity percentage overlay (e.g., "87% similar")
  - Horizontal gauge bar: "Loop Similarity: X%" with color zones
    (red < 70%, amber 70–80%, green 80–90%, bright-green ≥ 90%)
  - Tier badge: hard_cut=red, visible_seam=amber, smooth=light-green, seamless=green
  - If colorJump is true: amber chip "Brightness jump at loop point"
  - Small info tag: "Method: MSE / pHash / CLIP"
  - If nullWithReason === "not_applicable_long_form": gray chip
    "Loop metric N/A for videos > 30s"
  - If nullWithReason is set (other): gray "N/A" badge with tooltip
```

### Failure mode

```python
# null_with_reason values:
"video_required"                  # neither video_b64 nor video_url provided
"video_decode_error"              # OpenCV cannot open the file
"video_too_short"                 # total_frames < 10 (< ~0.3 s)
"not_applicable_long_form"        # video_duration_s > 30.0
"video_too_large"                 # decoded size > 50 MB
"frame_read_error"                # cap.read() failed for first or last window
"clip_model_missing"              # method=clip requested but ONNX not found
"url_fetch_error"                 # video_url returned non-200 or timed out
```

Return `score: null, tier: null, loop_similarity: null` for all above cases.
