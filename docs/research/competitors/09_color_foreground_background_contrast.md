# 09 — color.foreground_background_contrast

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| CreativeX | Clear Presence guideline (subject isolation) | https://support.creativex.com/hc/en-us/articles/34774680597275 | Creative intelligence |
| AdCreative.ai | Saliency AI + Component Analysis AI | https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it | AI ad generation + scoring |
| Smartly.io | Creative Predictive Potential (attention distribution) | https://www.smartly.io/product-features/creative-predictive-potential | Enterprise creative automation |
| Apple ML Research | Fast Class-Agnostic Salient Object Segmentation | https://machinelearning.apple.com/research/salient-object-segmentation | Platform / research |
| Cloudflare Images | Background removal segmentation benchmark | https://blog.cloudflare.com/background-removal/ | Infrastructure / tooling |
| Marpipe | Background color/image testing (multivariate) | https://www.marpipe.com/ | E-commerce ad testing |
| Celtra | AI-driven visual composition guidance | https://celtra.com/blog/celtra-your-trusted-ads-design-tool/ | Creative management platform |
| Flashtalking by Mediaocean | Creative intelligence (visual quality signals) | https://www.flashtalking.com/ | Ad serving + DCO |

## How they implement it

### Algorithm / model family

**Subject/foreground detection:**

The standard approach uses a salient object detection (SOD) model to produce a binary foreground mask. Three model families are in common use:

1. **U2-Net** (arxiv 2005.09007): Two-level nested U-shape architecture producing soft saliency maps. Best known for background removal in consumer tools (remove.bg, etc.). Returns a float mask [0,1] per pixel. Can be converted to ONNX. Input: 320×320 RGB; output: same-size probability map. Pretrained weights publicly available at https://github.com/xuebinqin/U-2-Net.

2. **BiRefNet** (recent, 2024): Bilateral reference network for high-resolution background removal. Higher quality than U2-Net but heavier. Used in Cloudflare's internal benchmark — outperforms IS-Net and U2-Net on DUTS-TE benchmark.

3. **GrabCut** (OpenCV): Classical iterative graph-cut algorithm using a rough foreground rect as seed. No ML inference; fast but requires a bounding box hint. Sufficient for ad images with clear product/person on clean background.

**CreativeX Clear Presence**: Uses AI to detect the main subject, then applies a grid-based scoring system. Each 2.5%-of-frame grid square is marked "occupied" if the subject fills ≥ 50% of it. Human review fallback when model confidence < threshold. Publicly documented: https://support.creativex.com/hc/en-us/articles/34774680597275.

**AdCreative.ai Saliency AI**: Predicts visual attention heatmap. The saliency map is correlated with the CTA and product placement. High saliency in the background (meaning the background competes with the foreground) is penalized. No public algorithm disclosure; described as a "large dataset of user behavior" model.

**Edge contrast measurement (our approach):**

After obtaining a binary foreground mask `M` (threshold U2-Net output at 0.5):
1. Compute the edge mask: `edge = cv2.Canny(M * 255, threshold1=100, threshold2=200)`.
2. Dilate edge by 3px to create a boundary region `B`.
3. Split `B` into `B_fg` (pixels where M > 0.5) and `B_bg` (pixels where M ≤ 0.5).
4. Sample image pixel colors in `B_fg` and `B_bg`.
5. Compute mean color for each side, then compute WCAG luminance contrast between the two mean colors.
6. Alternatively: compute mean absolute difference in Lab L* channel across the boundary (perceptual lightness separation) — range 0–100, where > 30 is clearly visible, < 15 is hard to distinguish.

### Metric shape

- **CreativeX**: Binary Pass/Fail per Clear Presence guideline, contributes to CQS percentage.
- **AdCreative.ai**: No separate edge-contrast score exposed; folds into holistic 0–100 Performance Score.
- **Our target**: Continuous float 0.0–1.0.

  Two sub-signals combined:
  - `edge_contrast_lab` (0–100): mean ΔL* between foreground and background pixels at the subject boundary. Normalize to 0–1 via `edge_contrast_lab / 100`.
  - `edge_contrast_ratio` (WCAG ratio 1–21): Compute WCAG ratio between mean foreground-boundary RGB and mean background-boundary RGB. Normalize to 0–1 via `min(ratio / 7.0, 1.0)`.

  Combined: `score = 0.5 * (edge_contrast_lab / 100) + 0.5 * min(wcag_ratio / 7.0, 1.0)`.

  Buckets:
  - `noisy` (score < 0.30): subject poorly separated; background competes visually
  - `moderate` (0.30 ≤ score < 0.60): subject visible but edges blend in places
  - `clear` (score ≥ 0.60): subject clearly pops from background

  Also expose `foreground_coverage` (fraction of image pixels in foreground mask) as a separate field — useful for the `visual.negative_space` criterion (10).

### UI pattern

- **CreativeX**: Grid overlay on the subject frame with occupied/unoccupied squares marked. Pass/Fail badge. Human review thumbnail when AI flags uncertainty.
- **AdCreative.ai**: Saliency heatmap overlay; areas of low saliency gradient at subject edge indicate poor separation.
- **Our target**: Three-layer visualization on the image thumbnail:
  1. Foreground mask rendered as a 40% opacity colored overlay (blue tint) to show the detected subject area.
  2. Edge/boundary pixels highlighted in yellow to show where the contrast measurement was taken.
  3. Two small color chips showing "mean foreground boundary color" vs. "mean background boundary color" with the ratio value between them.
  - Numeric gauge (0–100) + tier badge (`noisy` / `moderate` / `clear`).

### Public screenshots / demos

- CreativeX Clear Presence help article: https://support.creativex.com/hc/en-us/articles/34774680597275-What-is-the-Clear-Presence-and-how-is-it-scored
- U2-Net GitHub (foreground segmentation): https://github.com/xuebinqin/U-2-Net
- Cloudflare background removal benchmark: https://blog.cloudflare.com/background-removal/
- Apple salient object segmentation research: https://machinelearning.apple.com/research/salient-object-segmentation

## Help articles & source material

- https://support.creativex.com/hc/en-us/articles/34774680597275-What-is-the-Clear-Presence-and-how-is-it-scored
- https://arxiv.org/abs/2005.09007 (U2-Net paper)
- https://github.com/xuebinqin/U-2-Net (U2-Net code + ONNX)
- https://blog.cloudflare.com/background-removal/ (U2-Net vs BiRefNet vs IS-Net comparison)
- https://machinelearning.apple.com/research/salient-object-segmentation (Apple FOCUS model)
- https://www.sciencedirect.com/science/article/abs/pii/S1077314223002953 (Joint foreground/background/edge SOD paper)
- https://medium.com/@vinodpolinati/u2-net-revolutionizing-salient-object-detection-5cb10717a209 (U2-Net explainer)
- https://arxiv.org/html/2501.05238v1 (FOCUS universal foreground segmentation 2025)
- https://www.creativex.com/blog/what-is-creative-quality

## Pros / cons / flaws

### What competitors do well

- CreativeX's grid-based subject coverage check (Clear Presence) is reproducible and auditable — a human reviewer can verify AI decisions using the same grid, making it defensible in brand governance workflows.
- U2-Net ONNX export means the segmentation model can run inside our existing ONNX serving infrastructure without any new framework dependency.
- AdCreative.ai's saliency approach captures perceptual attention, which is more aligned with user behavior than a pure contrast-ratio computation.

### Where they fall short

- CreativeX's Clear Presence measures how large the subject is, not how well it visually separates from the background. A product photographed on a matching-color background could have 40% frame coverage and still be invisible.
- No competitor computes edge contrast at the foreground-background boundary specifically. They either measure subject size (CreativeX) or global saliency (AdCreative.ai) — neither directly answers "does the subject pop?"
- U2-Net is trained primarily on natural images (humans, animals, objects). Performance on abstract ad compositions (text-heavy, flat graphic design, collage layouts) is lower.
- Saliency heatmaps are trained on web browsing / natural scene datasets. Ad-specific viewing patterns (mobile scroll, 0.3s exposure) differ significantly.

### Edge cases they miss

- Product on white background (extremely common in e-commerce ads): boundary between product and background is near-zero contrast on the boundary, but the product IS the foreground. U2-Net handles this well (high confidence mask) but the edge contrast metric would report near-zero — should override with a special `white_background_detected` flag and a score bonus.
- Lifestyle photography where the human model blends with an earth-tone background: U2-Net may produce a diffuse low-confidence mask at clothing edges. The score would be `noisy` even though the creative is intentionally cinematic.
- Transparent product packaging (perfume bottles, glass items): segmentation models often produce fragmented or low-confidence masks for transparent objects.
- Split-screen layouts (50% product, 50% text on solid background): two distinct foreground regions; the mask and edge contrast computation should handle this but will average across both regions.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/fg-bg-contrast
from pydantic import BaseModel, Field
from typing import Optional

class FgBgContrastRequest(BaseModel):
    ad_id: int
    image_b64: str           # base64-encoded JPEG/PNG, max 4 MB (higher res needed for edge quality)
    model: str = "u2net"     # "u2net" | "grabcut" (grabcut requires fg_hint_bbox)
    fg_hint_bbox: Optional[list[int]] = None  # [x1,y1,x2,y2] for GrabCut seed rect

class FgBgContrastResponse(BaseModel):
    ad_id: int
    slug: str = "color.foreground_background_contrast"   # always this value
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[str] = Field(None, description="noisy | moderate | clear")
    edge_contrast_lab: Optional[float] = Field(None, description="Mean ΔL* at subject boundary, 0–100")
    edge_contrast_ratio: Optional[float] = Field(None, description="WCAG ratio at boundary, 1.0–21.0")
    foreground_coverage: Optional[float] = Field(None, description="Fraction of image in foreground mask, 0–1")
    white_background_detected: Optional[bool] = None
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

Use the **U2-Net ONNX export** as the primary segmentation model. Do not use `model/multitask.py` for this criterion.

Setup:
1. Download pretrained U2-Net ONNX model from https://github.com/xuebinqin/U-2-Net (u2net.onnx, ~176 MB).
2. Place at `models/u2net.onnx`. Reference via `MODEL_DIR` env var as in existing `serving/api.py`.
3. Load via `onnxruntime.InferenceSession("models/u2net.onnx", providers=["CPUExecutionProvider"])`.
4. Input: float32 NCHW tensor, shape (1, 3, 320, 320), normalized with ImageNet mean/std: `mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`.
5. Output: first output tensor is the saliency map, shape (1, 1, 320, 320), float32 [0,1].

Edge contrast computation (in `services/fg_bg_contrast.py`):
```python
import cv2, numpy as np
from skimage.color import rgb2lab

def edge_contrast_from_mask(img_rgb: np.ndarray, mask: np.ndarray) -> dict:
    # img_rgb: H x W x 3 uint8, mask: H x W float [0,1]
    mask_bin = (mask > 0.5).astype(np.uint8) * 255
    # Detect boundary
    edges = cv2.Canny(mask_bin, 100, 200)
    kernel = np.ones((7, 7), np.uint8)
    boundary = cv2.dilate(edges, kernel, iterations=1) > 0
    fg_pixels = img_rgb[boundary & (mask > 0.5)]
    bg_pixels = img_rgb[boundary & (mask <= 0.5)]
    if len(fg_pixels) < 10 or len(bg_pixels) < 10:
        return {"edge_contrast_lab": None, "edge_contrast_ratio": None}
    # Lab L* delta
    fg_lab = rgb2lab(fg_pixels.reshape(1,-1,3).astype(np.float32)/255)[0,:,0]
    bg_lab = rgb2lab(bg_pixels.reshape(1,-1,3).astype(np.float32)/255)[0,:,0]
    delta_l = abs(float(np.mean(fg_lab)) - float(np.mean(bg_lab)))
    # WCAG ratio (using mean colors)
    fg_mean = fg_pixels.mean(axis=0)
    bg_mean = bg_pixels.mean(axis=0)
    ratio = wcag_contrast(fg_mean, bg_mean)  # reuse from services/color_contrast.py
    return {"edge_contrast_lab": round(delta_l, 2), "edge_contrast_ratio": round(ratio, 3)}
```

White background detection: check if the mean L* of `bg_pixels` > 92 (near-white in Lab).

GrabCut fallback: use `cv2.grabCut(img, mask_gc, fg_hint_bbox, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)` when `model="grabcut"` and `fg_hint_bbox` is provided.

Dependencies: `onnxruntime>=1.17`, `opencv-python>=4.9`, `scikit-image>=0.22`, `numpy>=1.26`, `Pillow>=10.0`.

### Next.js component

```
File: ui/src/components/application/ad-scoring/FgBgContrastCard.tsx

Props interface:
  interface FgBgContrastCardProps {
    adId: number;
    score: number | null;
    tier: "noisy" | "moderate" | "clear" | null;
    edgeContrastLab: number | null;     // 0–100
    edgeContrastRatio: number | null;   // 1.0–21.0
    foregroundCoverage: number | null;  // 0–1
    whiteBackgroundDetected: boolean | null;
    imageUrl: string;
    nullWithReason?: string;
  }

Render:
  - Image preview with three optional overlay layers (toggle buttons to show/hide each):
      1. "Foreground mask" — blue semi-transparent overlay on detected subject area
      2. "Boundary" — yellow pixel highlights at the foreground edge
      3. "Score region" — shows which pixels were sampled for contrast measurement
  - Two metric readouts below the image:
      "Boundary ΔL*: 32.4 / 100"  (progress bar, green if > 30, amber 15–30, red < 15)
      "Boundary WCAG: 4.8:1"       (progress bar, same color thresholds as criterion 08)
  - Combined score gauge (0–100) + tier badge: noisy=red, moderate=amber, clear=green
  - If whiteBackgroundDetected: show an info banner "White background detected — score adjusted"
  - If nullWithReason is set, show gray "N/A" state with tooltip
```

### Failure mode

Return `score: null, null_with_reason: "segmentation_failed"` when the U2-Net ONNX model is unavailable or inference throws an exception, AND GrabCut is not usable (no `fg_hint_bbox` provided).

Additional `null_with_reason` values:
- `"image_decode_error"` — base64 or PIL decode fails
- `"image_too_small"` — image smaller than 32×32 px
- `"boundary_too_thin"` — fewer than 10 foreground boundary pixels or 10 background boundary pixels after dilation (image may be entirely one color)
- `"model_file_missing"` — `models/u2net.onnx` not found at startup (log warning; gracefully degrade to GrabCut if `fg_hint_bbox` in request)
