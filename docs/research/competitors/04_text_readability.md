# 04 — Text Readability

> **Criterion slug:** `text__readability`
> **Definition:** Contrast ratio and font size — does the ad text meet minimum legibility thresholds? WCAG AA minimum: 4.5:1 contrast ratio for normal text (< 18 pt / < 24 px), 3:1 for large text (≥ 18 pt / ≥ 24 px). Recommended minimum font size for body copy in ad creatives: 16 pt (≈ 21 px at 96 dpi).

---

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| W3C / WAI | WCAG 2.1 SC 1.4.3 — Contrast (Minimum) | https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html | Accessibility standard |
| WebAIM | Contrast Checker (web tool) | https://webaim.org/resources/contrastchecker/ | Free audit tool |
| Siege Media | Contrast Ratio checker | https://www.siegemedia.com/contrast-ratio | Free audit tool |
| AdCreative.ai | Creative Scoring AI — text hierarchy & visual clarity scoring | https://www.adcreative.ai/creative-scoring | AI creative scoring |
| Smartly.io | Creative Insights — sentiment scorecard & visual clarity | https://www.smartly.io/product-features/creative-insights | Creative automation |
| CreativeX | Creative Quality Score — text legibility guideline | https://www.creativex.com/products/creative-quality | Creative quality analytics |
| VidMob | Scoring — text legibility, font size tagging | https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring | Creative analytics |
| Google | Display & Video 360 — Ad quality legibility best practices | https://www.gomarble.ai/blog/google-screen-ad-creative-practices | Platform guidance |
| Accessibleweb.com | WCAG Color Contrast Checker (AA/AAA) | https://accessibleweb.com/color-contrast-checker/ | Free audit tool |

---

## How they implement it

### Algorithm / model family

Readability scoring requires two independent sub-computations:

**A. Contrast ratio computation**

1. Extract text bounding boxes via OCR (Tesseract `image_to_data` or PaddleOCR).
2. For each bounding box:
   - Sample the foreground (text) colour: take the median pixel colour inside the bounding box from the original image, using a small eroded mask to avoid background bleed.
   - Sample the background colour: take the median pixel colour in a 5–10 px border around the bounding box.
3. Convert both colours to relative luminance using the WCAG formula:
   ```
   L = 0.2126 × R_lin + 0.7152 × G_lin + 0.0722 × B_lin
   where R_lin = (R/255)^2.2  (simplified sRGB linearisation)
   ```
4. Contrast ratio = `(L_lighter + 0.05) / (L_darker + 0.05)`.
5. PASS if ratio ≥ 4.5 (normal text) or ≥ 3.0 (large text).

The `wcag-contrast-ratio` PyPI package (`pip install wcag-contrast-ratio`) implements steps 3–5 as a two-line call:
```python
import wcag_contrast_ratio as contrast
ratio = contrast.rgb(fg_rgb_normalised, bg_rgb_normalised)  # e.g. 7.43
```

**B. Font size estimation**

OCR bounding box height in pixels is a proxy for font size. Conversion:
```
font_size_pt = (bbox_height_px / image_height_px) × physical_height_mm × (72 / 25.4)
```
Without knowing the physical display size, use a canonical mapping: assume the image will be displayed at 1080 px = 270 mm (a typical phone screen at ~100 dpi). This gives:
```
font_size_pt ≈ bbox_height_px × (270 / 1080) × (72 / 25.4) ≈ bbox_height_px × 0.708
```
So a 30 px tall bounding box ≈ 21 pt. Threshold: body copy ≥ 16 pt (≥ 23 px), headline ≥ 24 pt (≥ 34 px).

**Competitor approaches:**
- **AdCreative.ai:** Uses a CNN (Component Analysis AI) trained on 450 M ad cases to classify text elements by role (headline, subtitle, CTA) and predict whether visual clarity is "strong". The contrast computation details are not published.
- **CreativeX:** Checks text legibility as one of its six universal fundamentals. Implementation appears to be rule-based CV (not published), checking whether text is readable on its background.
- **VidMob:** Uses AWS Rekognition + Google Vision API + custom SageMaker models to tag text properties. Their scoring guideline includes a "Text Legibility" rule that fires a FAIL if text is below a configurable contrast threshold.
- **Smartly.io:** Attention heatmap predicts which regions draw gaze; the sentiment scorecard flags emotional patterns but does not appear to compute WCAG contrast ratios explicitly.

### Metric shape
| Shape | Detail |
|---|---|
| Continuous contrast ratio (float) | 1.0–21.0 per WCAG formula — raw output |
| Normalised compliance score 0–1 | Map: ratio ≥ 7.0 → 1.0 (AAA), ≥ 4.5 → 0.75 (AA pass), ≥ 3.0 → 0.5 (large text pass), < 3.0 → 0.0 |
| Font size compliance flag | PASS (≥ 16 pt) / FAIL (< 16 pt) per text box |
| WCAG tier enum | AAA / AA / AA_large / FAIL |
| Aggregate score | Weighted average over all detected text boxes, weighted by box area |

**Proposed output for our stack:** A single `text__readability` float `[0.0, 1.0]` computed as the area-weighted average of per-box contrast compliance scores, combined with a font-size penalty:
```
readability = 0.7 × contrast_compliance + 0.3 × fontsize_compliance
```

### UI pattern
- **WebAIM Contrast Checker:** Two colour pickers + a large ratio display (e.g. "7.43:1 — Pass AA, Pass AAA") with a green/red badge. Standard pattern for accessibility tools.
- **AdCreative.ai:** Shows a visual clarity percentage inside the creative card; no separate contrast gauge.
- **VidMob:** "Text Legibility" row in the scoring table with PASS/FAIL + the actual computed ratio as a tooltip.
- **Our proposed pattern:** A two-row table per detected text element: column 1 = text snippet (truncated to 20 chars), column 2 = contrast ratio badge (e.g. "6.2:1 ✓"), column 3 = font size badge (e.g. "18 pt ✓"). Below the table, aggregate readability score as a gauge.

### Public screenshots / demos
- WebAIM Contrast Checker (reference UI): https://webaim.org/resources/contrastchecker/
- WCAG 2.1 SC 1.4.3 Understanding document: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- Siege Media Contrast Ratio tool: https://www.siegemedia.com/contrast-ratio
- Google Display Ads creative best practices guide: https://www.gomarble.ai/blog/google-screen-ad-creative-practices
- AdCreative.ai creative scoring demo: https://www.adcreative.ai/creative-scoring

---

## Help articles & source material

- W3C WCAG 2.0 SC 1.4.3 Contrast (Minimum) understanding: https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html
- W3C Technique G18 — ensuring 4.5:1 contrast ratio: https://www.w3.org/TR/WCAG20-TECHS/G18.html
- WebAIM — Contrast and Color Accessibility: https://webaim.org/articles/contrast/
- `wcag-contrast-ratio` PyPI package: https://pypi.org/project/wcag-contrast-ratio/
- Kontrasto — automated color contrast for text over images (Python): https://github.com/thibaudcolas/kontrasto
- Gaurav Gupta — Python approach for Color-Contrast Check: https://medium.com/@gauravgupta_31859/python-approach-for-color-contrast-check-b8c3d9355043
- DigitalA11Y — Understanding WCAG SC 1.4.3: https://www.digitala11y.com/understanding-sc-1-4-3-contrast-minimum/
- AdCreative.ai — How does the AI score your creatives: https://help.adcreative.ai/en/articles/5713632-how-does-the-ai-score-your-creatives
- VidMob scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- CreativeX Creative Quality: https://www.creativex.com/products/creative-quality

---

## Pros / cons / flaws

### What competitors do well
- WebAIM's contrast checker is the gold standard reference UI — its ratio + tier badge is universally understood by designers.
- VidMob's integration with AWS Rekognition + Google Vision gives it multi-engine text detection, increasing recall on stylised fonts where Tesseract fails.
- AdCreative.ai's component-role classification (headline vs. CTA vs. subtitle) enables role-specific thresholds: a micro-disclosure text at 8 pt is treated differently from a headline.

### Where they fall short
- No ad-specific tool publicly implements WCAG contrast measurement — they either reproduce the standard (WebAIM) or use proprietary "visual clarity" scores that are not calibrated to WCAG.
- Text-on-gradient-background or text-on-image backgrounds cannot be accurately scored with a single foreground/background colour pair. The background colour varies pixel-to-pixel, so the worst-case contrast (minimum across the background sample) should be used, but most implementations use an average.
- Font size estimation from pixel bounding boxes is highly unreliable for: condensed fonts, all-caps text, diacritics-heavy scripts, or images downsampled from original production resolution.
- CreativeX's and VidMob's exact contrast thresholds are not published; their PASS/FAIL cut-offs may differ from WCAG 4.5:1.

### Edge cases they miss
- **Multi-colour text:** Gradient fill text where individual glyphs transition from light to dark — no single foreground colour represents the whole element.
- **Drop shadows and strokes:** A text element with a dark drop shadow on a light background may pass contrast even though the core glyph fill is light-on-light. Shadow detection is not implemented in any surveyed tool.
- **Video / animated text:** Text may fade in from transparent, passing through a low-contrast state for several frames. No tool computes per-frame contrast in video assets.
- **Non-Latin scripts:** WCAG contrast is script-agnostic, but OCR accuracy for Arabic, Chinese, Devanagari is much lower with Tesseract's default English model — bounding boxes will be missed.

---

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class TextElementReadability(BaseModel):
    text_snippet: str           # first 25 chars of detected text
    contrast_ratio: float       # e.g. 7.43
    wcag_tier: Literal["AAA", "AA", "AA_large_only", "fail"]
    font_size_pt: float | None  # estimated from bbox height
    font_size_pass: bool | None # True if >= 16 pt

class ReadabilityResponse(BaseModel):
    text__readability: float | None = Field(
        None,
        ge=0.0, le=1.0,
        description="Area-weighted composite: 0.7*contrast_compliance + 0.3*fontsize_compliance. "
                    "1.0 = all text meets WCAG AA and ≥16pt."
    )
    elements: List[TextElementReadability] | None
    min_contrast_ratio: float | None    # worst-case element
    avg_contrast_ratio: float | None
    null_with_reason: str | None
```

**Endpoint:** `POST /score/text/readability`

### ONNX / model dependency
- **OCR:** Tesseract 4 (`pytesseract`) for bounding box extraction. Use `--oem 1 --psm 6` for block-level text.
- **Contrast calculation:** `wcag-contrast-ratio` pip package (pure Python, no ONNX needed).
- **Background colour sampling:** Use `Pillow` (`PIL.Image`) to crop the background region and compute median RGB:
  ```python
  from PIL import Image
  import numpy as np
  region = np.array(img.crop((x-pad, y-pad, x+w+pad, y+h+pad)))
  bg_rgb = np.median(region.reshape(-1, 3), axis=0) / 255.0
  ```
- **Font size estimation:** Compute `bbox_height_px × 0.708` per the formula above.
- **No ONNX model required.** The `CreativeScorer` in `model/multitask.py` is not needed. Implement as `utils/readability_checker.py`.
- If higher text detection accuracy is needed (stylised fonts), replace Tesseract with the **CRAFT ONNX model** (`model/craft_mlt_25k.onnx`) as described in criterion 03.

### Next.js component

**Filename:** `TextReadabilityScore.tsx`
**Location:** `ui/src/components/application/ad-scoring/TextReadabilityScore.tsx`

```typescript
interface TextElement {
  textSnippet: string;
  contrastRatio: number;
  wcagTier: "AAA" | "AA" | "AA_large_only" | "fail";
  fontSizePt: number | null;
  fontSizePass: boolean | null;
}

interface TextReadabilityScoreProps {
  score: number | null;             // 0.0–1.0
  elements: TextElement[] | null;
  minContrastRatio: number | null;
  avgContrastRatio: number | null;
  nullWithReason?: string;
}
```

**UI pattern:** A compact expandable table. Collapsed state: shows a single composite score gauge (0–100, coloured green/yellow/red) + worst-case contrast ratio badge (e.g. "Min contrast: 3.1:1 — Below AA"). Expanded state: one row per text element with the contrast ratio, WCAG tier badge, and font size. Sort rows by contrast ratio ascending so violations appear first.

### Failure mode

Return `text__readability: null` with:
```python
null_with_reason = "no text regions detected — image may contain only graphical elements or Tesseract returned confidence < 30 on all regions"
```
