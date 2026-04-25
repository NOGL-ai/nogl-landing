# Competitor Research — 27 Ad Creative Scoring Criteria

Each file is a self-contained implementation brief for the lower-model implementer.
Format: competitor table · algorithm · UI pattern · FastAPI schema · Next.js component · failure modes.

---

## Tier A — Deterministic (16 criteria)

| # | File | Slug | Summary | Key dependency |
|---|------|------|---------|----------------|
| 01 | [platform_format_adaptation](01_platform_format_adaptation.md) | `platform.format_adaptation` | Aspect ratio compliance per platform | Pure arithmetic + `data/platform_specs.json` |
| 02 | [platform_text_safe_zone](02_platform_text_safe_zone.md) | `platform.text_safe_zone` | Text placement within safe zone margins | pytesseract / PaddleOCR + zone mask JSON |
| 03 | [text_text_coverage](03_text_text_coverage.md) | `text.text_coverage` | Text area % of image (Meta ≤20% guideline) | OCR bbox union / CRAFT ONNX |
| 04 | [text_readability](04_text_readability.md) | `text.readability` | WCAG 4.5:1 contrast + font size ≥16pt | wcag-contrast-ratio + Tesseract bboxes |
| 05 | [text_keyword_cta_presence](05_text_keyword_cta_presence.md) | `text.keyword_cta_presence` | CTA keyword detection (Buy/Shop/Get…) | `data/cta_keywords.json` + rapidfuzz |
| 06 | [cta_cta_presence](06_cta_cta_presence.md) | `cta.cta_presence` | Visible CTA button/emphasis (not just keyword) | Tesseract + OpenCV shape detection |
| 07 | [cta_cta_positioning](07_cta_cta_positioning.md) | `cta.cta_positioning` | CTA in platform hotspot zones | Pure geometry + `PLATFORM_ZONES` dict |
| 08 | [color_color_contrast](08_color_color_contrast.md) | `color.color_contrast` | Dominant color pair WCAG contrast ratio | K-Means (k=5) + wcag-contrast-ratio |
| 09 | [color_foreground_background_contrast](09_color_foreground_background_contrast.md) | `color.foreground_background_contrast` | Edge contrast at subject boundary | U2-Net ONNX + Canny edge ΔL* |
| 10 | [visual_negative_space](10_visual_negative_space.md) | `visual.negative_space` | Empty space ratio (too little=clutter, too much=waste) | Reuses U2-Net mask from #09 |
| 11 | [visual_main_subject_focus](11_visual_main_subject_focus.md) | `visual.main_subject_focus` | Subject occupies 20–70% of frame, not occluded | YOLOv8n ONNX + U2-Net fallback |
| 12 | [faces_face_count](12_faces_face_count.md) | `faces.face_count` | 1–2 faces at reasonable scale = optimal | MediaPipe BlazeFace ONNX |
| 13 | [motion_cuts_per_minute](13_motion_cuts_per_minute.md) | `motion.cuts_per_minute` | Edit pace (TikTok 8–15 CPM sweet spot) | PySceneDetect + FFmpeg CFR |
| 14 | [motion_loopability](14_motion_loopability.md) | `motion.loopability` | First/last frame similarity for seamless loops | MSE on 128px frames / pHash / CLIP |
| 15 | [motion_opening_intensity](15_motion_opening_intensity.md) | `motion.opening_intensity` | Optical flow magnitude in first 3 seconds | OpenCV Farneback at 128px |
| 16 | [motion_animated_elements](16_motion_animated_elements.md) | `motion.animated_elements` | Moving region area ratio per frame | RAFT ONNX / Farneback motion mask |

---

## Tier B — Probabilistic (7 criteria)

| # | File | Slug | Summary | Key dependency |
|---|------|------|---------|----------------|
| 17 | [visual_rule_of_thirds](17_visual_rule_of_thirds.md) | `visual.rule_of_thirds` | Subject/face/text centroid near power points | BlazeFace + U2-Net saliency centroid |
| 18 | [visual_symmetry_balance](18_visual_symmetry_balance.md) | `visual.symmetry_balance` | Left/right visual weight balance | Luminance + Canny + HSV weight map |
| 19 | [color_brand_ci_match](19_color_brand_ci_match.md) | `color.brand_ci_match` | Dominant palette vs brand hex colors (ΔE) | K-Means + `delta_e_76` (colormath) |
| 20 | [cta_logo_visibility](20_cta_logo_visibility.md) | `cta.logo_visibility` | Brand logo present, legible, unoccluded | YOLOv8-nano ONNX + cv2.matchTemplate |
| 21 | [text_dynamic_text_animation](21_text_dynamic_text_animation.md) | `text.dynamic_text_animation` | Text animates on-screen (kinetic/slide/fade) | CRAFT per-frame + IoU bbox tracking |
| 22 | [faces_emotion_strength](22_faces_emotion_strength.md) | `faces.emotion_strength` | Dominant face emotion + intensity [0,1] | DeepFace + RetinaFace / FER2013 |
| 23 | [faces_gaze_direction](23_faces_gaze_direction.md) | `faces.gaze_direction` | Eye gaze aligned toward CTA region | MediaPipe FaceMesh iris landmarks |

---

## Tier C — Subjective (4 criteria)

| # | File | Slug | Summary | Key dependency |
|---|------|------|---------|----------------|
| 24 | [color_emotional_color_effect](24_color_emotional_color_effect.md) | `color.emotional_color_effect` | VLM emotional tone from palette (energetic/calm/trustworthy/urgent) | K-Means rule-based + BLIP-2 VQA |
| 25 | [cta_distraction_avoidance](25_cta_distraction_avoidance.md) | `cta.distraction_avoidance` | VLM: competing elements distract from CTA | Saliency ONNX + BLIP-2/GPT-4o |
| 26 | [faces_authenticity_pose_naturalness](26_faces_authenticity_pose_naturalness.md) | `faces.authenticity_pose_naturalness` | Pose looks natural vs stock-photo-stiff | MediaPipe Pose (joint angles) + VLM |
| 27 | [platform_ugc_authenticity](27_platform_ugc_authenticity.md) | `platform.ugc_authenticity` | UGC-style vs branded-production classification | BLIP-2 / Claude Haiku + OpenCV signals |

---

## Shared model dependency map

| ONNX / library | Used by criteria |
|----------------|-----------------|
| U2-Net (`u2net.onnx`) | 09, 10, 11, 17 |
| YOLOv8n (`yolov8n.onnx`) | 11, 20 |
| MediaPipe BlazeFace | 12, 17 |
| MediaPipe FaceMesh | 23 |
| MediaPipe Pose | 26 |
| CRAFT text detector | 03, 05, 06, 21 |
| PySceneDetect + FFmpeg | 13 |
| OpenCV Farneback | 15, 16 |
| RAFT ONNX | 16 |
| BLIP-2 / VLM | 24, 25, 26, 27 |
| Tesseract / PaddleOCR | 02, 03, 04, 06 |
| DeepFace | 22 |

**Load order note:** Initialize U2-Net and YOLOv8n at startup; BlazeFace/FaceMesh/Pose on first video request; BLIP-2 only when Tier C criteria are requested (it's large).
