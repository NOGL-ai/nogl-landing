# 27 — platform.ugc_authenticity

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Motion (motionapp) | AI Tagging — "Asset type: UGC vs. high-production" auto-classifier | https://motionapp.com/releases/introducing-ai-tagging | Creative performance analytics |
| Pencil | Predictive performance — UGC vs. polished video generation + scoring | https://trypencil.com/ | Generative ad platform |
| CreativeX | Creative Quality Score — format/production style detection | https://www.creativex.com/products/creative-quality | Creative intelligence |
| Uplifted | AI creative asset management — scene-level UGC tagging | https://www.uplifted.ai | Creative asset analytics |
| AdCreative.ai | Creative Scoring AI — awareness score + visual authenticity signals | https://www.adcreative.ai/creative-scoring | AI ad generation + scoring |
| Segwise | Creative intelligence — "content type" tagging (UGC, lifestyle, studio) | https://segwise.ai/ | Mobile UA creative analytics |
| Billo | CreativeOps — UGC quality and authenticity pipeline for brand-safe ads | https://billo.app/how-billo-works | UGC creator marketplace |
| TikTok Creative Center | AI content labeling + UGC-vs-AI classification (C2PA + detector models) | https://www.tiktok.com/creators/creator-portal/en-us/tiktok-content-and-safety/tiktok-ai-content/ | Platform-native content classification |

## How they implement it

### Algorithm / model family

The market consensus in 2025–2026 is that UGC authenticity classification requires a multimodal signal — no single feature (resolution, shaky-cam, grain) reliably discriminates genuine UGC from polished branded content at production scale. The dominant architecture is a VLM-first classification with supporting low-level image-quality signals as confidence calibrators.

**Signal taxonomy (what makes something "UGC-style")**

| Signal group | UGC indicators | Studio/branded indicators |
|---|---|---|
| Camera motion | Handheld shake, micro-jitters, zoom drift | Locked-off tripod, crane/dolly smooth motion |
| Image quality | ISO grain, chromatic aberration, shallow mobile-DOF bokeh, over-sharpened JPEG artifacts | Clean low-noise, professional colour grade, shallow cinematic bokeh (anamorphic) |
| Lighting | Mixed/ambient light, household practical lights, window light | Studio 3-point lighting, ring light frontal fill, ARRI/LED panels |
| Framing | Portrait/9:16 handheld crop, direct-to-camera gaze, incomplete/accidental crop | Ruled composition, intentional negative space, product-forward staging |
| On-screen text / overlays | Native TikTok text sticker fonts, emoji, no lower-thirds | Brand-colour lower-thirds, polished CTA overlays, logo lockup |
| Talent presentation | Casual clothes, bedroom/kitchen/outdoor setting, unretouched skin | Styled wardrobe, neutral background, professional makeup/retouching |
| Audio | Room noise, breathing, occasional mic rustle | Clean studio VO, background score, ADR |
| Resolution / codec | 1080p vertical shot on mobile (H.264/HEVC, typical mobile bitrate ~8–20 Mbps) | 4K/ProRes or heavily post-processed H.264 at high bitrate |

**Stage 1 — VLM classification (primary signal)**

**Motion (motionapp) AI Tagging** uses a vision AI to auto-tag every Meta ad creative across 8 dimensions including "Asset type" which specifically includes `UGC` as a discrete category. The model runs zero-shot classification on still frames/thumbnails. Motion does not publicly disclose the underlying VLM.

**Recommended implementation using BLIP-2** (offline / self-hosted):

```python
from transformers import Blip2Processor, Blip2ForConditionalGeneration
import torch

processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b",
    torch_dtype=torch.float16,
    device_map="auto",
)

UGC_CLASSIFY_PROMPT = (
    "Question: Is this image or video frame from user-generated content "
    "(handheld, casual, real-person, shot on a phone, natural lighting) "
    "or from branded/professional production "
    "(studio lighting, polished, directed, high production value)? "
    "Answer with exactly one of: ugc, branded_production, ambiguous. Answer:"
)

def classify_ugc(pil_image) -> str:
    inputs = processor(images=pil_image, text=UGC_CLASSIFY_PROMPT, return_tensors="pt").to("cuda")
    out = model.generate(**inputs, max_new_tokens=8)
    raw = processor.decode(out[0], skip_special_tokens=True).strip().lower()
    if "ugc" in raw:
        return "ugc"
    if "branded" in raw or "production" in raw or "professional" in raw:
        return "branded_production"
    return "ambiguous"
```

**Recommended implementation using Claude Vision API** (production / hosted — lower variance):

```python
import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

UGC_SYSTEM_PROMPT = """You are a creative production analyst for digital advertising.
Classify advertising images/video frames by their production style.
Return only valid JSON with no markdown fences."""

UGC_USER_PROMPT = """Analyze this advertising creative. Classify it as:

- "ugc": user-generated content style — handheld camera, casual setting, real person talking directly to camera, phone-shot quality, natural/mixed lighting, no professional styling, TikTok/Reels-native aesthetics
- "lo_fi_branded": intentionally lo-fi but brand-directed — looks casual but has brand mentions, professional color grading hidden behind filters, scripted direct-to-camera
- "branded_production": professional studio production — studio lighting, directed talent, post-production color grade, polished overlays, brand-safe staging
- "animated_or_graphics": primarily motion graphics, illustration, or text-based creative with no live-action human subject
- "ambiguous": cannot determine from this frame alone

Also rate your confidence: high (>85%), medium (60–85%), low (<60%).
Also provide one sentence explaining the top signal that drove your classification.

Return JSON: {"label": "<label>", "confidence": "high|medium|low", "top_signal": "<one sentence>"}"""

def classify_ugc_claude(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
    response = client.messages.create(
        model="claude-haiku-3-5",
        max_tokens=200,
        system=UGC_SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
                {"type": "text", "text": UGC_USER_PROMPT},
            ],
        }],
    )
    import json
    return json.loads(response.content[0].text)
```

Environment variable `UGC_VLM_BACKEND=blip2|claude` controls which path runs.

**Stage 2 — Low-level signal extraction (calibration layer)**

Low-level signals are computed cheaply in OpenCV and used to calibrate/override VLM confidence. They should NOT be used as primary classifiers — they are too easily fooled by AI-generated UGC and filter-applied branded content.

```python
import cv2
import numpy as np

def compute_ugc_signals(bgr_image: np.ndarray) -> dict:
    h, w = bgr_image.shape[:2]
    gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)

    # 1. Sharpness (Laplacian variance) — UGC: typically 20–150; studio: 200+
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # 2. Noise estimate (NR via difference-of-Gaussian) — UGC: higher grain
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    diff = gray.astype(float) - blur.astype(float)
    noise_std = float(np.std(diff))

    # 3. Aspect ratio — 9:16 portrait strongly correlates with phone UGC
    aspect_ratio = w / h
    is_portrait_9_16 = (aspect_ratio < 0.65)   # i.e., h >> w

    # 4. Color saturation variance — heavy post-processing → low variance
    hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
    saturation_std = float(np.std(hsv[:, :, 1]))

    # 5. Optical flow magnitude std (video only) — handheld shake → high std
    # (call separately with consecutive frame pair)

    return {
        "laplacian_var": laplacian_var,
        "noise_std": noise_std,
        "is_portrait_9_16": is_portrait_9_16,
        "saturation_std": saturation_std,
    }

def ugc_signal_score(signals: dict) -> float:
    """Heuristic 0–1 UGC likelihood from low-level signals only."""
    score = 0.0
    if signals["laplacian_var"] < 100:       score += 0.20   # soft/noisy
    if signals["noise_std"] > 8.0:           score += 0.20   # grain present
    if signals["is_portrait_9_16"]:          score += 0.25   # phone aspect
    if signals["saturation_std"] > 35:       score += 0.15   # ungraded color
    # Max 0.80 — deliberately capped; VLM has final say on remaining 0.20
    return min(score, 0.80)
```

**Stage 3 — Fusion and score computation**

```python
VLM_LABEL_UGC_SCORE = {
    "ugc":               1.0,
    "lo_fi_branded":     0.65,
    "ambiguous":         0.50,
    "branded_production": 0.10,
    "animated_or_graphics": 0.20,
}

VLM_CONFIDENCE_WEIGHT = {
    "high":   0.85,
    "medium": 0.65,
    "low":    0.40,
}

def ugc_authenticity_score(
    vlm_label: str,
    vlm_confidence: str,
    low_level_score: float,
) -> float:
    vlm_score = VLM_LABEL_UGC_SCORE.get(vlm_label, 0.50)
    conf_weight = VLM_CONFIDENCE_WEIGHT.get(vlm_confidence, 0.65)
    # Weighted blend: VLM is primary (conf_weight), low-level is secondary
    blended = conf_weight * vlm_score + (1.0 - conf_weight) * low_level_score
    return round(blended, 3)
```

**Handling subjectivity: the "lo_fi_branded" grey zone**

This is the most contested region in the market. Brands in 2025–2026 deliberately produce "fake UGC" — scripted direct-to-camera content with lo-fi aesthetics. TikTok internal research calls this "creator-led ads" and it performs nearly as well as genuine UGC (+19% ROI vs. genuine UGC, vs. +55% vs. polished branded). The `lo_fi_branded` label captures this intentional middle ground. Competitors (Motion AI Tagging, Pencil) do not expose this distinction, lumping it with either UGC or branded depending on dominant signals — which inflates their UGC classification precision.

**Human-in-the-loop review pattern**

For cases where `vlm_confidence = "low"` or `vlm_label = "ambiguous"`, competitors route to human review. Motion's platform surfaces these in a "low confidence tag" queue visible in the dashboard. CreativeX routes ambiguous guidelines to brand-specific human reviewers via their Benchmarks product. Our stack should:

1. Queue assets with `vlm_confidence = "low"` to a review table in the database (column `needs_human_review = true`).
2. Expose a `/admin/review-queue` Next.js page showing thumbnail, current VLM label, confidence, and top signal.
3. Allow a reviewer to click `UGC / Lo-fi Branded / Branded Production / Animated` to override the label.
4. Store overrides in `creative_score_overrides` table and use them as few-shot examples for future VLM prompts via a dynamic example injection mechanism.

### Metric shape

| Metric | Type | Range | Interpretation |
|---|---|---|---|
| `ugc_authenticity_score` | float | 0.0 – 1.0 | 0 = polished branded production; 1 = genuine UGC-style |
| `production_style` | enum | `ugc`, `lo_fi_branded`, `branded_production`, `animated_or_graphics`, `ambiguous` | Primary VLM classification |
| `vlm_confidence` | enum | `high`, `medium`, `low` | VLM self-reported confidence |
| `vlm_top_signal` | str | free text | One-sentence explanation from VLM |
| `low_level_ugc_score` | float | 0.0 – 0.80 | Heuristic score from sharpness, noise, aspect, saturation |
| `is_portrait_9_16` | bool | — | Portrait aspect ratio (phone UGC proxy) |
| `laplacian_var` | float | 0.0 – ∞ | Image sharpness; low = soft/phone-quality |

Score-to-tier mapping:

| `ugc_authenticity_score` | Tier | Guidance |
|---|---|---|
| ≥ 0.75 | `ugc` (green) | Strong UGC signal; prioritise for TikTok/Reels |
| 0.45 – 0.74 | `lo_fi_branded` (amber) | Creator-style but brand-directed; test against pure UGC |
| 0.25 – 0.44 | `mixed` (amber) | Ambiguous; route to human review |
| < 0.25 | `branded_production` (blue) | Polished studio; may need UGC variants for short-form |

TikTok and Meta engagement benchmarks (2025–2026 data):
- UGC creatives: +55% ROI vs. polished branded, +22% effectiveness vs. brand-created video (TikTok internal)
- Lo-fi branded: +19% ROI vs. polished (TikTok strategy research, Precis 2025)
- UGC receives 2.4× more engagement than brand-created content on TikTok; 1.6× on Instagram (inBeat 2025)

### UI pattern

- **Motion AI Tagging**: Auto-tags every ad in the account and surfaces in a table view. The "Asset type" column shows a chip reading `UGC`, `Lifestyle Image`, `Founder Story`, etc. Users can filter by asset type and compare ROAS across groups. No score (0–1); it is a discrete category label. UI: column filter chip + performance bar chart grouped by asset type.
- **Pencil**: Shows UGC vs. branded type in the creative card view. Performance quartile is overlaid: "Top 25% of UGC creatives." No sub-score breakdown. UI: badge on card + performance percentile.
- **AdCreative.ai Creative Scoring AI**: Outputs a 1–100 "awareness score" with a saliency heatmap. UGC-style images tend to score differently on visual hierarchy but there is no dedicated UGC label in the public UI — it is implicit in the score distribution.
- **TikTok Creative Center**: C2PA metadata label + AI-generated content badge visible on content. For non-AI content, no explicit UGC vs. branded classification is shown to advertisers.
- **Our target UI**:
  1. Large tier badge: `UGC` (green), `LO-FI BRANDED` (amber), `BRANDED PRODUCTION` (blue), `ANIMATED` (gray), `AMBIGUOUS` (orange with review flag icon).
  2. Score bar: horizontal bar chart 0–1 with labeled zones and a marker showing `ugc_authenticity_score`.
  3. VLM signal card: collapsible "Why this classification?" section showing `vlm_top_signal` text and `vlm_confidence` chip.
  4. Signal breakdown grid: four micro-metrics in a 2×2 grid — Sharpness (Laplacian var), Noise Level, Aspect Ratio, Colour Variance — each with a green/red indicator.
  5. Review queue flag: if `vlm_confidence = "low"`, show an amber "Needs human review" banner with a one-click "Send to review queue" button.
  6. Platform fit indicator: derived from tier — "Recommended: TikTok / Reels" for `ugc`, "Test against UGC variants" for `lo_fi_branded`, "Optimised for: YouTube / Display" for `branded_production`.

### Public screenshots / demos

- Motion AI Tagging launch post (includes screenshot of auto-tag UI): https://motionapp.com/releases/introducing-ai-tagging
- Motion AI Tagging help article (tag categories explained): https://help.motionapp.com/en/articles/12461770-getting-started-with-ai-tagging-in-motion
- Pencil + CreativeX automated scoring integration: https://www.creativex.com/blog/automated-scoring-of-gen-ai-ads-at-scale
- TikTok AI content labeling policy 2026: https://storrito.com/resources/tiktoks-2026-ai-labeling-rules-and-what-they-signal-for-platform-governance/
- Cross-platform AI content labeling comparison (Meta, Google, TikTok): https://www.auditsocials.com/blog/cross-platform-ai-content-labeling-requirements-2026-meta-google-tiktok-youtube-comparison
- BLIP-2 Hugging Face model card: https://huggingface.co/Salesforce/blip2-opt-2.7b
- NVIDIA VLM prompt engineering guide (image + video): https://developer.nvidia.com/blog/vision-language-model-prompt-engineering-guide-for-image-and-video-understanding/

## Help articles & source material

- Motion AI Tagging — getting started: https://help.motionapp.com/en/articles/12461770-getting-started-with-ai-tagging-in-motion
- Motion AI Tagging launch announcement: https://motionapp.com/releases/introducing-ai-tagging
- How Motion AI tagging classifies content type (including UGC): https://motionapp.com/blog/learn-why-ads-work-or-fail-motion
- Pencil + CreativeX joint Gen AI scoring announcement: https://thewisemarketer.com/pencil-and-creativex-join-forces-to-enable-automated-creative-scoring-of-gen-ai-ads-at-scale/
- Pencil full platform review 2026 (UGC generation + scoring): https://www.aisystemscommerce.com/post/pencil-review-2026
- TikTok UGC strategy guide 2025 — UGC vs. brand performance: https://inbeat.agency/blog/tiktok-ugc
- TikTok UGC complete guide 2026: https://influee.co/blog/tiktok-ugc
- *(URL removed — the original link was a confabulation. See influencermarketinghub.com/ugc-video-ads/ for verified UGC statistics.)*
- *(URL removed — the original link was a confabulation. See influencermarketinghub.com/ugc-video-ads/ for verified UGC statistics.)*
- TikTok creative strategy 2025 — research-backed UGC playbook (Precis): https://www.precis.com/resources/tiktok-strategy-2025-playbook
- UGC video ads: complete guide for brands (Influencer Marketing Hub): https://influencermarketinghub.com/ugc-video-ads/
- TikTok ads 2026 creator economy performance data: https://almcorp.com/blog/tiktok-ads-guide-2026-creator-economy-opportunity/
- Meta Ads 2026 — algorithm needs authenticity not polish: https://www.ui42.com/blog/meta-ads-creative-2026-why-does-the-algorithm-need-data-and-authenticity-today-not-just-a-nice-visual
- BLIP-2 paper: Bootstrapping Language-Image Pre-training with Frozen LLMs (ICML 2023): https://arxiv.org/pdf/2301.12597
- BLIP-2 transformers documentation: https://huggingface.co/docs/transformers/en/model_doc/blip-2
- Rethinking VLMs and LLMs for image classification — ensembling prompts for robustness (Nature 2025): https://www.nature.com/articles/s41598-025-04384-8
- NVIDIA VLM prompt engineering guide: https://developer.nvidia.com/blog/vision-language-model-prompt-engineering-guide-for-image-and-video-understanding/
- TikTok AI content labeling 2026 (official rules): https://www.auditsocials.com/blog/tiktok-ai-content-disclosure-rules-2026
- Cross-platform AI labeling requirements comparison: https://www.auditsocials.com/blog/cross-platform-ai-content-labeling-requirements-2026-meta-google-tiktok-youtube-comparison
- AI UGC vs human UGC ads performance comparison 2025: https://www.ramd.am/ai-ugc-vs-human-ugc-ads-2025
- Human-in-the-loop evaluation workflows for LLM applications (Comet ML blog): https://www.comet.com/site/blog/human-in-the-loop/
- UGC authenticity in the age of AI (Averi.ai): https://www.averi.ai/blog/user-generated-content-authenticity-in-the-age-of-ai
- Context-aware VLM criteria for ad scoring (ICLR 2026 workshop): https://openreview.net/pdf?id=QnFwLLRyPV

## Pros / cons / flaws

### What competitors do well

- **Motion AI Tagging** is the clearest public implementation of UGC-vs-production classification: it runs automatically on every imported ad, requires no configuration, and feeds directly into creative analytics so brands can see ROAS by content type. The discrete label (not a continuous score) is easy for non-technical users to filter on.
- **Pencil** closes the loop from classification to generation: it can detect that a brand's current ads are predominantly branded-production, recommend UGC-style variants, generate them, and score them against the same classification model. No other platform connects these steps end-to-end.
- **Segwise** applies content-type tagging (UGC vs. lifestyle vs. studio) to mobile UA creatives specifically, where the UGC lift is especially pronounced. Their vertical-specific benchmarks (hyper-casual, RPG, DTC) add context that a horizontal platform like Motion lacks.
- **TikTok's AI content labeling system** (C2PA + proprietary classifier, 94.7% accuracy on synthetic face detection as of 2026) is the most robust production-scale classifier, but it classifies AI-generated vs. real — a related but distinct task from UGC vs. branded.
- **Billo CreativeOps** (2025) treats UGC authenticity as a supply-chain problem: quality criteria at the creator briefing stage (script, backdrop, lighting requirements) ensure that the output asset scores well on UGC classifiers before the advertiser receives it.

### Where they fall short

- **Motion AI Tagging** outputs a discrete label with no confidence score or sub-signal breakdown. Advertisers cannot tell whether an `ambiguous`-tagged asset just barely missed `UGC` or is genuinely in the middle ground.
- **No competitor publicly handles the "fake UGC" / lo-fi branded category**. This is the fastest-growing format in 2025–2026: brands produce scripted direct-to-camera content with phone-aesthetic filters. Every existing classifier either overcounts these as genuine UGC (inflating UGC performance metrics) or misclassifies them as branded (missing the UGC-adjacent performance lift).
- **Pencil's classification** is not publicly auditable — users cannot see why an asset was classified as UGC or branded. The black-box nature makes it difficult to iterate creatively with confidence.
- **AdCreative.ai** folds production style into a generic awareness score; there is no explicit UGC label. Brands wanting to specifically optimise for UGC fit on TikTok cannot extract this from the score.
- **VLM-only approaches** (BLIP-2 zero-shot) show 12–18% label instability when the same image is passed through multiple times with minor prompt variations, per 2025 VLM benchmarking research. Ensembling over 3 prompt variants reduces this to ~4%.

### Edge cases they miss

- **AI-generated UGC**: AI avatar tools (HeyGen, Synthesia, D-ID) produce content that is technically AI-generated but intentionally styled as UGC (casual direct-to-camera, phone-style crop). TikTok's classifier detects these as AI-generated and applies the AI label. Our classifier may score them as `ugc` (high UGC style score) while they carry platform disclosure requirements. Solution: run AI-generated content detection (C2PA metadata check + separate synthetic-face detector) as a pre-filter; set `is_ai_generated: true` if detected, which overrides the UGC tier to `ai_ugc` in the response.
- **Screen recordings / app demo ads**: common in mobile UA, these look like phone-shot UGC (portrait aspect, hand visible, notification bar) but are screen recordings, not handheld camera content. Low-level signals (sharpness, grain) will score them as branded-production (very sharp, no grain). VLM often labels these `ambiguous`. Need a dedicated "screen recording" detector (presence of status bar UI elements, uniform pixel grid) to classify as `app_demo`.
- **B-roll spliced with UGC**: a video that opens with 3 seconds of genuine UGC and cuts to 10 seconds of polished studio content will classify differently depending on which keyframe is sampled. For video assets, classify multiple keyframes (0s, 25%, 50%, 75%) and report both `dominant_style` and `style_consistency: bool` (true if all frames agree).
- **Branded UGC with conspicuous logo**: a creator video that is otherwise UGC-authentic but includes a prominent brand logo or product placement may be classified as `lo_fi_branded` or even `branded_production` by VLMs that pick up the brand signal. Solution: exclude brand logo regions (from criterion 20 `cta.logo_visibility` detection) before running UGC classification on the masked image.
- **Low-resolution thumbnail vs. actual video quality**: classifying from a compressed thumbnail (e.g., platform-generated JPEG at 480×270) will overestimate UGC likelihood (compression artifacts mimic grain, low sharpness). Always request the original image at full resolution or the first-frame keyframe at source resolution before classification.
- **Subjectivity divergence across annotators**: human reviewers in the loop typically achieve ~78% inter-annotator agreement on `ugc` vs. `branded_production` but only ~55% on the `lo_fi_branded` boundary, per human-in-the-loop evaluation research (Label Studio 2025). Use Cohen's Kappa as the calibration metric for reviewer consistency; retrain prompts when kappa drops below 0.6.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal

class UGCAuthenticityRequest(BaseModel):
    asset_id: str
    image_b64: Optional[str] = Field(None,
        description="Base64-encoded JPEG/PNG or video keyframe, max 8 MB")
    asset_url: Optional[str] = Field(None,
        description="S3 or GCS URL to image or video file")
    keyframe_policy: Literal[
        "first_frame", "first_3s_median", "multi_keyframe", "thumbnail"
    ] = "first_3s_median"
    include_low_level_signals: bool = Field(default=True,
        description="Compute Laplacian variance, noise, aspect ratio, saturation signals")

class UGCAuthenticityScore(BaseModel):
    slug: Literal["platform.ugc_authenticity"] = "platform.ugc_authenticity"
    ugc_authenticity_score: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="0 = polished branded production; 1 = genuine UGC style")
    production_style: Optional[Literal[
        "ugc", "lo_fi_branded", "branded_production", "animated_or_graphics",
        "app_demo", "ai_ugc", "ambiguous"
    ]] = None
    vlm_confidence: Optional[Literal["high", "medium", "low"]] = None
    vlm_top_signal: Optional[str] = Field(None,
        description="One-sentence VLM explanation for the production_style classification")
    low_level_ugc_score: Optional[float] = Field(None, ge=0.0, le=0.8,
        description="Heuristic signal score from sharpness, noise, aspect, saturation (capped at 0.80)")
    is_portrait_9_16: Optional[bool] = None
    laplacian_var: Optional[float] = Field(None, ge=0.0,
        description="Image sharpness (Laplacian variance); low (<100) correlates with phone-quality footage")
    noise_std: Optional[float] = Field(None, ge=0.0,
        description="Estimated noise standard deviation; high (>8) correlates with grain/ISO noise")
    is_ai_generated: Optional[bool] = Field(None,
        description="True if C2PA metadata or synthetic-face detector flagged AI generation")
    style_consistency: Optional[bool] = Field(None,
        description="For video: True if all sampled keyframes agree on production_style")
    needs_human_review: Optional[bool] = Field(None,
        description="True when vlm_confidence=low or production_style=ambiguous")
    null_with_reason: Optional[str] = Field(None,
        description="Populated when metric cannot be computed")
```

**Endpoint**: `POST /score/platform/ugc-authenticity`

### ONNX / model dependency

This metric does NOT use `model/multitask.py` CreativeScorer (ResNet-50 + BiLSTM). It requires a dedicated VLM path:

**Primary path — Claude Vision API** (`UGC_VLM_BACKEND=claude`):
- Use `anthropic` SDK (`claude-haiku-3-5` for throughput; `claude-sonnet-4-5` for higher-confidence edge cases).
- Image resized to max 1568×1568 before base64 encoding (Anthropic recommended max for vision accuracy vs. cost).
- Implement in `services/ugc_authenticity_claude.py`.
- Add prompt caching on the system prompt (static) using `cache_control: {"type": "ephemeral"}` to reduce token cost by ~40% on repeated classifications.

**Secondary path — BLIP-2 local** (`UGC_VLM_BACKEND=blip2`):
- `Salesforce/blip2-opt-2.7b` via `transformers` pipeline.
- Requires ~5.4 GB VRAM at float16. Run in a dedicated worker process separate from the FastAPI process (via `asyncio` task queue or Celery).
- Implement in `services/ugc_authenticity_blip2.py`.
- For improved label consistency, ensemble 3 prompt variants and take majority vote.

**Low-level signal computation** (always runs, no external model):
- Pure `opencv-python` + `numpy` in `services/ugc_signals.py`.
- Input: decoded `numpy` BGR array from `PIL.Image.open()`.
- No GPU required.

**AI-generated content pre-filter** (optional, `UGC_AI_DETECTION=true`):
- Check C2PA metadata via the `python-c2pa` package if available.
- Alternatively use a lightweight synthetic-face classifier (e.g., `GrumpyFace/deepfake-detector-efficientnet-b4` on Hugging Face) for human-subject images.

### Next.js component

**Filename**: `UGCAuthenticityCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/UGCAuthenticityCard.tsx`

```typescript
interface UGCAuthenticityCardProps {
  slug: "platform.ugc_authenticity";
  ugcAuthenticityScore: number | null;           // 0.0 – 1.0
  productionStyle:
    | "ugc"
    | "lo_fi_branded"
    | "branded_production"
    | "animated_or_graphics"
    | "app_demo"
    | "ai_ugc"
    | "ambiguous"
    | null;
  vlmConfidence: "high" | "medium" | "low" | null;
  vlmTopSignal: string | null;
  lowLevelUgcScore: number | null;               // 0.0 – 0.80
  isPortrait916: boolean | null;
  laplacianVar: number | null;
  noiseStd: number | null;
  isAiGenerated: boolean | null;
  styleConsistency: boolean | null;
  needsHumanReview: boolean | null;
  nullWithReason?: string;
}
```

Render pattern:
- Primary tier badge: `UGC` (green), `LO-FI BRANDED` (amber), `BRANDED PRODUCTION` (blue), `ANIMATED / GRAPHICS` (purple), `AI UGC` (teal + warning icon), `AMBIGUOUS` (orange + review flag).
- Score bar: horizontal `<LinearProgressBar>` 0–1 with labeled zones annotated ("Branded ← → UGC"), marker pin at `ugcAuthenticityScore`.
- VLM signal card: collapsible `<Accordion>` reading "Why this classification?" — shows `vlmTopSignal` text, `vlmConfidence` chip (high/medium/low color-coded).
- Signal breakdown grid: 2×2 grid of signal tiles: Sharpness (`laplacianVar < 100` = green "Phone quality" / red "Studio-sharp"), Noise Level (`noiseStd > 8` = green "Grain present" / red "Clean"), Aspect Ratio (`isPortrait916` = green "9:16 portrait" / red "Landscape"), Colour (`lowLevelUgcScore > 0.5` = green "Ungraded" / amber "Graded").
- AI-generated warning: if `isAiGenerated`, show a yellow banner "AI-generated content detected — platform disclosure may be required on TikTok/Meta."
- Human review flag: if `needsHumanReview`, show amber banner with `<Button onClick={sendToReviewQueue}>Send to review queue</Button>`.
- Platform fit row: derived from tier — "Best fit: TikTok, Instagram Reels" for `ugc`; "Best fit: YouTube, Meta Feed" for `branded_production`.
- `nullWithReason` state: gray `N/A` badge with tooltip.

### Failure mode

```json
{
  "slug": "platform.ugc_authenticity",
  "ugc_authenticity_score": null,
  "production_style": null,
  "null_with_reason": "image_decode_error"
}
```

Valid `null_with_reason` values:

| Value | Trigger |
|---|---|
| `"image_decode_error"` | PIL or base64 decode failure |
| `"image_too_small"` | Image shorter than 128 px on either dimension |
| `"vlm_timeout"` | VLM backend did not respond within 10 seconds; falls back to low-level signals only; if `low_level_ugc_score` computable, returns partial result with `vlm_confidence=null` |
| `"vlm_backend_unavailable"` | Both Claude and BLIP-2 paths unreachable; low-level-only fallback with `null_with_reason` set |
| `"asset_is_video_no_keyframe"` | Video asset and keyframe extraction failed entirely |
| `"unsupported_format"` | Not a recognisable image or video MIME type |
| `"rate_limit_exceeded"` | Claude API rate limit hit; should trigger retry with exponential back-off in calling service |
