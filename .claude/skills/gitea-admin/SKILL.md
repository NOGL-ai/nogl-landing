---
name: gitea-admin
description: >
  Programmatically administer the homelab Gitea instance — generate API tokens,
  add/update/delete CI/CD secrets, manage users, and fix registry connectivity.
  Use this skill whenever someone needs to: add a Gitea secret, create a Gitea
  token without web UI access, fix "docker login" failures to 10.10.10.171:3000,
  or manage CI pipeline credentials.
---

# Gitea Admin Skill

## Instance info

| Item | Value |
|---|---|
| URL | `http://10.10.10.171:3000` |
| Admin user | `nogladmin` |
| CT | 171 (`devops-gitea`) on **pve03** (migrated from pve04 via HA) |
| SSH access | `ssh pve03 "pct exec 171 -- bash -c '...'"` |
| Registry | `10.10.10.171:3000` (same host, Gitea built-in) |
| Version | 1.25.2 |

---

## Generate an API token (no web UI needed)

```bash
# SSH into Gitea CT and generate token as gitea user
ssh pve03 "pct exec 171 -- bash -c '
  GITEA_WORK_DIR=/var/lib/gitea su gitea -s /bin/bash -c \
  \"/usr/local/bin/gitea admin user generate-access-token \
    --username nogladmin \
    --token-name <name> \
    --scopes write:repository,write:package,read:organization,read:user \
    --raw \
    --config /etc/gitea/app.ini\"
'"
```

**Required scopes** by use case:

| Use case | Scopes needed |
|---|---|
| Add repo secrets | `write:repository,read:user` |
| Docker push to registry | `write:package,read:user` |
| CI full (secrets + docker push) | `write:repository,write:package,read:organization,read:user` |

> ⚠️ `GITEA_TOKEN` is a **reserved secret name** in Gitea Actions. Use `NOGL_REGISTRY_TOKEN` or any other name instead.

---

## Add/update a repo secret via API

```bash
GITEA_TOKEN="<token>"
REPO="nogladmin/nogl-landing"
BASE="http://10.10.10.171:3000/api/v1"

# Run from nogl-dev (CT 504) — it has direct access to port 3000
ssh nogl-dev "curl -sf -X PUT \
  -H 'Authorization: token $GITEA_TOKEN' \
  -H 'Content-Type: application/json' \
  '$BASE/repos/$REPO/actions/secrets/<SECRET_NAME>' \
  -d '{\"data\": \"<SECRET_VALUE>\"}' && echo OK"
```

## List all repo secrets

```bash
ssh nogl-dev "curl -sf \
  -H 'Authorization: token $GITEA_TOKEN' \
  '$BASE/repos/$REPO/actions/secrets' | python3 -c \"import sys,json; [print(s['name']) for s in json.load(sys.stdin)]\""
```

## Delete a secret

```bash
ssh nogl-dev "curl -sf -X DELETE \
  -H 'Authorization: token $GITEA_TOKEN' \
  '$BASE/repos/$REPO/actions/secrets/<SECRET_NAME>' && echo DELETED"
```

---

## Repo secrets currently set (nogl-landing)

| Secret name | What it is |
|---|---|
| `NOGL_DEV_SSH_KEY` | SSH private key for root@10.10.10.182 (CT 504 web deploy) |
| `NOGL_WORKERS_SSH_KEY` | SSH private key for root@10.10.10.183 (CT 505 workers deploy) |
| `NOGL_REGISTRY_TOKEN` | Gitea API token with `write:package` scope (docker push to registry) |

---

## Fix: CT 505 can't reach Gitea registry (ARP conflict)

**Root cause**: CT 156 (Coolify) uses `ip=dhcp` and sometimes gets `10.10.10.171` from DHCP, conflicting with Gitea CT 171's static `10.10.10.171`. CT 505 may learn the wrong (Coolify) MAC via ARP.

**Symptoms**: `docker login 10.10.10.171:3000` returns `connection refused` from CT 505, even though CT 504 works fine.

**Diagnosis**:
```bash
# If these show DIFFERENT MACs, you have the conflict:
ssh nogl-dev "ip neigh show 10.10.10.171"      # Should show bc:24:11:75:60:ae
ssh pve02 "pct exec 505 -- ip neigh show 10.10.10.171"  # Wrong if different
# Gitea's real MAC = bc:24:11:75:60:ae (from pct config 171 on pve03)
```

**Immediate fix**:
```bash
ssh pve02 "pct exec 505 -- bash -c '
  ip neigh del 10.10.10.171 dev eth0 2>/dev/null
  ip neigh add 10.10.10.171 lladdr bc:24:11:75:60:ae dev eth0
'"
```

**Persistent fix** (survives reboots — already applied):
```
/etc/network/if-up.d/static-arp-gitea   (on CT 505)
```

**Permanent fix** (assign Coolify a different static IP to prevent future DHCP conflicts):
```bash
# Check Coolify's current DHCP IP
ssh pve02 "pct exec 156 -- ip addr show eth0 | grep inet"
# Change Coolify to static IP (e.g. 10.10.10.156) via pct config
ssh pve02 "pct set 156 -net0 name=eth0,bridge=vmbr0,hwaddr=BC:24:11:BD:E0:68,ip=10.10.10.156/24,gw=10.10.10.1,type=veth"
```

---

## Gitea CLI reference (inside CT 171)

```bash
# Always run as gitea user with GITEA_WORK_DIR set:
ssh pve03 "pct exec 171 -- bash -c '
  GITEA_WORK_DIR=/var/lib/gitea su gitea -s /bin/bash -c \
  \"COMMAND --config /etc/gitea/app.ini\"
'"

# List users
gitea admin user list

# Change a user password
gitea admin user change-password --username nogladmin --password <new>

# List tokens for a user
gitea admin user list --user nogladmin  # tokens not shown via CLI; use API

# Delete a token by name (no direct CLI; use API DELETE /api/v1/users/{user}/tokens/{id})
```

---

## Gitea Actions runner (on CT 504)

The `act_runner` daemon runs on CT 504 (nogl-dev) and connects to Gitea to pick up CI jobs.

```bash
# Check runner status
ssh nogl-dev "systemctl status act_runner"

# Runner config
ssh nogl-dev "cat /root/act_runner/.runner"

# Labels (docker images used per ubuntu-latest / ubuntu-22.04 tags)
# ubuntu-latest → docker://node:22-bookworm

# Re-register runner (only if .runner file deleted)
ssh nogl-dev "cd /root/act_runner && ./act_runner register \
  --instance http://10.10.10.171:3000 \
  --token <registration-token> \
  --name nogl-dev-runner \
  --labels ubuntu-latest:docker://node:22-bookworm"
```

---

## Docker registry operations

The Gitea registry lives at the same host as Gitea (`10.10.10.171:3000`).

```bash
# Login (from any homelab CT with insecure registry configured)
echo "$NOGL_REGISTRY_TOKEN" | docker login 10.10.10.171:3000 -u nogladmin --password-stdin

# List images via API
ssh nogl-dev "curl -sf \
  -H 'Authorization: token $NOGL_REGISTRY_TOKEN' \
  'http://10.10.10.171:3000/api/v1/repos/nogladmin/nogl-worker-ingest/tags' \
  | python3 -c \"import sys,json; [print(t['name']) for t in json.load(sys.stdin)]\""

# Pull an image (from CT 505 after ARP is fixed)
ssh pve02 "pct exec 505 -- docker pull 10.10.10.171:3000/nogladmin/nogl-worker-ingest:latest"
```

**insecure registry daemon.json** (required on any CT that pulls from this registry):
```json
{ "insecure-registries": ["10.10.10.171:3000"] }
```
Location: `/etc/docker/daemon.json` — restart docker after change: `systemctl restart docker`
