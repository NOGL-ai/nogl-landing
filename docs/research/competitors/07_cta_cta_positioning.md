# 07 — cta.cta_positioning

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Meta Ads Manager | Safe Zone Guardrail + Ad Strength | https://www.facebook.com/business/help | Self-serve ad platform |
| TikTok Ads Manager | CTA button placement controls | https://ads.tiktok.com/help/article/available-placements-for-the-call-to-action-button | Self-serve ad platform |
| Smartly.io | Creative Insights + Predictive Potential | https://www.smartly.io/product-features/creative-insights | Enterprise creative automation |
| AdKit | Social Media Safe Zone Checker | https://adkit.so/tools/safe-zones | Free/paid safe zone tool |
| poster.ly | Meta Ads Safe Zone Visualizer | https://www.poster.ly/tools/meta-ads-safe-zone-visualizer | Creative tooling |
| AdCreative.ai | TikTok Safe Zone guidance + scoring | https://www.adcreative.ai/post/optimization-of-your-tiktok-ads-how-to-master-the-tiktok-safe-zone | AI ad generation |
| Marpipe | Creative element position testing | https://www.marpipe.com/blog/how-to-ddesign-for-metas-adapt-to-placement | E-commerce ad testing |
| Celtra | CMP with placement-aware templates | https://celtra.com/ | Creative management platform |

## How they implement it

### Algorithm / model family

- **Meta Ads Manager Safe Zone Guardrail**: Rule-based overlay at ad-setup time. Meta defines absolute pixel exclusion zones for each placement (Feed, Reels, Stories). The tool renders a semi-transparent overlay on the uploaded creative highlighting unsafe regions. No ML; pure geometric rules applied to the declared aspect ratio. As of March 2026 Meta consolidated Facebook and Instagram Reels/Stories into a single unified 9:16 safe zone: keep content outside the top 14% (~358px), bottom 20–35%, and sides 6% each on a 1440×2560 canvas.

- **TikTok Ads Manager**: Platform enforces CTA button position for In-Feed and TopView ads. The UI overlay layer covering bottom ~23–25% of the 1080×1920 frame (caption bar + CTA button row) is documented in the TikTok Ads help center. Advertisers choose a CTA button text from a dropdown; the platform places it. For branded content, the right edge (~120–180 px) is reserved for engagement icons. TikTok's system automatically flags video ads where critical content falls in the UI-overlay zone during creative submission.

- **Smartly.io Creative Insights**: Computer vision analysis identifies where visual elements (including text blocks) are located relative to platform-specific safe-zone rules. The tool surfaces a warning if a detected CTA element overlaps the unsafe zone for the target placement. Powered by computer vision + eye-tracking simulation models. Reports are framed as "attention distribution" — whether the CTA region receives sufficient eye-tracking model attention score.

- **AdCreative.ai**: Rule-based safe zone guidance documented for TikTok (1080×1920, avoid bottom ~250–300 px and right ~120 px). Their CTA score incorporates whether the CTA element (detected via the Component Analysis AI described in criterion 06) falls within the platform safe zone for the declared `platform` parameter.

- **Marpipe**: Tests CTA position as a multivariate axis (e.g., CTA in lower-left vs. lower-center vs. lower-right). No pre-flight position scoring; evaluates post-spend statistical lift.

### Metric shape

- **Meta**: Binary guardrail (pass/fail per placement), no numeric score.
- **TikTok**: Binary system check during upload, no score.
- **Smartly.io**: Aggregate 0–100 score; position issues surface as named recommendations, not a sub-score.
- **Our target**: Float 0.0–1.0 representing fraction of the CTA bounding box that falls within the platform hotspot zone minus penalty for overlap with UI-obstruction zone.

  Score formula:
  ```
  hotspot_overlap_ratio = area(CTA_bbox ∩ hotspot_zone) / area(CTA_bbox)
  obstruction_penalty   = area(CTA_bbox ∩ obstruction_zone) / area(CTA_bbox)
  score = clamp(hotspot_overlap_ratio - obstruction_penalty, 0.0, 1.0)
  ```

  Hotspot zones (normalized 0–1 from top-left):
  - **Meta 9:16** (Reels/Stories): bottom-center region, approx. x:[0.15, 0.85], y:[0.55, 0.80] (above the bottom UI bar)
  - **Meta Feed 1:1**: center-lower-third, approx. x:[0.25, 0.75], y:[0.60, 0.85]
  - **TikTok In-Feed 9:16**: bottom-center above caption, approx. x:[0.10, 0.75], y:[0.55, 0.77]
  - **Google Display 1.91:1**: right-center, approx. x:[0.65, 0.95], y:[0.35, 0.65]

  Obstruction zones (normalized):
  - **Meta 9:16**: top 14% (y:[0, 0.14]), bottom 20–35% (y:[0.65, 1.0]), sides 6% each
  - **TikTok In-Feed**: bottom 23–25% (y:[0.75, 1.0]), right 11–17% (x:[0.83, 1.0])

  Buckets: `off_zone` (0.0–0.29), `partial` (0.30–0.69), `optimal` (0.70–1.0).

### UI pattern

- **Meta Ads Manager**: Translucent grey overlay on creative preview with "safe" and "unsafe" region labels. Toggle button to show/hide overlay. No numeric score — ad cannot proceed to submission if critical text overlaps unsafe zone (soft warning, not hard block).
- **TikTok Ads Manager**: Grid overlay displayed in the creative editor showing the caption / CTA / engagement icon zones as colored bands. Hard validation error if CTA button text conflicts with auto-placed platform CTA.
- **Smartly.io**: Heatmap + named recommendations panel ("Your CTA is outside the attention hotspot for Meta Reels"). Position shown on a preview thumbnail.
- **Our target**: Image preview with two rendered overlay rectangles — green for hotspot zone, red for obstruction zone — with the detected CTA bounding box drawn in the tier color. Numeric gauge (0–100) + tier badge (`off_zone` / `partial` / `optimal`).

### Public screenshots / demos

- Meta safe zone documentation: https://adsuploader.com/blog/meta-ads-safe-zones
- TikTok CTA placement help: https://ads.tiktok.com/help/article/available-placements-for-the-call-to-action-button
- AdKit safe zone checker: https://adkit.so/tools/safe-zones
- poster.ly Meta safe zone visualizer: https://www.poster.ly/tools/meta-ads-safe-zone-visualizer
- Adverthunt TikTok safe zone checker: https://adverthunt.com/tools/ad-safe-zone-checker/tiktok

## Help articles & source material

- https://adsuploader.com/blog/meta-ads-safe-zones
- https://billo.app/blog/meta-ads-safe-zones/
- https://houseofmarketers.com/guide-to-safe-zones-tiktok-facebook-instagram-stories-reels/
- https://ads.tiktok.com/help/article/available-placements-for-the-call-to-action-button
- https://zeely.ai/blog/tiktok-safe-zones/
- https://predis.ai/resources/tiktok-safe-zone-guide/
- https://www.emarketselect.com/blog/the-ultimate-guide-to-meta-ad-specs-design-2025-edition-meta-safe-zones-formats-cta-buttons-best-practices
- https://strikesocial.com/blog/maximize-ad-visibility-and-cut-through-the-noise-with-safe-zone-guides/
- https://www.adsmurai.com/en/articles/social-media-ad-design-safe-zones-and-templates
- https://www.marpipe.com/blog/how-to-ddesign-for-metas-adapt-to-placement

## Pros / cons / flaws

### What competitors do well

- Meta and TikTok provide exact pixel-level obstruction zones via official platform documentation, making rule-based scoring highly reliable.
- AdKit and poster.ly offer free, always-current safe zone overlays that update when platforms change specs — useful reference for keeping our zone definitions current.
- Smartly.io connects position analysis to attention modeling, providing a reason for why the placement matters (attention capture), not just whether it's in the zone.

### Where they fall short

- No competitor distinguishes between CTA falling in the obstruction zone (bad, will be hidden by UI) vs. CTA placed in a high-attention hotspot (good, visible and in scan path). Most tools only check the negative condition.
- Platform safe zones are documented for standard aspect ratios (9:16, 1:1, 1.91:1) but not for custom ratios submitted via API or for carousel card-by-card variation.
- No tool checks whether a detected CTA is behind a translucent overlay layer in the creative itself (e.g., a gradient bar that reduces the contrast of the CTA against a busy background even if the CTA is in the correct zone).
- Marpipe's position testing requires real spend; there is no predictive signal before campaign launch.

### Edge cases they miss

- Animated CTAs that slide in from outside the safe zone and settle in-zone (a static frame analysis would fail if the frame captured pre-animation)
- Multi-locale resizing: an ad designed for Instagram Feed 1:1 that is auto-resized to 9:16 by Meta's "Adapt to Placement" — the CTA migrates to a different position in the resized version
- CTAs positioned correctly for the main placement but incorrectly for secondary auto-placements (Meta Audience Network, Facebook Marketplace)
- Aspect ratios outside the four major formats (e.g., 4:5 Facebook Feed, 2:3 Pinterest)

## Implementation hints for our stack

### FastAPI endpoint shape

```python
# serving/api.py — new endpoint POST /score/cta-positioning
from pydantic import BaseModel, Field
from typing import Optional, Literal

PlatformType = Literal["meta_reels", "meta_feed", "tiktok_infeed", "google_display", "generic"]

class CtaPositioningRequest(BaseModel):
    ad_id: int
    image_b64: str                          # base64-encoded JPEG/PNG
    platform: PlatformType = "meta_reels"
    cta_bbox: Optional[list[int]] = None    # [x1, y1, x2, y2] from cta_presence; re-detected if omitted

class CtaPositioningResponse(BaseModel):
    ad_id: int
    slug: str = "cta.cta_positioning"       # always this value
    score: Optional[float] = Field(None, ge=0.0, le=1.0)
    tier: Optional[str] = Field(None, description="off_zone | partial | optimal")
    hotspot_overlap: Optional[float] = None  # fraction of CTA bbox inside hotspot zone
    obstruction_overlap: Optional[float] = None  # fraction inside platform UI obstruction zone
    platform: str
    null_with_reason: Optional[str] = None
```

### ONNX / model dependency

No ML model required for the core geometry computation. Two dependencies:

1. **CTA detection** (if `cta_bbox` not provided in request): reuse the Tesseract + OpenCV pipeline from `cta.cta_presence` (criterion 06). Extract the bounding box of the highest-confidence CTA element.

2. **Zone geometry**: implement a `PLATFORM_ZONES` dict keyed by `PlatformType`:
   ```python
   # services/cta_zones.py
   PLATFORM_ZONES = {
       "meta_reels":     {"obstruction": [(0,0,1,0.14),(0,0.65,1,1),(0,0,0.06,1),(0.94,0,1,1)],
                          "hotspot":     [(0.15,0.55,0.85,0.80)]},
       "meta_feed":      {"obstruction": [(0,0,1,0.10),(0,0.87,1,1)],
                          "hotspot":     [(0.25,0.60,0.75,0.85)]},
       "tiktok_infeed":  {"obstruction": [(0,0,1,0.08),(0,0.75,1,1),(0.83,0,1,1)],
                          "hotspot":     [(0.10,0.55,0.75,0.77)]},
       "google_display": {"obstruction": [],
                          "hotspot":     [(0.65,0.35,0.95,0.65)]},
   }
   # All coords normalized [0,1] relative to image width/height
   ```
   Compute intersection areas using pure Python rectangles (`max(0, min(x2,bx2)-max(x1,bx1)) * max(0, min(y2,by2)-max(y1,by1))`). No OpenCV needed for zone overlap itself.

3. **Image dimension extraction**: `PIL.Image.open(BytesIO(base64.b64decode(image_b64))).size` to normalize the `cta_bbox` pixel coords.

Do not route through `model/multitask.py` — this metric is purely geometric.

### Next.js component

```
File: ui/src/components/application/ad-scoring/CtaPositioningCard.tsx

Props interface:
  interface CtaPositioningCardProps {
    adId: number;
    score: number | null;
    tier: "off_zone" | "partial" | "optimal" | null;
    hotspotOverlap: number | null;       // 0–1
    obstructionOverlap: number | null;   // 0–1
    platform: string;
    ctaBbox: [number, number, number, number] | null;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    nullWithReason?: string;
  }

Render:
  - <canvas> overlay on imageUrl:
      - Draw all hotspot zone rectangles as semi-transparent green fills (rgba 0,200,0,0.15) with green stroke
      - Draw all obstruction zone rectangles as semi-transparent red fills (rgba 200,0,0,0.15) with red stroke
      - Draw ctaBbox (if present) as a thick border in the tier color: off_zone=red, partial=amber, optimal=green
  - Dual progress bars: "Hotspot overlap: N%" and "Obstruction overlap: N%" below the image
  - Tier badge and numeric gauge (0–100)
  - Platform selector dropdown (read-only display, not interactive — shows which platform rules were applied)
  - If nullWithReason is set, show gray "N/A" badge with tooltip
```

### Failure mode

Return `score: null, tier: null, null_with_reason: "cta_not_detected"` when no CTA bounding box can be established (either `cta_bbox` was not provided in the request and the Tesseract pipeline returns no CTA text, or the provided `cta_bbox` has zero area).

Additional `null_with_reason` values:
- `"unknown_platform"` — `platform` value not in `PLATFORM_ZONES`
- `"image_decode_error"` — base64 or PIL decode fails
- `"image_too_small"` — image smaller than 100×100 px
