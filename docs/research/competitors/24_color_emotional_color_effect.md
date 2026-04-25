# 24 — color.emotional_color_effect

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Neurons Inc | Predict AI — Engagement score (color analysis) | https://www.neuronsinc.com/neurons-ai | Neuroscience-based creative testing |
| Vidmob | Creative Analytics — color tagging + sentiment | https://vidmob.com/creative-scoring | Creative data platform |
| AdSkate | Creative Element Analytics — color + tone | https://www.adskate.com | AI creative analytics |
| Pencil | Ad Element Breakdown — color palette scoring | https://trypencil.com/ | Generative ad platform |
| Canva Magic Design | Color palette mood suggestions | https://www.canva.com/colors/color-wheel/ | Design tool |
| Adobe Firefly / Sensei | Color theme and mood analysis | https://www.adobe.com/sensei.html | Creative AI |
| Hugging Face BLIP-2 | VLM image captioning + VQA for color emotion | https://huggingface.co/Salesforce/blip2-opt-2.7b | Open-source VLM |
| OpenAI GPT-4o | Vision — color/mood analysis via prompt | https://platform.openai.com/docs/guides/vision | Cloud VLM API |

## How they implement it

### Algorithm / model family

**Two complementary approaches are used in production: (A) programmatic color palette analysis and (B) VLM-based holistic emotional tone assessment.**

**Approach A — Programmatic color palette analysis**

Extract dominant colors using k-means clustering (k=5 or k=8 palette):

```python
import cv2
import numpy as np
from sklearn.cluster import KMeans

def extract_dominant_palette(frame_bgr, n_colors=5):
    """Returns list of (hex_color, fraction) sorted by dominance."""
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    pixels = rgb.reshape(-1, 3).astype(np.float32)
    km = KMeans(n_clusters=n_colors, n_init=5, max_iter=100, random_state=42)
    km.fit(pixels)
    counts = np.bincount(km.labels_)
    fractions = counts / counts.sum()
    centers = km.cluster_centers_.astype(int)
    palette = sorted(
        [{"hex": "#{:02X}{:02X}{:02X}".format(*c), "fraction": float(f)}
         for c, f in zip(centers, fractions)],
        key=lambda x: -x["fraction"]
    )
    return palette
```

Map each color to HSV and apply rule-based emotional tone assignment based on color psychology research (Itten, Lüscher, industry advertising studies):

```python
def color_to_tone_contribution(hex_color: str) -> dict:
    """Maps a hex color to emotional tone weights."""
    rgb = tuple(int(hex_color.lstrip('#')[i:i+2], 16) for i in (0,2,4))
    h, s, v = colorsys.rgb_to_hsv(rgb[0]/255, rgb[1]/255, rgb[2]/255)
    h_deg = h * 360
    tones = {"energetic": 0.0, "calm": 0.0, "trustworthy": 0.0, "urgent": 0.0}
    # Red (0–15, 345–360): urgent + energetic
    if h_deg < 15 or h_deg > 345:
        tones["urgent"] += s * v
        tones["energetic"] += s * v * 0.7
    # Orange (15–45): energetic
    elif 15 <= h_deg < 45:
        tones["energetic"] += s * v
    # Yellow (45–70): energetic + warm
    elif 45 <= h_deg < 70:
        tones["energetic"] += s * v * 0.8
    # Green (70–165): calm + trustworthy
    elif 70 <= h_deg < 165:
        tones["calm"] += s * v * 0.6
        tones["trustworthy"] += s * v * 0.5
    # Blue (165–260): trustworthy + calm
    elif 165 <= h_deg < 260:
        tones["trustworthy"] += s * v
        tones["calm"] += s * v * 0.5
    # Purple (260–345): calm + slight urgency
    else:
        tones["calm"] += s * v * 0.4
        tones["urgent"] += s * v * 0.2
    # Low saturation (< 0.2): always pushes toward calm/trustworthy
    if s < 0.2:
        tones["calm"] += 0.3
        tones["trustworthy"] += 0.2
    return tones
```

Aggregate weighted tone contributions across palette entries (weighted by `fraction`). Normalise to sum to 1.0. The dominant tone is the argmax.

**Approach B — VLM-based holistic assessment**

This is the more accurate approach for complex compositions where color, lighting, and layout interact. Use a VLM (BLIP-2 or GPT-4o) with a structured prompt:

*For BLIP-2 (local, free):*

```python
from transformers import Blip2Processor, Blip2ForConditionalGeneration
import torch
from PIL import Image

processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-opt-2.7b", torch_dtype=torch.float16, device_map="auto")

EMOTION_PROMPT = (
    "Question: Looking at the colors, lighting, and overall visual composition of this image, "
    "which single emotional tone best describes it? "
    "Choose exactly one from: energetic, calm, trustworthy, urgent. "
    "Answer with only the single word."
)

def vlm_color_emotion(image_pil):
    inputs = processor(images=image_pil, text=EMOTION_PROMPT, return_tensors="pt").to("cuda", torch.float16)
    out = model.generate(**inputs, max_new_tokens=10)
    answer = processor.decode(out[0], skip_special_tokens=True).strip().lower()
    # Validate against expected labels
    valid = {"energetic", "calm", "trustworthy", "urgent"}
    return answer if answer in valid else "unknown"
```

*For GPT-4o (cloud, higher accuracy):*

```python
import base64, openai

def vlm_color_emotion_gpt4o(image_path: str) -> dict:
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                {"type": "text", "text": (
                    "Analyse the color palette and visual composition of this advertising creative. "
                    "Rate each of the following emotional tones on a scale of 0.0 to 1.0 based on "
                    "how strongly the colors and composition evoke that tone. "
                    "Return JSON only: {\"energetic\": float, \"calm\": float, "
                    "\"trustworthy\": float, \"urgent\": float, \"dominant_tone\": string}"
                )}
            ]
        }],
        max_tokens=100
    )
    return json.loads(response.choices[0].message.content)
```

**Hybrid approach (recommended)**: Run Approach A for fast pre-screening; invoke Approach B (BLIP-2 local) only when the programmatic scores are ambiguous (no tone > 0.4) or when VLM validation is enabled.

For video ads, extract 3 representative keyframes (first second, middle, last second) and average VLM scores across them.

### Metric shape

| Metric | Type | Range | Interpretation |
|---|---|---|---|
| `dominant_tone` | enum | `energetic`, `calm`, `trustworthy`, `urgent` | Primary emotional color tone |
| `energetic_score` | float | 0.0 – 1.0 | Warm-hue, high-saturation intensity |
| `calm_score` | float | 0.0 – 1.0 | Cool/neutral-hue, low-saturation |
| `trustworthy_score` | float | 0.0 – 1.0 | Blue/green dominant palette |
| `urgent_score` | float | 0.0 – 1.0 | Red/high-contrast, saturated warm |
| `palette` | list[ColorEntry] | — | Top-5 dominant colors with hex + fraction |
| `tone_confidence` | float | 0.0 – 1.0 | Score of dominant tone (margin over second) |
| `analysis_method` | enum | `programmatic`, `vlm_blip2`, `vlm_gpt4o` | Which method produced the score |

**Advertising color research context:**
- Red/orange palettes increase urgency perception and short-term conversion intent (Direct Marketing Association, 2019).
- Blue-dominant palettes correlate with +22 % trust scores in finance/insurance ads (AgencyAnalytics color research).
- High-saturation multi-color palettes score highest on "energetic" but reduce clarity (Neurons cognitive demand increases).

### UI pattern

- **Palette swatches**: horizontal row of 5 color squares, each labelled with its hex code and percentage. Below each swatch, a tooltip showing its dominant tone contribution.
- **Tone radar chart**: four-axis radar/spider chart (a `<RadarChart>` chart component) with axes for energetic, calm, trustworthy, urgent — filled polygon shows the scores. Dominant tone axis highlighted.
- **Dominant tone badge**: large labelled pill (e.g., "TRUSTWORTHY") with a brand-relevant icon (shield for trustworthy, lightning bolt for energetic, leaf for calm, flame for urgent).
- **Color temperature bar**: horizontal gradient bar from cool blue to warm red, with a pointer at the computed temperature position derived from average hue of the dominant palette.

### Public screenshots / demos

- Neurons AI metrics explanation (Engagement/Clarity): https://knowledge.neuronsinc.com/neurons-ai-metrics-and-explanations
- Adobe Color wheel color mood tool: https://color.adobe.com/create/color-wheel
- Canva color psychology in marketing: https://www.canva.com/colors/color-meanings/
- BLIP-2 on Hugging Face (model card): https://huggingface.co/Salesforce/blip2-opt-2.7b
- GPT-4o vision guide (OpenAI): https://platform.openai.com/docs/guides/vision

## Help articles & source material

- Color psychology in advertising (AgencyAnalytics): https://agencyanalytics.com/blog/color-psychology-marketing
- Color psychology in marketing and branding (Help Scout): https://www.helpscout.com/blog/psychology-of-color/
- Color psychology: top palettes to evoke emotion (Envato Elements): https://elements.envato.com/learn/color-psychology
- Color psychology in digital advertising (UniAthena): https://uniathena.com/colour-psychology-in-digital-advertising
- Color theory for advertising (Digital Marketing Laboratory): https://www.digitalmarketinglaboratory.com/p/color-theory-for-advertising
- BLIP-2 model documentation (Hugging Face Transformers): https://huggingface.co/docs/transformers/en/model_doc/blip-2
- Teaching BLIP-2 to describe images — fine-tuning pipeline (Medium): https://medium.com/@asadsandhu/teaching-blip-2-to-describe-images-a-hands-on-fine-tuning-pipeline-ad3f72d4a42e
- AICA-Bench: VLMs in affective image content analysis (arxiv 2604.05900): https://arxiv.org/html/2604.05900
- Customizing visual emotion evaluation for MLLMs (arxiv 2509.21950): https://arxiv.org/html/2509.21950v1
- VGG Color Emotion Survey (paper): https://arxiv.org/abs/1503.02507

## Pros / cons / flaws

### What competitors do well

- Neurons Inc correctly connects color composition to cognitive demand (their metric) — high-saturation multi-color palettes score high on cognitive demand, directly linking color to viewer processing load.
- Vidmob and Pencil tag color palette attributes (dominant color, warm/cool, high/low contrast) and correlate them against historical ROAS, giving business context (e.g., "blue-dominant ads in fintech vertical had 18 % higher CTR").
- Adobe Sensei's color intelligence operates at design-tool level, suggesting mood-matched palettes before the ad is even exported.
- GPT-4o provides holistic compositional reasoning (not just palette) — it can note that a technically "calm" blue palette feels urgent because of dynamic diagonal composition.

### Where they fall short

- All programmatic tools reduce emotion to hue-bucket rules, ignoring saturation, value, simultaneous contrast, and compositional energy.
- Vidmob's color tags are binary attributes (`warm_dominant: true/false`), not a continuous emotional tone scale.
- Pencil's scoring is performance-correlation based, not perceptual — it tells you "blue works in your account history" not "why blue works."
- BLIP-2's free-text VQA output is not constrained to the four target tone labels without careful prompting — hallucination risk.
- GPT-4o adds ~400 ms latency and per-image API cost; unsuitable for bulk batch processing at scale.

### Edge cases they miss

- **Dark/desaturated palettes** (common in luxury, premium, tech ads): near-black palettes with gold accents score low on all four tones with programmatic approach. VLM correctly reads these as "trustworthy/premium" — this is a clear case where VLM outperforms programmatic.
- **Seasonal palettes** (Christmas red+green, Halloween orange+black): programmatic rules assign "urgent" to red+green (incorrect). VLM context-reading handles this correctly.
- **Brand CI palettes** (e.g., McDonald's red+yellow): both colors score "urgent" and "energetic" but the brand context makes the palette "familiar/trustworthy." Criterion 19 (`color.brand_ci_match`) overlap — flag if palette matches known brand CI.
- **Video with heavy color grading** (e.g., teal-and-orange Hollywood grade): dominant hue extraction gives misleading blue-green palette despite warm subject tones. Compute palette from the centre 60 % of the frame (excluding heavily graded edges) or use Lab color space distance instead of RGB k-means.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class ColorEntry(BaseModel):
    hex: str
    fraction: float = Field(ge=0.0, le=1.0)
    dominant_tone: Optional[str] = None

class ColorEmotionalColorEffectRequest(BaseModel):
    asset_id: str
    use_vlm: bool = Field(default=True,
        description="Run BLIP-2 VLM analysis in addition to programmatic palette analysis")
    vlm_backend: Literal["blip2", "gpt4o"] = Field(default="blip2")
    keyframe_count: int = Field(default=3, ge=1, le=10,
        description="Number of keyframes to sample for video assets")

class ColorEmotionalColorEffectScore(BaseModel):
    slug: Literal["color.emotional_color_effect"] = "color.emotional_color_effect"
    dominant_tone: Optional[Literal["energetic", "calm", "trustworthy", "urgent"]] = None
    energetic_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    calm_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    trustworthy_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    urgent_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tone_confidence: Optional[float] = Field(None, ge=0.0, le=1.0,
        description="Score of dominant tone minus second-highest; 1.0 = unambiguous")
    palette: Optional[List[ColorEntry]] = None
    analysis_method: Optional[Literal["programmatic", "vlm_blip2", "vlm_gpt4o", "hybrid"]] = None
    null_with_reason: Optional[str] = Field(None)
```

**Endpoint**: `POST /score/color/emotional-color-effect`

### ONNX / model dependency

- **Programmatic path**: pure NumPy + scikit-learn `KMeans` + `colorsys` stdlib — no ONNX needed.
- **VLM path (BLIP-2)**: `pip install transformers accelerate` + `Salesforce/blip2-opt-2.7b` weights from Hugging Face Hub (~6 GB). This is too large to embed in `model/weights/`; load from HF cache at startup. Add a `blip2_model` attribute to `model/multitask.py` CreativeScorer only if `config.use_vlm=True`:
  ```python
  from transformers import Blip2Processor, Blip2ForConditionalGeneration
  self.blip2_processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
  self.blip2_model = Blip2ForConditionalGeneration.from_pretrained(
      "Salesforce/blip2-opt-2.7b", torch_dtype=torch.float16, device_map="auto")
  ```
- **VLM path (GPT-4o)**: use `openai` SDK; requires `OPENAI_API_KEY` env var. Wrap in a separate `services/vlm_client.py` to keep model/multitask.py clean.
- **Lighter alternative**: `Salesforce/blip2-opt-2.7b` can be swapped for `Salesforce/blip2-flan-t5-xl` (~4 GB, better instruction following for classification prompts).

### Next.js component

**Filename**: `ColorEmotionalColorEffectCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/ColorEmotionalColorEffectCard.tsx`

```typescript
interface ColorEntry {
  hex: string;
  fraction: number;
  dominantTone?: string;
}

interface ColorEmotionalColorEffectCardProps {
  slug: "color.emotional_color_effect";
  dominantTone: "energetic" | "calm" | "trustworthy" | "urgent" | null;
  energeticScore: number | null;    // 0–1
  calmScore: number | null;         // 0–1
  trustworthyScore: number | null;  // 0–1
  urgentScore: number | null;       // 0–1
  toneConfidence: number | null;    // 0–1
  palette: ColorEntry[] | null;
  analysisMethod: "programmatic" | "vlm_blip2" | "vlm_gpt4o" | "hybrid" | null;
  nullWithReason?: string;
}
```

Render a `<RadarChart>` with four axes (energetic, calm, trustworthy, urgent). Show palette swatches row with hex codes. Display `dominantTone` as a large tier badge with icon. Add a method badge (`VLM` or `PROGRAMMATIC`) as a small chip in the card footer.

### Failure mode

```json
{
  "slug": "color.emotional_color_effect",
  "dominant_tone": null,
  "energetic_score": null,
  "calm_score": null,
  "trustworthy_score": null,
  "urgent_score": null,
  "null_with_reason": "vlm_unavailable_fallback_programmatic_inconclusive"
}
```

Other valid `null_with_reason` values: `"decoding_error"`, `"image_too_small_under_100px"`, `"vlm_rate_limit"`, `"all_tones_below_threshold"`. When VLM is unavailable, fall back to programmatic only; if programmatic returns all tones < 0.25 (ambiguous), set `null_with_reason`.
