---
name: homelab
description: >
  Access, inspect, and operate the homelab LAN (10.10.10.0/24) — smoke-test all
  services, SSH into Proxmox nodes, exec into LXC containers, query Qdrant /
  Redis / PostgreSQL / ArangoDB / Scrapyd / Garage S3 / NuExtract / FlareSolverr
  / Celery. Use this skill whenever the user mentions homelab, a homelab service
  by name, a 10.10.10.x address, Proxmox, LXC containers (pct), Scrapyd spiders,
  scraping infrastructure, or asks to check / ping / restart / deploy anything
  on the internal cluster. Also trigger when the user says things like "can you
  check redis", "deploy the spider", "is qdrant up", "run a query on fashion_rag",
  or "ssh into pve01/pve06".
---

# Homelab Skill

## Topology at a glance

| Service | LAN IP | Port | Auth | Proxmox node | CT | CT Name |
|---|---|---|---|---|---|---|
| Redis | 10.10.10.214 | 6379 | REDIS_URL env | pve04 (10.10.10.24) | 214 | data-redis |
| PostgreSQL | 10.10.10.213 | 5432 | DATABASE_URL env | pve04 | 213 | data-postgresql |
| Scrapyd (primary) | 10.10.10.178 | 6800 | HTTP Basic deploy:SCRAPYD_PASSWORD | pve04 (10.10.10.24) | 178 | svc-scrapyd-178 |
| Scrapyd (clone) | — | 6800 | same | pve02 (10.10.10.22) | 503 | scrapyd-02 |
| ArangoDB | 10.10.10.211 | 8529 | ARANGO_* env | pve06 (10.10.10.26) | 211 | data-arangodb |
| Qdrant | 10.10.10.136 | 6333 | none | pve02 (10.10.10.22) | 128 | qdrant |
| NuExtract (GPU) | NUEXTRACT_BASE_URL | — | env | pve01 (10.10.10.21) | 303 | svc-nuextract-gpu-303 |
| llama-server | — | — | env | pve01 | 274 | ai-llamacpp |
| FlareSolverr (primary) | FLARESOLVERR_URL | 8191 | none | pve06 | 114 | svc-flaresolverr-114 |
| FlareSolverr (clone) | — | 8191 | none | pve02 | 502 | scrap-flaresolver-02 |
| Celery + Flower | — | — | — | pve06 | 409 | celery-flower-409 |
| Garage S3 | — | — | GARAGE_* env | pve06 | 100 | garage |
| Crawlab | — | — | — | pve02 | 404 | svc-crawlab |
| Firecrawl | — | — | — | pve05 (10.10.10.25) | 210 | firecrawl |
| LiteLLM | — | — | — | pve04 | 108 | svc-litellm-108 |
| Airflow | — | — | — | pve05 | 205 | svc-airflow-205 |
| MLflow | — | — | — | pve05 | 206 | svc-mlflow-vm-206 |
| Gitea | 10.10.10.171 | 3000 | SSH gitea-homelab | **pve03** (HA migrated from pve04) | 171 | devops-gitea |
| Cloudflared tunnel | — | — | — | pve05 | 107 | svc-cloudflared-107 |
| nogl-dev (Next.js) | 10.10.10.182 | 3000 | ssh nogl-dev | pve02 | 504 | nogl-dev |

**Critical rule:** `pct exec <vmid>` must run on the Proxmox node that *owns* that CT.
Wrong node → "CT not found". Always SSH to the correct node first (see table above).

---

## Full container inventory by node

### pve01 (10.10.10.21) — GPU/AI workloads
| VMID | Name | Type |
|---|---|---|
| 147 | monitoring-web-check | CT |
| 154 | comfyui | CT |
| 271 | ai-jupyter | CT |
| 274 | ai-llamacpp | CT |
| 300 | svc-ollama-gpu-300 | CT |
| 303 | svc-nuextract-gpu-303 | CT |
| 304 | svc-vllm-gpu-304 | CT |
| 167 | docker | VM |
| 200 | vm-airbyte-staging-200 | VM |
| 320 | svc-openclaw-320 | VM |
| 401 | app-chatwoot-staging | VM |
| 402 | n8n-prod | VM |
| 451 | apps-nogl-app (prod) | VM |

### pve02 (10.10.10.22) — scraping / AI services
| VMID | Name |
|---|---|
| 120 | checkmate |
| 127 | omv |
| 128 | qdrant |
| 152 | termix |
| 156 | coolify |
| 157 | flowiseai |
| 164 | cliproxyapi |
| 165 | versitygw |
| 166 | revealjs |
| 305 | svc-vllm-qwen25vl-305 |
| 400 | omni-crawler |
| 404 | svc-crawlab |
| 421 | ad-scoring-api |
| 502 | scrap-flaresolver-02 |
| 503 | scrapyd-02 |
| **504** | **nogl-dev** ← Next.js dev CT |
| **505** | **nogl-workers** ← Docker worker CT (BullMQ workers) |

### pve03 (10.10.10.23) — HA failover node (received pve04 CTs)
> ⚠️ pve04 went down ~2026-04-21. HA migrated all 5 CTs to pve03. pve04 nodes listed below now live on pve03.

| VMID | Name |
|---|---|
| 108 | svc-litellm-108 |
| **171** | **devops-gitea** ← Gitea CI at 10.10.10.171:3000 |
| 178 | svc-scrapyd-178 |
| 213 | data-postgresql |
| 214 | data-redis |

### pve04 (10.10.10.24) — ⚠️ DOWN (all CTs migrated to pve03)

### pve05 (10.10.10.25) — homelab services / monitoring
| VMID | Name |
|---|---|
| 104 | svc-homepage-104 |
| 105 | svc-npmplus-105 |
| 106 | svc-homeassistant-106 |
| **107** | **svc-cloudflared-107** ← Cloudflare tunnel |
| 109 | svc-ghost-109 |
| 116 | svc-pulse-116 |
| 117 | svc-goaway-117 |
| 118 | svc-homebox-118 |
| 119 | svc-fluid-calendar-119 |
| 144 | monitoring-checkmk |
| 145 | monitoring-pialert |
| 146 | monitoring-graylog |
| 148 | monitoring-smokeping |
| 149 | monitoring-uptimekuma |
| 153 | wealthfolio |
| 160 | adguard |
| 175 | devops-pve-datacenter-manager |
| 176 | devops-komodo |
| 205 | svc-airflow-205 |
| 206 | svc-mlflow-vm-206 |
| 210 | firecrawl |
| 212 | data-garage |
| 240 | apps-snipeit |
| 241 | apps-glance |
| 243 | apps-revealjs |

### pve06 (10.10.10.26) — scraping / data science
| VMID | Name |
|---|---|
| 100 | garage |
| 110 | core-netbox |
| 112 | core-infisical |
| 113 | svc-changedetection-113 |
| 114 | svc-flaresolverr-114 |
| 115 | svc-libretranslate-115 |
| 161 | neo4j |
| 163 | changedetection |
| 172 | devops-semaphore |
| 173 | devops-cockpit |
| 174 | devops-n8n |
| 177 | devops-gitea-mirror |
| 202 | ai-openwebui-prod |
| 211 | data-arangodb |
| 215 | data-metabase |
| 242 | apps-chatwoot |
| 244 | apps-searxng |
| 273 | ai-openwebui-cpu |
| 409 | celery-flower-409 |
| 410 | apps-docker-410 |
| 430 | usertour |
| 405 | scrap-camoufox (VM) |

### pve07 (10.10.10.27) — misc
| VMID | Name |
|---|---|
| 103 | svc-pve-scripts-local |
| 159 | sonobarr |
| 700 | backup-pbs-700 (VM) |

**Critical rule:** `pct exec <vmid>` must run on the Proxmox node that *owns* that CT.
Wrong node → "CT not found". Always SSH to the correct node first (see table above).

---

## SSH access (passwordless — key-based)

The SSH config at `~/.ssh/config` (or Windows equivalent) should have entries for
pve01/pve02/pve06 so you can connect without typing passwords or IPs.

```bash
# ~/.ssh/config entries (already configured — no password needed)
# Host pve01  → ssh root@10.10.10.21
# Host pve02  → ssh root@10.10.10.22
# Host pve03  → ssh root@10.10.10.23
# Host pve04  → ssh root@10.10.10.24
# Host pve05  → ssh root@10.10.10.25
# Host pve06  → ssh root@10.10.10.26
# Host pve07  → ssh root@10.10.10.27
# Host nogl-dev → ssh root@10.10.10.182
```

If the user asks to set up passwordless SSH, see references/ssh-setup.md.

### Exec into a container

Always pick the right node from the topology table, then:

```bash
ssh root@10.10.10.21 "pct exec 214 -- bash -c 'redis-cli ping'"
ssh root@10.10.10.26 "pct exec 178 -- bash -c 'scrapyd-deploy --list-targets'"
ssh root@10.10.10.22 "pct exec 128 -- bash"   # interactive shell in Qdrant CT
```

---

## Smoke test — check all services at once

Run from the user's machine (requires LAN or Tailscale route):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Load env (adjust path if needed)
ENV_FILE="src/python/src/.env"
[ -f "$ENV_FILE" ] && set -a && source "$ENV_FILE" && set +a

echo "=== Qdrant ==="
curl -sf http://10.10.10.136:6333/healthz && echo " OK" || echo " FAIL"

echo "=== Scrapyd ==="
CODE=$(curl -so /dev/null -w '%{http_code}' -u "deploy:${SCRAPYD_PASSWORD:-}" http://10.10.10.178:6800/daemonstatus.json)
[ "$CODE" = "200" ] && echo " OK ($CODE)" || echo " FAIL ($CODE)"

echo "=== Redis ==="
redis-cli -u "${REDIS_URL:-redis://10.10.10.214:6379}" PING || echo " FAIL"

echo "=== ArangoDB ==="
curl -sf -u "root:${ARANGO_PASSWORD:-}" http://10.10.10.211:8529/_api/version | python3 -c "import sys,json; d=json.load(sys.stdin); print(' OK', d['version'])" || echo " FAIL"

echo "=== Postgres ==="
psql "${DATABASE_URL:-}" -c "SELECT 1" -q -t 2>&1 | grep -q 1 && echo " OK" || echo " FAIL"

echo "=== FlareSolverr ==="
curl -sf "${FLARESOLVERR_URL:-http://10.10.10.26:8191}/health" && echo " OK" || echo " FAIL"

echo "=== NuExtract ==="
curl -sf "${NUEXTRACT_BASE_URL:-http://10.10.10.21:8080}/health" && echo " OK" || echo " FAIL"

echo "=== Garage S3 ==="
curl -sf http://10.10.10.212:3900/health && echo " OK" || echo " FAIL"
```

For full preflight (all services including Proxmox SSH):
```bash
cd src/python/src && poetry run python scripts/check_homelab_services.py
```

---

## Redis

```bash
# Ping
redis-cli -u "$REDIS_URL" PING

# Keys matching pattern
redis-cli -u "$REDIS_URL" KEYS "product:*"

# Info (memory, clients, etc.)
redis-cli -u "$REDIS_URL" INFO memory

# Flush a specific DB (dangerous — confirm with user first)
redis-cli -u "$REDIS_URL" -n 1 FLUSHDB

# Monitor live commands
redis-cli -u "$REDIS_URL" MONITOR
```

---

## Qdrant

No auth required. Base URL: `http://10.10.10.136:6333`

```bash
# List collections
curl -s http://10.10.10.136:6333/collections | python3 -m json.tool

# Collection info (point count, vector config)
curl -s http://10.10.10.136:6333/collections/<name> | python3 -m json.tool

# Count points in a collection
curl -s -X POST http://10.10.10.136:6333/collections/<name>/points/count \
  -H 'Content-Type: application/json' \
  -d '{"exact":true}' | python3 -m json.tool

# Scroll first 10 points
curl -s -X POST http://10.10.10.136:6333/collections/<name>/points/scroll \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"with_payload":true}' | python3 -m json.tool

# Semantic search (replace vector with actual embedding)
curl -s -X POST http://10.10.10.136:6333/collections/<name>/points/search \
  -H 'Content-Type: application/json' \
  -d '{"vector":[...],"limit":5,"with_payload":true}' | python3 -m json.tool
```

---

## PostgreSQL

Databases: `fashion_rag` (scraper data — read-only from app), `nogl_landing` (main app), `gitea`.

```bash
# Connect to fashion_rag
psql "$DATABASE_URL"

# List databases
psql "$DATABASE_URL" -c "\l"

# List tables in fashion_rag
psql "$DATABASE_URL" -c "\dt" fashion_rag

# Run a query
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM products;" fashion_rag

# Describe a table
psql "$DATABASE_URL" -c "\d products" fashion_rag

# Dump slow queries (requires pg_stat_statements)
psql "$DATABASE_URL" -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

**IMPORTANT:** `fashion_rag` is **read-only** from the app side. Never run INSERT/UPDATE/DELETE against it — that is Scrapy's write domain.

---

## Scrapyd — spider deploy & management

Primary: `http://10.10.10.178:6800`  
All requests need `-u "deploy:$SCRAPYD_PASSWORD"`. A 401 without auth is expected and correct.

```bash
# Status
curl -s -u "deploy:$SCRAPYD_PASSWORD" http://10.10.10.178:6800/daemonstatus.json

# List projects
curl -s -u "deploy:$SCRAPYD_PASSWORD" http://10.10.10.178:6800/listprojects.json

# List spiders in a project
curl -s -u "deploy:$SCRAPYD_PASSWORD" \
  "http://10.10.10.178:6800/listspiders.json?project=fashion"

# Schedule a spider
curl -s -u "deploy:$SCRAPYD_PASSWORD" \
  -d "project=fashion&spider=product_spider&setting=CLOSESPIDER_ITEMCOUNT=100" \
  http://10.10.10.178:6800/schedule.json

# List running jobs
curl -s -u "deploy:$SCRAPYD_PASSWORD" \
  "http://10.10.10.178:6800/listjobs.json?project=fashion" | python3 -m json.tool

# Fetch spider log (replace JOB_ID)
curl -s -u "deploy:$SCRAPYD_PASSWORD" \
  "http://10.10.10.178:6800/logs/fashion/product_spider/JOB_ID.log" | tail -50

# Cancel a running job
curl -s -u "deploy:$SCRAPYD_PASSWORD" \
  -d "project=fashion&job=JOB_ID" \
  http://10.10.10.178:6800/cancel.json

# Deploy egg (from poetry project root src/python/src/)
cd src/python/src && scrapyd-deploy homelab -p fashion
```

---

## ArangoDB

```bash
# List databases
curl -s -u "root:$ARANGO_PASSWORD" http://10.10.10.211:8529/_api/database \
  | python3 -m json.tool

# List collections in a DB
curl -s -u "root:$ARANGO_PASSWORD" \
  "http://10.10.10.211:8529/_db/fashion/_api/collection" | python3 -m json.tool

# Count documents in a collection
curl -s -u "root:$ARANGO_PASSWORD" \
  "http://10.10.10.211:8529/_db/fashion/_api/collection/products/count" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['count'])"

# Run AQL query
curl -s -u "root:$ARANGO_PASSWORD" \
  -X POST "http://10.10.10.211:8529/_db/fashion/_api/cursor" \
  -H 'Content-Type: application/json' \
  -d '{"query":"FOR p IN products LIMIT 5 RETURN p","count":true}' \
  | python3 -m json.tool
```

---

## NuExtract / llama-server

Structured extraction from scraped text. URL from `NUEXTRACT_BASE_URL` env.

```bash
# Health
curl -sf "$NUEXTRACT_BASE_URL/health"

# Extract (OpenAI-compatible /v1/completions or /v1/chat/completions)
curl -s "$NUEXTRACT_BASE_URL/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{"model":"nuextract","messages":[{"role":"user","content":"Extract: ..."}]}'
```

---

## FlareSolverr

Bypass Cloudflare challenges. URL from `FLARESOLVERR_URL` env (port 8191).

```bash
# Health
curl -sf "${FLARESOLVERR_URL}/health"

# Solve a URL
curl -s -X POST "${FLARESOLVERR_URL}/v1" \
  -H 'Content-Type: application/json' \
  -d '{"cmd":"request.get","url":"https://target.com","maxTimeout":60000}' \
  | python3 -m json.tool
```

---

## Celery + Flower (CT 409, pve06)

```bash
# Inspect active tasks via Flower API
curl -s http://10.10.10.26:5555/api/tasks | python3 -m json.tool   # adjust port if different

# Shell into CT to run celery inspect
ssh root@10.10.10.26 "pct exec 409 -- celery -A tasks inspect active"

# Purge queues (confirm with user first)
ssh root@10.10.10.26 "pct exec 409 -- celery -A tasks purge -f"
```

---

## Garage S3

```bash
# List buckets
curl -s http://10.10.10.212:3900/ \
  -H "Authorization: AWS4-HMAC-SHA256 ..."   # use aws CLI with custom endpoint instead:
AWS_ACCESS_KEY_ID="$GARAGE_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$GARAGE_SECRET_KEY" \
aws s3 ls --endpoint-url http://10.10.10.212:3900

# Copy a file
AWS_ACCESS_KEY_ID="$GARAGE_ACCESS_KEY" \
AWS_SECRET_ACCESS_KEY="$GARAGE_SECRET_KEY" \
aws s3 cp myfile.json s3://mybucket/ --endpoint-url http://10.10.10.212:3900
```

---

## Proxmox — CT management

```bash
# List all CTs on each node
ssh pve01 "pct list"   # 10.10.10.21 — GPU/AI
ssh pve02 "pct list"   # 10.10.10.22 — scraping/nogl-dev (CT 504)
ssh pve04 "pct list"   # 10.10.10.24 — data/gitea
ssh pve05 "pct list"   # 10.10.10.25 — homelab svc/cloudflared (CT 107)
ssh pve06 "pct list"   # 10.10.10.26 — scraping/arangodb
ssh pve07 "pct list"   # 10.10.10.27

# Start / stop a CT (on the correct node)
ssh root@10.10.10.26 "pct start 178"
ssh root@10.10.10.26 "pct stop 178"

# CT resource usage
ssh root@10.10.10.26 "pct exec 178 -- top -bn1 | head -20"

# CT IP address
ssh root@10.10.10.26 "pct exec 178 -- hostname -I"
```

---

## Secrets / env loading

Never hardcode credentials. Always read from environment or the `.env` file:

```bash
# Load env for shell sessions
cd src/python/src && set -a && source .env && set +a
```

Key env vars used by this skill:

| Var | Service |
|---|---|
| `REDIS_URL` | Redis (includes password) |
| `DATABASE_URL` | PostgreSQL |
| `SCRAPYD_PASSWORD` | Scrapyd HTTP Basic |
| `SCRAPYD_CT503_URL` | Scrapyd clone override |
| `ARANGO_PASSWORD` | ArangoDB root password |
| `NUEXTRACT_BASE_URL` | NuExtract/llama-server |
| `FLARESOLVERR_URL` | FlareSolverr |
| `GARAGE_ACCESS_KEY` / `GARAGE_SECRET_KEY` | Garage S3 |

---

## Common mistakes to avoid

- Running `pct exec 178` on pve01 — CT 178 lives on **pve06**. Always check the topology table.
- Curling Scrapyd without `-u deploy:$SCRAPYD_PASSWORD` — 401 is expected; add auth.
- Writing to `fashion_rag` from Next.js or scripts — it is Scrapy's write domain, read-only from app side.
- Using `process.env.ENABLE_*` directly — always go through `FEATURES` in `featureFlags.ts`.
- CT 171 (Gitea) — **use `ssh pve03`** not `ssh pve04` after the HA migration. pve04 is down.
- **ARP conflict**: CT 156 (Coolify, IP 10.10.10.156 via DHCP) can sometimes get 10.10.10.171 assigned by DHCP, conflicting with Gitea CT 171's static IP. If CT 505 can't reach Gitea on port 3000, run: `ssh pve02 "pct exec 505 -- bash -c 'ip neigh del 10.10.10.171 dev eth0; ip neigh add 10.10.10.171 lladdr bc:24:11:75:60:ae dev eth0'"`. The persistent fix is at `/etc/network/if-up.d/static-arp-gitea` on CT 505.
- **Gitea secrets**: `GITEA_TOKEN` is a **reserved name** in Gitea Actions — use `NOGL_REGISTRY_TOKEN` instead.
- **Gitea CLI on CT 171**: run as the `gitea` user: `pct exec 171 -- bash -c 'GITEA_WORK_DIR=/var/lib/gitea su gitea -s /bin/bash -c "gitea <cmd> --config /etc/gitea/app.ini"'`

---

## nogl-dev — dev CT (CT 504, pve02)

The primary development container for the nogl-landing Next.js app.

| Item | Value |
|---|---|
| IP | `10.10.10.182` |
| SSH | `ssh nogl-dev` (passwordless, key-based) |
| Project path | `/root/nogl-landing` |
| Dev server | `npm run dev` → http://10.10.10.182:3000 |
| Dev server log | `/tmp/dev.log` |
| Node.js | v22.22.2 |
| GPU | RTX 3060 (CUDA 12.4, driver 550.163.01) via bind-mount |

### Git remotes on nogl-dev

```
gitea   git@gitea-homelab:nogladmin/nogl-landing.git   (LAN — fast)
origin  https://github.com/NOGL-ai/nogl-landing.git    (GitHub)
```

### Push workflow

```bash
# Push to BOTH Gitea and GitHub in one command:
git pushall

# Which is an alias for:
git push gitea main && git push origin main
```

Pushing to `gitea main` triggers `.gitea/workflows/deploy.yml` which:
1. SSHes into `10.10.10.182`
2. `git reset --hard gitea/main`
3. `npm ci --prefer-offline`
4. Restarts the dev server
5. Health-checks `/api/health`

### Dev server management

```bash
# Start (detached)
ssh nogl-dev "cd /root/nogl-landing && pkill -f 'next dev' 2>/dev/null; nohup npm run dev > /tmp/dev.log 2>&1 &"

# Watch logs
ssh nogl-dev "tail -f /tmp/dev.log"

# Stop
ssh nogl-dev "pkill -f 'next dev'"

# Check if running
ssh nogl-dev "curl -sf http://localhost:3000/api/health"
```

### Sync .env files from dev machine to nogl-dev

```bash
# From the project root on the dev machine:
scp .env .env.local nogl-dev:/root/nogl-landing/
```

### nogl-dev SSH key (for Gitea + GitHub)

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHFVc1v4r3XNAzACWL9/ITVgdt7jkpM3X6ZslTeq5HSz nogl-dev@homelab
```

Add to:
- Gitea: http://10.10.10.171:3000/user/settings/keys
- GitHub: https://github.com/settings/ssh/new

---

## Quick-reference one-liners

```bash
# All-in-one connectivity check
curl -sf http://10.10.10.136:6333/healthz && echo "Qdrant OK"
redis-cli -u "$REDIS_URL" PING
curl -s -u "deploy:$SCRAPYD_PASSWORD" http://10.10.10.178:6800/daemonstatus.json | python3 -m json.tool
curl -sf -u "root:$ARANGO_PASSWORD" http://10.10.10.211:8529/_api/version
ssh root@10.10.10.21 "pct list"
ssh root@10.10.10.22 "pct list"
ssh root@10.10.10.26 "pct list"
```

For extended canonical docs see:
- `docs/infra-access-runbook.md`
- `docs/homelab-smoke-tests-and-usage.md`
- `docs/agent-known-issues-and-fixes.md`
