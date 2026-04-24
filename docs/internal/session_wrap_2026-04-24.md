# Session Wrap — 2026-04-24

**Context:** Homelab cluster redesign + ad-creative scoring platform stabilization. Demo in <7 days for early-adopter pilot clients.

## What shipped this session

### Infrastructure
- **Cluster-wide rename** — 73/73 CTs renamed (`<category>-<service>-<qualifier>` convention)
- **CT 213 hybrid resize** — 4 vCPU / 16 GB RAM / 128 GB disk + Postgres tuning (shared_buffers 4 GB, etc.)
- **CT 223 staging** — new Postgres on pve05 with schema-parity dump from prod
- **Redis 3-instance split** — queue (6379) / cache (6380) / results (6381) on CT 214
- **Ollama** — moved to `10.10.10.140` (was conflicting with Kohya at `.162`)
- **pve06 multi-WAN** — default route corrected (mobile→wired), policy routing for scraping range `10.10.10.208/28`, tinyproxy on `10.10.10.26:3129` for mobile egress
- **Koofr offsite PBS** — daily 04:00 sync of 13 CTs to Koofr EU (38 GB initial, incremental thereafter)
- **PBS jobs split** — `backup-services` (retention 7d/4w/3m) + `backup-data-tier` (retention 14d/8w/6m, includes CT 112/128/211/212/213/214/223/421)
- **Infisical centralized** — `homelab` workspace with `/network`, `/ai`, `/storage`, `/ci`, `/databases`, `/apps` folders; claude-code-readonly machine identity; CLI on 5 CTs

### Data layer
- **S3 consolidated to Garage CT 212** — 82 files migrated from VersityGW. VersityGW CT 165 stopped (7-day safety window before destroy).
- **PostgreSQL dropped**: ad_scoring on CT 213 (stale), 5 empty per-brand DBs (kuzzoi/elli/hazeandglory/app/stilnest), VACUUM reclaimed 253 MB
- **New schema designed** — 12 migration files + ARCHITECTURE.md + MIGRATION_PLAN.md + ROLLBACK.md. NOT deployed to CT 223 yet (Phase 2 pending).
- **ArangoDB retailer nodes** — 4 retailers enriched with metadata; `sold_by` edges already exist (188k total)
- **Qdrant backfilled** — 40 points (34 new + 6 existing) in `adscoring_image_embeddings`; `/similar` endpoint working

### Ad-scoring pipeline
- **27/27 metrics registered** (FashionCLIP + detector pre-stage + Grounded-SAM all landed)
- **9 metrics correctly "not_applicable" on image ads** (video + face-required metrics); clean null bucket
- **brand_ci_match WORKS** — real LAB ΔE scoring (was hardcoded fail)
- **`logo_visibility` WORKS** — Grounded-SAM (GroundingDINO + SAM2) detecting brands on real images
- **6 brand_profiles seeded**: Calumet, Foto Erhardt, Foto Leistenschneider, Fotokoch, Sony, Canon, Nikon (plus TestBrand)
- **Dynamic brand list** — loads from `brand_profiles` table at runtime, 5-min cache
- **SVG pipeline** — cairosvg rasterization for product extraction (code written, deploy pending)
- **GPU passthrough partial** — API has cv2 back (27/27 registered), worker-cpu nvidia-smi missing (incomplete)

### Cleanup
- **Destroyed**: CT 273 (OpenWebUI-CPU dead), CT 304 (vLLM idle), VM 1001 (Win11 shell)
- **Moved**: VM 1001 → pve06 (restored, awaits GPU)
- **Parked**: Airflow CT 205 + Airbyte VM 200 (both zombies, user choice)
- **Kept as load-balance backup**: CT 500 FlareSolverr + CT 501 Scrapyd (templates; HAProxy LB via CT 105 uses CT 114+502 for FlareSolverr, CT 178+503 for Scrapyd)

### UX/infra services
- **CDio LXC (CT 168)** deployed on pve05 — changedetection.io + Playwright fetcher + webhook receiver. 24 watches seeded (Calumet/Foto Erhardt/Foto Leistenschneider + Fotokoch + Sony/Canon/Nikon on homepage/sale/T&C/privacy/press). Webhook routes through mobile SIM for EU-geoblocked sites.
- **HAProxy LB** on CT 105 — load-balances FlareSolverr + Scrapyd across primary+staging
- **Glance dashboard** — status-row tiles for Graylog/Uptime Kuma/Smokeping/CheckMK/Pulse (4/5 green, Graylog needs lb_recognition for healthcheck)
- **NetBox populated** — 7 devices + 98 VMs + 79 IPs via API seed script

### Code artifacts (written, not all deployed)
- **27-metric + FashionCLIP Dockerfile** — deployed
- **Grounded-SAM adapter + metric** — deployed
- **Dynamic brand list + SVG handler** — code written, pending rebuild
- **Production test harness** — 1756 lines, 9 suites (`tests/prod_readiness/`), never executed
- **RSS feed monitor spider** — 18 feeds (camera/photo rumors, deals, forums), never deployed
- **CDio webhook receiver + Scrapyd dispatcher** — deployed
- **New market-intel DB schema** — 12 migrations + ARCHITECTURE/MIGRATION/ROLLBACK docs
- **Text LLM trio** — Qwen2.5-7B + Gemma 3 + Llama 3.1 8B on Ollama + LiteLLM routes + LanguageTool (docker on CT 300) + 2 metric modules (cta_quality, grammar_clean) + 6 skeletons

## Critical findings worth remembering

1. **"HA Postgres" was never actually HA** — single Docker container on undersized CT. Fixed memory sizing; streaming replication still TODO.
2. **"HA Redis" was never actually HA** — zero replicas, only Proxmox CT-level HA. Now split 3 ways, replica TBD.
3. **ad_scoring DB split-brain** — prod used CT 421 local Docker Postgres; CT 213 had stale smoke-test copy. Local wins, CT 213 copy dropped.
4. **S3 split-brain** — API wrote to VersityGW, read from MinIO. Fixed via endpoint repoint + consolidation to Garage.
5. **Orphan `fashion_rag` data** — already a working market-intel stack before this session (150k products in ArangoDB, 149k vectors in Qdrant, 180k scraped_items in Postgres). User forgot. Platform is ~60% built.
6. **Many "dead" CTs weren't**: CT 500/501 are templates not clones; CT 164 cliproxyapi is CLI-for-LLMs not CLIP; CT 127 OMV never configured despite the name.

## Topology corrections (vs stale skill doc)
- CT 128 Qdrant actual IP: `10.10.10.136` (not `.128`)
- CT 161 Neo4j on pve04, IP `10.10.10.122` (doc said pve06, `.161`)
- CT 211 ArangoDB on pve04 (doc said pve06)
- CT 165 VersityGW IP: `10.10.10.180` (not `.165`)
- CT 410 nogl-backend on pve03 (doc said pve06)
- ~24 CTs are HA-managed (doc listed only 5)

## Demo path (7 days)

### D-7 to D-5 (today-ish)
1. **Verify GPU passthrough finishes** — worker needs `nvidia-smi` + docker nvidia runtime
2. **Full test harness run** — 9 suites, catch regressions
3. **Push all code to Gitea** (backup agent running)
4. **Product Trend UI skeleton** — tab on `/[lang]/trends`, real ArangoDB data + mocks for gaps (agent launched)

### D-5 to D-3
1. Upload portal polish — security fix (`NEXT_PUBLIC_AD_SCORING_API_KEY` → server proxy); brand selector; campaign meta fields
2. Real brand → real asset demo: upload Calumet ad → get 27-metric report → share link
3. Brand onboarding flow extension in `/[lang]/onboarding`

### D-3 to D-0
1. Client-facing walk-through prep
2. Backfill copy/screenshots for demo assets
3. Alert pipeline (competitor ad → email) wired — currently in flight

## Defer past demo
- Phase 2 projection workers (fashion_rag → new schema)
- Video ad support
- RSS feed deployment
- LibreTranslate integration
- Unknown CT cleanup (stalwart/netbox beyond basic setup)
- Monitoring consolidation
- CT 165 VersityGW destruction (7-day window)
- Brand isolation RLS policies
- Infisical CLI on remaining CTs

## Open security items
- **Omada password**: rotated by user, old `11Feb1996$$$` in Infisical as placeholder. Update when user provides new value.
- **Hostinger SMTP password**: `11Feb1996@@@` exposed in chat, rotation recommended after alert pipeline verified.
- **Garage access key**: `GK69a15a37e1040d857342819e` printed in earlier tool output. Rotate after VersityGW 7-day safety window.
- **NetBox API token**: ephemeral V2 token used for seeding, rotate now.

## Agents running at session wrap (9)
1. GPU destroy CT 127/164 + skill doc regen + GPU rebuild retry
2. Alert pipeline (Stalwart + marketing.competitor_ads + listener on CT 409)
3. Product Trend UI agent (tab on /trends + API route)
4. Competitor research (15+ ad-scoring platforms, metric comparison)
5. UI patterns research (dashboard mockups for 27-metric display)
6. Gitea backup retry (unshallow + separate mirror for ad-creative-scorer)
7. PBS job + CT 212 add + Hostinger research + Gitea unshallow (3-in-1)

## Pilot client status
- Early adopters / pilot clients waiting
- Hard demo deadline: <7 days from 2026-04-24
- Doc audience: internal only

## Next session start priorities
1. Verify GPU rebuild fully landed
2. Run production test harness against live pipeline
3. Resume Product Trend UI work + push to Gitea
4. Alert pipeline end-to-end test
5. Brand onboarding extension in nogl-landing
6. Pick demo assets + screenshots
