# Multimodal Advertising Performance Analytics — CTR / CQS Dataset Research

_Preserved verbatim from the founder's 2026-04 deep-research investigation. Use as context for the creative-quality-score expansion decision (see `marketing-assets-ctr-expansion-analysis.md` for my assessment)._

---

## Executive summary (founder's original)

The convergence of multimodal large language models and computational advertising has created unprecedented opportunities for predictive creative optimization. However, the development of reliable predictive architectures — specifically systems designed to calculate a Creative Quality Score (CQS) prior to programmatic bidding — requires robust, domain-specific ground truth data. The primary objective was to identify publicly available datasets containing camera and photography product advertisements paired with quantitative performance metrics (CTR, CPC, conversion rates, impressions, clicks, ROAS), prioritizing the German and broader EU digital advertising markets.

**Key finding — a fundamental data availability paradox:** while the underlying technology for multimodal CTR prediction has advanced significantly by early 2026, **a direct, un-anonymized public dataset containing specific camera product images deterministically mapped to real-world CTR and CPC metrics does not exist.** This deficit is primarily driven by:

1. Strict commercial confidentiality protocols — major ad networks and DSPs guard creative-level ROAS/CTR as proprietary competitive intelligence, the core of their algorithmic moats.
2. The Transparency and Targeting of Political Advertising (TTPA) regulation in the EU has entrenched opacity for commercial entities; transparency APIs from Google and Meta actively strip performance and engagement metrics from commercial advertisements, restricting impression and spend data exclusively to political or social-issue campaigns.

---

## Best-available proxy datasets

| Dataset | Size | CTR Range | Camera Relevance | Access |
|---|---|---|---|---|
| **AntM2C** (Alipay) | 1 B rows | 0.5%-4.2% (aggregate) | Category match (e-commerce/electronics) | [Paper](https://arxiv.org/abs/2308.16437) |
| **Criteo 1TB Click Logs** | 4.3 B rows | Binary (0/1) | Requires embedded clustering subsetting | [HF](https://huggingface.co/datasets/criteo/CriteoClickLogs) |
| **CAMERA** (CyberAgent) | 100k+ rows | Attractiveness proxy | Direct domain match (Japanese e-commerce) | [HF](https://huggingface.co/datasets/cyberagent/AdParaphrase-v2.0) |

### 1. AntM2C — Multi-Scenario Multi-Modal CTR Dataset

Released by Alipay in late 2023. Integrates raw text and image feature vectors across 5 distinct user interaction scenarios. 1 billion CTR interactions, 200M users, 6M items. Features 13 integer variables + 26 categorical hashed to 32-bit ints. **Requires k-means++ clustering (k∈[400, 800]) on image vectors to isolate the "Auto/Electronics/Other" topology** — training exclusively on the recovered electronics cluster gives approximately correct feature interactions.

### 2. Criteo 1TB Click Logs

4.3 B rows, 39 anonymized features, binary click label. The industry standard for CTR research. Camera-specific isolation requires latent-semantic recovery of the hashed categorical features via dimensionality reduction.

### 3. CAMERA (CyberAgent)

Japanese ad text + landing-page screenshots + human preference labels. Structural template for attractiveness scoring. Does NOT include real CTR — uses internal CTR prediction models (Kiwami Yosoku TD) as validation. The `AdParaphrase-v2.0` subset has human preference labeling on paired ad texts.

---

## Synthetic generation frameworks

| Generator | Base dataset | Methodology | Repo |
|---|---|---|---|
| **Bench-CTR** | Criteo / Avazu | Latent Diffusion (TabSyn) + rule-based | [NuriaNinja/Bench-CTR](https://github.com/NuriaNinja/Bench-CTR) |
| **CAIG** | E-commerce multimodal | MLLM + Reinforcement Learning | [Chenguoz/CAIG](https://github.com/Chenguoz/CAIG) |
| **ydata-synthetic** | General tabular | CTGAN, Gaussian Mixtures | [ydataai/ydata-synthetic](https://github.com/ydataai/ydata-synthetic) |
| **synthcity** | General tabular | AdsGAN, DP-GAN, Flow Models | [vanderschaarlab/synthcity](https://github.com/vanderschaarlab/synthcity) |

---

## German market baselines (2024-2026)

- EU digital ad market: €118.9 B in 2024
- DE CPM month-over-month swing: 4.96 points vs. 1.63 global — **highly reactive auction environment**
- DE baseline CTR for consumer-tech display: 0.86%-1.5%
- Video format lift over static: +20-30%
- AI-generated creatives lift on Meta: +12% CTR

---

## Proposed synthetic-ground-truth formula (founder's)

For a specific camera ad i:

```
CTR_synth(i) = CTR_base_DE × (1 + tanh(α·VQS(i) + β·TAS(i) + γ·⟨w, φ(M(i))⟩))
```

- `CTR_base_DE` = ~0.0115 (1.15% baseline)
- `VQS(i)` = Visual Quality Score (0-1, from VLM on composited ad creative)
- `TAS(i)` = Textual Attractiveness Score (0-1, from German-language transformer on ad copy)
- `M(i)` = sparse categorical metadata (brand, price tier, etc.)
- `φ` = learned dense embedding from TabSyn diffusion on Criteo electronics subset
- `tanh` bounds the variance to `±|α|+|β|+|γ|` so synthetic CTR stays physically realistic (absolute range e.g. 0.0%-3.0%)

---

## Negative results (queried and empty)

- **Google Ads Transparency Center API** — `region=DE` + "Kamera"/"photography" queries return metadata (advertiser_id, geo targeting, run dates) but strip impression volume / CTR / CPC / conversion data for commercial retail goods.
- **Meta Ad Library API** — strips engagement metrics (likes/shares/comments) from non-political commercial ads. Reach + impression data exclusively gated for political/social-issue/election ads.
- **Kaggle / Google Dataset Search** — no `camera advertising CTR dataset` match. Results return CV datasets (object detection) or NLP sentiment datasets.
- **EU Open Data Portal / Data.gov.de** — macroeconomic, healthcare, infrastructure only. No commercial ad perf.
- **German camera industry reports (PIV, BVV, ProfiFoto)** — market forecasts + hardware production volumes. No raw digital marketing perf data.
- **PapersWithCode / Figshare / Zenodo** — 3D scene data, LiDAR, IoT traces. No ad-auction intersection.

---

## Academic gold (recent papers)

- **AdTEC** (CyberAgent, NAACL 2025) — unified benchmark for evaluating search ad text quality.
- **Bench-CTR** (late 2025) — comprehensive system of evaluation protocols for real-world + synthetic datasets, standardizes LLM-based vs. traditional statistical comparison.
- **CAIG** (ACM Web Conference 2025) — MLLMs fine-tuned via Reinforcement Learning to generate ad images optimized for CTR. Exact reward-modeling logic for a CQS pipeline.
- **GenCI** (WWW 2026) — generative modeling of user intent shifts for dynamic feature interaction under seasonal trends.

## Sources

Full citations in founder's original report. Key anchors:
- [AdEx Benchmark Report](https://iabeurope.eu/wp-content/uploads/IAB-Europe_AdEx-Benchmark-2024-Report_FINAL.pdf)
- [FB Ads Germany CPM](https://www.superads.ai/facebook-ads-costs/cpm-cost-per-mille/germany)
- [Digital Applied AI Ad Benchmarks 2026](https://www.digitalapplied.com/blog/ai-ad-creative-benchmark-2026-ctr-roas-data)
- [CAIG paper](https://arxiv.org/html/2502.06823v1)
- [AdTEC paper](https://aclanthology.org/2025.naacl-long.391.pdf)
