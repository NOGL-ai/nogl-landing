# 05 — CTA Keyword / Call-to-Action Presence

> **Criterion slug:** `text__keyword_cta_presence`
> **Definition:** Does the ad copy contain action-oriented CTA keywords? Target word list includes: Buy, Shop, Get, Learn, Sign Up, Try, Download, Start, Discover, Explore, Book, Reserve, Order, Subscribe, Watch, Join, Apply, Claim, Save, Grab. Presence of at least one strong CTA keyword is correlated with higher CTR across platforms.

---

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| AdCreative.ai | Creative Scoring AI — Component Analysis (CTA detection) | https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it | AI creative scoring |
| Pencil AI | Pencil Score — CTA element analysis, creative brief CTA variation | https://trypencil.com/ | AI creative generation |
| Smartly.io | AI Theme Analysis — CTA detection in creative content | https://www.smartly.io/product-features/creative-insights | Creative automation |
| VidMob | Scoring — text element tagging including CTA identification | https://vidmob.com/scoring-2 | Creative analytics |
| CreativeX | Creative Quality Score — CTA presence as a scored fundamental | https://www.creativex.com/products/creative-quality | Creative quality analytics |
| Marpipe | Multivariate testing — CTA copy as a testable creative variable | https://www.marpipe.com/marpipe-multivariate-testing | Creative testing |
| AdStellar | Meta Ads Performance Prediction — CTA signal analysis | https://www.adstellar.ai/blog/meta-ads-performance-prediction | Performance prediction |
| Hawky AI | Ad creative analysis — CTA element identification | https://hawky.ai/blog/best-ai-tools-ad-creative-analysis | Ad analytics |
| Insight-IQ | AI ad creative testing — CTA presence in copy analysis | https://www.insight-iq.ai/blog/ai-ad-creative-testing-ecommerce | E-commerce ad analytics |

---

## How they implement it

### Algorithm / model family

CTA detection in ad creatives uses two complementary paths:

**A. OCR + keyword matching (fast, interpretable)**
1. Extract all text from the image with Tesseract or PaddleOCR.
2. Normalise extracted text: lowercase, strip punctuation.
3. Match against a CTA keyword lexicon. Two tiers:
   - **Tier 1 — Strong CTAs** (imperative verbs with high commercial intent): Buy, Shop, Order, Book, Subscribe, Download, Sign Up, Start Free Trial, Get Started, Claim, Reserve, Apply Now.
   - **Tier 2 — Soft CTAs** (informational / engagement): Learn More, Discover, Explore, Watch, See How, Find Out, Read More.
4. Score: `1.0` if ≥ 1 Tier 1 match; `0.5` if only Tier 2 match(es); `0.0` if no CTA detected.

Optional: use fuzzy matching (`rapidfuzz` or `difflib.SequenceMatcher`) to catch OCR mis-reads: "Sh0p Now" → "Shop Now".

**B. NLP CTA intent classifier (higher accuracy on non-standard phrasing)**
- Fine-tune a small BERT-based classifier (e.g. `distilbert-base-uncased`, 66 M params) on a labelled dataset of ad copy sentences → `{cta, non_cta}`.
- Export to ONNX via `transformers.onnx`: `python -m transformers.onnx --model=distilbert-base-finetuned-cta --feature=sequence-classification model/cta_classifier.onnx`.
- Input: entire OCR-extracted text string. Output: probability of CTA presence `[0.0, 1.0]`.
- This approach catches non-standard CTAs: "Doors open Friday", "Limited spots remaining", "Grab yours today" — which the keyword list would miss.

**Competitor approaches:**
- **AdCreative.ai:** CNN-based component analysis explicitly identifies CTAs as one of the four key elements (logo, title, subtitle, CTA). Its 450 M training cases allow it to learn visual CTA button patterns (rounded rectangle + contrasting colour + imperative text) as a combined signal.
- **Smartly.io AI Theme Analysis:** Breaks each creative into content, CTAs, visuals, and description. The CTA field is extracted and correlated with performance data (CTR, ROAS) in the Creative Insights dashboard.
- **Pencil AI:** Generates ad variations with different CTA strings and measures lift. The Pencil Score incorporates CTA presence and strength as a sub-dimension, drawing on > $1 B in analysed ad spend.
- **VidMob:** Tags whether a text element is a CTA button (by region — typically bottom third of the creative), using AWS Rekognition's text detection + a position heuristic.
- **Marpipe:** Treats CTA copy as a first-class testable variable in its multivariate engine, allowing advertisers to isolate the CTR delta between "Shop Now" vs "Learn More" vs no CTA.

### Metric shape
| Shape | Detail |
|---|---|
| Binary PASS/FAIL | VidMob, CreativeX (CTA present? Y/N) |
| 3-level score 0 / 0.5 / 1.0 | Our tier 1 / tier 2 / none mapping |
| Continuous float 0–1 | NLP classifier output (probability) |
| Matched keyword list | Most useful for debug / explanation |
| CTA strength score | Pencil AI (proprietary, benchmarked vs. $1B spend) |

**Proposed output for our stack:** a float `[0.0, 1.0]` from the NLP classifier (or the tier mapping if using keyword-only approach), plus the matched keywords for explainability.

**Reference CTA keyword list** (store in `data/cta_keywords.json`):
```json
{
  "tier1": ["buy", "shop", "order", "book", "subscribe", "download", "sign up",
            "get started", "start free", "claim", "reserve", "apply now",
            "try free", "try now", "get now", "add to cart"],
  "tier2": ["learn more", "discover", "explore", "watch", "see how",
            "find out", "read more", "see more", "view", "check out",
            "join", "save", "grab"]
}
```

### UI pattern
- **AdCreative.ai:** Shows a "CTA" label in the component breakdown tooltip (hover on creative card). Green checkmark if detected; amber warning if absent.
- **Smartly.io Creative Insights:** Dedicated "CTA" column in the theme analysis table showing the extracted CTA string from each creative, plus its performance rank.
- **Pencil AI:** The Pencil Score breakdown (shown in the prediction panel) includes a "Hook / CTA / Visual" dimension breakdown as a percentage bar — CTA is one of three pillars.
- **Marpipe multivariate results:** Bar chart comparing CTR across CTA variants ("Shop Now": 2.4%, "Learn More": 1.8%, no CTA: 0.9%).
- **Our proposed pattern:** A simple badge row: "CTA Detected: SHOP NOW" (green) or "No CTA Found" (red). Below: a chip list of all matched keywords. Score gauge shows 0–100.

### Public screenshots / demos
- AdCreative.ai creative scoring page (shows component breakdown): https://www.adcreative.ai/creative-scoring
- AdCreative.ai help doc — What is creative scoring AI: https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- Pencil AI for businesses page (Pencil Score breakdown): https://trypencil.com/for-businesses
- Smartly Creative Insights (AI Theme Analysis): https://www.smartly.io/product-features/creative-insights
- Hawky AI — 7 best AI tools for ad creative analysis 2026: https://hawky.ai/blog/best-ai-tools-ad-creative-analysis

---

## Help articles & source material

- AdCreative.ai — How Creative Scoring AI is Revolutionising Ad Performance Optimisation: https://www.adcreative.ai/post/how-creative-scoring-ai-is-revolutionizing-ad-performance-optimization
- AdCreative.ai — What is creative scoring AI and how to use it: https://help.adcreative.ai/en/articles/8885776-what-is-creative-scoring-ai-and-how-to-use-it
- Pencil AI — Ad Creative on Steroids (CTA / hook analysis): https://aitoolspoint.com/ad-creative-on-steroids-how-pencil-ai-predicts-and-generates-winning-ads/
- Smartly — Predictive Creative Performance FAQ: https://www.smartly.io/resources/predictive-creative-potential-faqs-on-ai-pre-flight-creative-testing
- Smartly — Creative Insights product page: https://www.smartly.io/product-features/creative-insights
- VidMob — Scoring methodology: https://help.vidmob.com/en/articles/8411508-what-is-the-methodology-for-scoring
- Marpipe — Facebook ad testing best practices: https://www.marpipe.com/blog/facebook-ad-testing-best-practices
- AdStellar — Meta Ads performance prediction guide: https://www.adstellar.ai/blog/meta-ads-performance-prediction
- Hawky AI — Best AI tools for ad creative analysis 2026: https://hawky.ai/blog/best-ai-tools-ad-creative-analysis
- Insight-IQ — AI ad creative testing for e-commerce: https://www.insight-iq.ai/blog/ai-ad-creative-testing-ecommerce
- rapidfuzz PyPI (fuzzy keyword matching): https://pypi.org/project/rapidfuzz/
- Hugging Face DistilBERT base model: https://huggingface.co/distilbert-base-uncased

---

## Pros / cons / flaws

### What competitors do well
- Marpipe's multivariate engine is the most scientifically rigorous — it isolates the CTA variable with statistical significance testing across real ad spend, giving advertisers evidence-based CTA recommendations.
- Pencil AI's combination of CTA generation + scoring + benchmarking against $1 B in spend data is the most complete end-to-end CTA optimisation workflow.
- AdCreative.ai's visual CTA detection (recognising the CTA button as a styled element, not just text) means it catches CTAs even when OCR misreads the text.
- Smartly's AI Theme Analysis surfaces which CTA string performed best in your own account history — personalised benchmarks rather than generic best practices.

### Where they fall short
- All keyword-matching approaches are language-specific; none of the surveyed tools have multilingual CTA lexicons for languages other than English (e.g., "Compra Ahora", "Jetzt Kaufen", "Acheter").
- NLP classifiers trained on ad copy may not generalise to image-extracted OCR text, which is often fragmented, mis-capitalised, or split across multiple bounding boxes.
- None of the surveyed tools score the **visual prominence** of the CTA — a tiny 8 pt "Shop Now" in the corner scores the same as a bold 48 pt CTA button on a contrasting background.
- Platform-specific CTA button fields (Meta's "Shop Now" button added in Ads Manager; TikTok's action button) are ignored by all creative-image-analysis tools because they appear in the ad unit wrapper, not in the creative image itself.

### Edge cases they miss
- **Implied CTAs:** "Limited time offer — ends Sunday" has no imperative verb but functions as a strong CTA. Pure keyword matching scores this as 0.0.
- **Negative CTAs:** "Don't miss out" contains "out" but is structurally a CTA. Keyword matching on "out" would be a false positive if the lexicon is too broad.
- **CTA-only video hooks:** Many TikTok ads open with a verbal CTA in the voiceover with no on-screen text. Image-analysis tools cannot detect audio CTAs; this criterion should be flagged as N/A for video assets without burned-in captions.
- **Non-English CTA buttons in English-dominant ads:** A French CTA "Achetez maintenant" on an English-language creative will score 0.0 on an English-only lexicon.

---

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List

class CTAPresenceResponse(BaseModel):
    text__keyword_cta_presence: float | None = Field(
        None,
        ge=0.0, le=1.0,
        description="CTA presence score: 1.0=Tier 1 CTA detected, 0.5=Tier 2 only, "
                    "0.0=no CTA found. Or NLP classifier probability if using model path."
    )
    cta_tier: Literal["tier1", "tier2", "none"] | None
    matched_keywords: List[str] | None      # e.g. ["shop now", "get started"]
    full_ocr_text: str | None               # raw OCR string for debug
    null_with_reason: str | None
```

**Endpoint:** `POST /score/text/keyword-cta`

### ONNX / model dependency

**Option A — keyword matching only (v1, no ONNX, < 5 ms):**
```python
# utils/cta_detector.py
import json, re
from rapidfuzz import fuzz

with open("data/cta_keywords.json") as f:
    CTA = json.load(f)   # {"tier1": [...], "tier2": [...]}

def detect_cta(ocr_text: str) -> dict:
    text_lower = ocr_text.lower()
    for kw in CTA["tier1"]:
        if kw in text_lower or fuzz.partial_ratio(kw, text_lower) >= 88:
            return {"tier": "tier1", "score": 1.0, "matched": [kw]}
    for kw in CTA["tier2"]:
        if kw in text_lower:
            return {"tier": "tier2", "score": 0.5, "matched": [kw]}
    return {"tier": "none", "score": 0.0, "matched": []}
```

**Option B — NLP classifier (v2, higher accuracy):**
- Model: Fine-tune `distilbert-base-uncased` on an internal labelled dataset of ad copy sentences (label: CTA present / absent).
- Export: `optimum-cli export onnx --model ./cta_finetuned model/cta_classifier_onnx/`
- Produces `model/cta_classifier_onnx/model.onnx` (~260 MB).
- Load in `model/multitask.py` as an optional secondary head: `CreativeScorer.cta_head` using `onnxruntime.InferenceSession`.
- Input: tokenised OCR text string (max 128 tokens). Output: `[P_no_cta, P_cta]` softmax probabilities.
- Use `P_cta` directly as `text__keyword_cta_presence`.
- Fallback to Option A if the ONNX model file is absent.

**OCR dependency:** Both options require OCR text extraction. Reuse the same Tesseract call from criteria 03 and 04 to avoid duplicate processing — pass `ocr_text` as a shared input to all text-based scorers in the pipeline.

### Next.js component

**Filename:** `CTAPresenceScore.tsx`
**Location:** `ui/src/components/application/ad-scoring/CTAPresenceScore.tsx`

```typescript
interface CTAPresenceScoreProps {
  score: number | null;                        // 0.0–1.0
  ctaTier: "tier1" | "tier2" | "none" | null;
  matchedKeywords: string[] | null;            // ["shop now"]
  fullOcrText: string | null;
  nullWithReason?: string;
}
```

**UI pattern:**
- Primary display: large badge showing either a green "CTA FOUND" or red "NO CTA" label.
- If detected: show a chip for each matched keyword (e.g. `[SHOP NOW]` styled as a pill).
- Score gauge: simple 0–100 number with colour (green ≥ 80, yellow 40–79, red < 40).
- "Full text" expandable disclosure block showing the raw OCR output — useful for QA when the OCR mis-read a word and the score seems wrong.
- If `nullWithReason` is set, render a grey "N/A" badge with the reason as a tooltip instead of the score gauge.

### Failure mode

Return `text__keyword_cta_presence: null` with:
```python
null_with_reason = "OCR extraction failed or returned empty string — creative may be image-only with no machine-readable text"
```

For video assets without burned-in captions, return:
```python
null_with_reason = "video asset with no on-screen text detected — CTA may be in audio track, which is not analysed by this scorer"
```
