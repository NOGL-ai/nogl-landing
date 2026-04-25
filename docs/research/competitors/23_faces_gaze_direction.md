# 23 — faces.gaze_direction

## Companies / products doing this

| Company | Product | URL | Category |
|---|---|---|---|
| Brainsight | Predictive Attention API — Gaze Cueing | https://www.brainsight.app/post/gaze-cueing-two-stage-attention-flow-design | Predictive eye-tracking |
| Neurons Inc | Predict AI — Gaze Plot + CTA attention | https://www.neuronsinc.com/insights/predict-start-end-attention-heatmap | Neuroscience-based creative testing |
| Tobii Pro | Screen-based eye tracking + ad testing | https://www.tobii.com/products/eye-trackers | Hardware eye-tracking (research) |
| iMotions | Eye Tracking module + gaze replay | https://imotions.com/products/imotions-lab/modules/eye-tracking/ | Biometric research platform |
| Lumen Research | Attention measurement — gaze to CTA | https://www.lumen-research.com/ | Attention analytics |
| Google MediaPipe | Iris / FaceLandmarker gaze estimation | https://developers.google.com/mediapipe/solutions/vision/face_landmarker | Open-source ML toolkit |
| Realeyes (Adverteyes) | PreView — viewer attention + gaze | https://adverteyes.ai/human-measurement/ | Webcam-based attention |

## How they implement it

### Algorithm / model family

**Gaze direction toward CTA** is a two-component problem: (A) estimate the direction the face in the ad is looking, and (B) determine whether that direction vector points toward the CTA bounding box region.

**Stage 1 — Face and iris landmark detection**

Use MediaPipe FaceLandmarker (Python: `mediapipe.solutions.face_mesh` with `refine_landmarks=True`). This returns 478 landmarks including iris-specific points:

```python
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
LEFT_IRIS  = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]
LEFT_EYE_CORNERS  = [33, 133]   # inner/outer canthus
RIGHT_EYE_CORNERS = [362, 263]

with mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
) as face_mesh:
    results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
```

**Stage 2 — Gaze vector computation**

Compute iris centre relative to eye bounds to estimate horizontal (left/right) and vertical (up/down) gaze direction:

```python
def iris_position_ratio(landmarks, iris_indices, corner_indices, img_w, img_h):
    """Returns (horizontal_ratio, vertical_ratio) in [0,1].
    horizontal: 0 = looking hard left, 1 = looking hard right.
    vertical: 0 = looking up, 1 = looking down."""
    iris_pts = np.array([(landmarks[i].x * img_w, landmarks[i].y * img_h)
                         for i in iris_indices])
    eye_pts  = np.array([(landmarks[i].x * img_w, landmarks[i].y * img_h)
                         for i in corner_indices])
    iris_cx = iris_pts[:, 0].mean()
    iris_cy = iris_pts[:, 1].mean()
    eye_left   = eye_pts[:, 0].min()
    eye_right  = eye_pts[:, 0].max()
    eye_top    = eye_pts[:, 1].min()
    eye_bottom = eye_pts[:, 1].max()
    h_ratio = (iris_cx - eye_left) / (eye_right - eye_left + 1e-6)
    v_ratio = (iris_cy - eye_top)  / (eye_bottom - eye_top + 1e-6)
    return h_ratio, v_ratio
```

Average the left and right eye ratios to get the final gaze vector `(gaze_h, gaze_v)` where `(0.5, 0.5)` = looking straight at the camera.

For 3D head pose estimation (more robust for profile-angled faces), use the PnP solver approach with 3D nose/chin landmarks:

```python
# Solvable with cv2.solvePnP using 6 known 3D facial landmarks
# Returns (pitch, yaw, roll) head orientation in degrees
_, rvec, tvec = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs)
rmat, _ = cv2.Rodrigues(rvec)
yaw = np.degrees(np.arctan2(rmat[1,0], rmat[0,0]))
pitch = np.degrees(np.arctan2(-rmat[2,0], np.sqrt(rmat[2,1]**2 + rmat[2,2]**2)))
```

**Stage 3 — CTA region determination**

The CTA bounding box must be either: (a) detected by a text/button classifier in the same frame, or (b) specified as a parameter (e.g., `cta_region: [x1, y1, x2, y2]` in normalised [0,1] coordinates). Map the frame into a 3×3 grid:

```
top-left    | top-center    | top-right
mid-left    | center        | mid-right
bot-left    | bot-center    | bot-right
```

Determine which grid cell the CTA centroid falls in (e.g., `bot-right`). Determine which direction the gaze vector points toward relative to the face position (e.g., gaze_h > 0.6 → looking right; gaze_v > 0.6 → looking down → "toward bot-right").

**Stage 4 — Gaze-toward-CTA scoring**

Compare gaze direction label vs. CTA grid cell relative to face position:

```python
def gaze_toward_cta(gaze_h, gaze_v, face_bbox, cta_bbox, img_w, img_h) -> bool:
    """True if gaze direction vector points from face centroid toward CTA centroid."""
    face_cx = (face_bbox[0] + face_bbox[2]) / 2 / img_w
    face_cy = (face_bbox[1] + face_bbox[3]) / 2 / img_h
    cta_cx  = (cta_bbox[0] + cta_bbox[2]) / 2
    cta_cy  = (cta_bbox[1] + cta_bbox[3]) / 2
    # Vector from face to CTA
    needed_h = cta_cx - face_cx   # positive = CTA is to the right
    needed_v = cta_cy - face_cy   # positive = CTA is below
    # Gaze offset from centre (0.5, 0.5)
    actual_h = gaze_h - 0.5       # positive = looking right
    actual_v = gaze_v - 0.5       # positive = looking down
    # Dot product of needed direction vs actual gaze direction
    dot = needed_h * actual_h + needed_v * actual_v
    return dot > 0.05             # threshold: gaze aligned within ~90° of CTA direction
```

### Metric shape

| Metric | Type | Range | Interpretation |
|---|---|---|---|
| `gaze_direction` | enum | `toward_cta`, `away_from_cta`, `camera`, `unknown` | Primary classification |
| `gaze_toward_cta` | bool | true/false | Binary flag for scoring |
| `gaze_alignment_score` | float | -1.0 – 1.0 | Dot product of gaze vector vs. face→CTA vector; > 0 = aligned |
| `gaze_h_ratio` | float | 0.0 – 1.0 | 0 = hard left, 0.5 = centre, 1.0 = hard right |
| `gaze_v_ratio` | float | 0.0 – 1.0 | 0 = hard up, 0.5 = centre, 1.0 = hard down |
| `head_yaw_deg` | float | -90 – 90 | Yaw angle; supplement to iris ratio for profile faces |
| `cta_grid_cell` | enum | `top-left` … `bot-right`, `center` | Where CTA lands in frame grid |

Research basis (Brainsight gaze cueing model): faces looking toward an element increase attention to that element by up to 40 % in the first 3 seconds of viewing (two-stage gaze cueing model). A face looking at the camera creates joint attention, which is positive for brand recall but does not specifically guide to CTA.

### UI pattern

- **Overlay diagram**: a simplified face icon with a directional arrow representing the gaze vector, overlaid on a thumbnail of the creative. The arrow is green if `gaze_toward_cta = true`, red if `away_from_cta`.
- **Grid map**: 3×3 grid overlay on the ad thumbnail — CTA cell highlighted in blue, face centroid marked as a dot, gaze arrow drawn from face dot toward the edge of the grid in the gaze direction.
- **Tier badge**: `TOWARD CTA` (green) / `CAMERA` (amber) / `AWAY FROM CTA` (red) in card header.
- **Alignment score bar**: horizontal bar from -1 to +1 showing `gaze_alignment_score`, with 0 marked as a centre divider.

### Public screenshots / demos

- Brainsight gaze cueing explained (with diagram): https://www.brainsight.app/post/gaze-cueing-two-stage-attention-flow-design
- Brainsight gaze cueing case study with predictive AI: https://www.brainsight.app/post/design-for-gaze-cueing-with-predictive-eye-tracking
- Neurons Inc gaze plot + start/end attention heatmap: https://www.neuronsinc.com/insights/predict-start-end-attention-heatmap
- MediaPipe Iris blog post (Google Research): https://research.google/blog/mediapipe-iris-real-time-iris-tracking-depth-estimation/

## Help articles & source material

- MediaPipe FaceLandmarker (iris tracking, refined landmarks): https://developers.google.com/mediapipe/solutions/vision/face_landmarker
- MediaPipe Iris tracking depth estimation (Google Research blog): https://research.google/blog/mediapipe-iris-real-time-iris-tracking-depth-estimation/
- MediaPipe Face Mesh legacy docs (iris landmark indices): https://mediapipe.readthedocs.io/en/latest/solutions/face_mesh.html
- Eye tracking with MediaPipe and OpenCV (tutorial): https://kh-monib.medium.com/title-gaze-tracking-with-opencv-and-mediapipe-318ac0c9c2c3
- Python Gaze Face Tracker (GitHub, alireza787b): https://github.com/alireza787b/Python-Gaze-Face-Tracker
- Brainsight predictive eye-tracking science: https://www.brainsight.app/predictive-eye-tracking-science
- Brainsight ad creative benchmarking guide: https://www.brainsight.app/post/how-to-pre-test-benchmark-ads
- Gaze cueing two-stage attention model (Brainsight): https://www.brainsight.app/post/gaze-cueing-two-stage-attention-flow-design
- Real-time gaze estimation using webcam CNN models: https://www.mdpi.com/2073-431X/14/2/57
- Gaze estimation network with multi-head attention: https://www.mdpi.com/1424-8220/25/6/1893

## Pros / cons / flaws

### What competitors do well

- Brainsight's gaze cueing model correctly applies the two-stage model: stage 1 (orienting response — does gaze cue shift attention at all?), stage 2 (does shifted attention land on the CTA?). The 94 % accuracy claim against live eye-tracking validates their AI-predicted approach.
- Neurons Inc provides gaze plots showing the natural viewing order (fixation sequence) which directly shows whether CTA is in the early fixation sequence (ideal: top-3 fixation).
- iMotions + Tobii provides ground-truth eye-tracking data from real viewers — the gold standard for validation.
- Lumen Research specialises in measuring real gaze-to-CTA conversion in live ad serving contexts (GDPR-compliant opt-in panel).

### Where they fall short

- All gaze-cueing analysis by Brainsight and Neurons is based on *where the audience looks*, not on *where the face in the ad looks*. Our criterion is the opposite: analysing whether the character/person depicted in the creative is directing the audience's gaze via their own gaze direction.
- No competitor publicly documents an automated pipeline to extract gaze direction from faces depicted in ad content (rather than real viewer gaze).
- MediaPipe's iris gaze is 2D (screen-space ratio) — it degrades for faces rotated more than ~30° yaw. Head pose compensation is needed for sidelong profiles.
- The `gaze_toward_cta` computation requires knowing where the CTA is — which depends on criterion 06/07 (CTA presence/position) being computed first.

### Edge cases they miss

- **Face looking directly at camera** (`gaze_h ≈ 0.5`, `gaze_v ≈ 0.5`): this is neither toward nor away from CTA. Should be classified as `camera` rather than `unknown`, and treated neutrally (not penalised).
- **Multiple faces with conflicting gaze directions**: one face looks at CTA, another looks away. Aggregate by weighting each face by its bounding box area (larger face = more prominent person in ad).
- **Sunglasses / eye occlusion**: iris detection fails; head pose (yaw/pitch from nose/chin PnP solve) provides a fallback gaze direction estimate even without iris visibility.
- **Profile shots (>45° yaw)**: iris ratio is meaningless from the side. Use head yaw only and classify as `looking_left` or `looking_right`; determine CTA alignment from that.
- **CTA not detected**: if criterion 06 (`cta.cta_presence`) returns no CTA region, fall back to scoring against the bottom-right quadrant (conventional CTA placement) and flag `cta_position_assumed: true`.

## Implementation hints for our stack

### FastAPI endpoint shape

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Tuple

class FacesGazeDirectionRequest(BaseModel):
    asset_id: str
    cta_region: Optional[List[float]] = Field(
        default=None,
        description="Normalised [x1,y1,x2,y2] of CTA bbox in [0,1]. If null, inferred from CTA detection or defaults to bottom-right quadrant.")
    sample_fps: int = Field(default=5, ge=1, le=15)

class FacesGazeDirectionScore(BaseModel):
    slug: Literal["faces.gaze_direction"] = "faces.gaze_direction"
    gaze_direction: Optional[Literal[
        "toward_cta", "away_from_cta", "camera", "unknown"
    ]] = None
    gaze_toward_cta: Optional[bool] = None
    gaze_alignment_score: Optional[float] = Field(None, ge=-1.0, le=1.0,
        description="Dot product of gaze vector vs face-to-CTA vector; > 0 = aligned")
    gaze_h_ratio: Optional[float] = Field(None, ge=0.0, le=1.0)
    gaze_v_ratio: Optional[float] = Field(None, ge=0.0, le=1.0)
    head_yaw_deg: Optional[float] = Field(None, ge=-90.0, le=90.0)
    cta_grid_cell: Optional[str] = Field(None,
        description="Grid cell of detected CTA, e.g. 'bot-right'")
    cta_position_assumed: bool = Field(default=False,
        description="True if CTA region was not detected and defaulted to bot-right quadrant")
    null_with_reason: Optional[str] = Field(None)
```

**Endpoint**: `POST /score/faces/gaze-direction`

### ONNX / model dependency

- **Primary**: MediaPipe `face_mesh` with `refine_landmarks=True` (`pip install mediapipe`). No ONNX export needed — MediaPipe ships its own TFLite graph. The `face_landmarker.task` model file (~6 MB) can be bundled under `model/weights/face_landmarker.task`.
- **Head pose fallback**: pure OpenCV `cv2.solvePnP` with 6 canonical 3D landmarks — no additional model required.
- **Integration with CreativeScorer**: add a `face_mesh` attribute to `model/multitask.py` CreativeScorer:
  ```python
  import mediapipe as mp
  self.face_mesh = mp.solutions.face_mesh.FaceMesh(
      static_image_mode=False, max_num_faces=3,
      refine_landmarks=True, min_detection_confidence=0.5)
  ```
- CTA region input comes from criterion 07 (`cta.cta_positioning`) result passed as a request parameter; no separate model needed for that stage.

### Next.js component

**Filename**: `FacesGazeDirectionCard.tsx`
**Location**: `ui/src/components/application/ad-scoring/FacesGazeDirectionCard.tsx`

```typescript
interface FacesGazeDirectionCardProps {
  slug: "faces.gaze_direction";
  gazeDirection: "toward_cta" | "away_from_cta" | "camera" | "unknown" | null;
  gazeTowardCta: boolean | null;
  gazeAlignmentScore: number | null;   // -1 to 1
  gazeHRatio: number | null;           // 0–1
  gazeVRatio: number | null;           // 0–1
  ctaGridCell: string | null;          // e.g. "bot-right"
  ctaPositionAssumed: boolean;
  nullWithReason?: string;
}
```

Render a 3×3 grid SVG overlay: CTA cell highlighted blue, face position dot, directional arrow from face toward gaze direction. Colour arrow green if `gazeTowardCta`, red if false. Show tier badge `TOWARD CTA` / `CAMERA` / `AWAY FROM CTA`. Display `gazeAlignmentScore` as a horizontal bar from -1 to +1.

### Failure mode

```json
{
  "slug": "faces.gaze_direction",
  "gaze_direction": null,
  "gaze_toward_cta": null,
  "gaze_alignment_score": null,
  "null_with_reason": "no_face_detected"
}
```

Other valid `null_with_reason` values: `"iris_occluded_sunglasses"`, `"face_too_small_under_5pct_frame"`, `"profile_face_beyond_45_deg_yaw"`, `"asset_has_no_human_face"`, `"decoding_error"`.
