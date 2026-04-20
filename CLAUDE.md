# CLAUDE.md — nogl-landing

## Project Overview
Next.js 14+ landing/app for NOGL AI. TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Stripe payments, Mapbox.

## Build & Dev Commands
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run test         # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run check-lint   # ESLint check
npm run fix-lint     # Auto-fix lint issues
npm run fix-format   # Prettier format
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio
```

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL via Prisma ORM
- **Payments**: Stripe
- **Maps**: Mapbox GL JS
- **Testing**: Jest (unit) + Playwright (E2E)
- **Deployment**: Vercel

## Code Conventions
- Components in `src/components/` — use shadcn/ui patterns
- Pages/routes in `src/app/` — App Router conventions
- Server actions in `src/app/actions/`
- Database queries via Prisma client only — never raw SQL
- Tailwind for all styling — no inline styles, no CSS modules
- All colors/tokens via CSS variables — no hardcoded hex values
- Theme-aware: support light/dark mode via `dark:` variants

## Key Directories
```
src/
  app/         # Next.js App Router pages & layouts
  components/  # Reusable UI components
  lib/         # Utilities, Prisma client, helpers
  hooks/       # Custom React hooks
prisma/        # Schema and migrations
public/        # Static assets
tests/         # Playwright E2E tests
```

## Testing
- Run `npm run test` before committing unit-testable changes
- Run `npm run typecheck` — CI will fail on type errors
- E2E tests require a running dev server: `npm run dev` then `npm run test:e2e`

## 🚨 Hard Rules — Data Safety (NEVER violate)

These rules exist because they've been violated and cost real data. Every future Claude session MUST follow them.

### DB schema operations

1. **NEVER run `prisma db push --accept-data-loss`** without a full pre-flight check:
   - `git status` shows the branch you expect
   - `git diff origin/main..HEAD -- prisma/schema.prisma` — inspect what's about to change
   - Count rows in columns the push would drop: `SELECT COUNT(*) FROM <table> WHERE <col> IS NOT NULL`
   - If ANY count > 0, **STOP and ask the user**. Data-loss warnings in Prisma's output are not suggestions; treat every "About to drop X rows" as a full stop.
   - Record of prior incident: 2026-04-19 — `feature/tracked-competitors` had a stale schema missing `products.company_id`, and `db push --accept-data-loss` silently dropped 171,738 non-null values. Recovery took ~30 min by restoring columns with raw SQL + backfilling from `product_url` hostname → `Company.domain` matching.

2. **For surgical additions (adding a new table), PREFER raw SQL over `prisma db push`:**
   ```sql
   CREATE TABLE IF NOT EXISTS <schema>."<Model>" (...);
   CREATE UNIQUE INDEX IF NOT EXISTS ...;
   ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ... ON DELETE CASCADE;
   ```
   Then update `schema.prisma` to match and run `npx prisma generate` to refresh the client. This path has zero risk of column drops.

3. **Always `git checkout <target-branch>` before schema operations.** If the branch's schema doesn't match the current live DB, `db push` will try to reconcile — which often means dropping something.

4. **Before merging a feature branch to main, verify schema compatibility:**
   ```bash
   git diff origin/main..feature-branch -- prisma/schema.prisma
   # Look for deleted lines on existing models — those will drop columns on merge.
   ```

5. **Never add `--force` or `--skip-seed` or `--accept-data-loss` to automation scripts (CI, cron, deploy).** These flags exist for deliberate, one-off operator use only. A CI job that drops production data is a career-ending incident.

### Backups before destructive ops

6. Before ANY schema migration or destructive SQL, create a snapshot:
   ```bash
   pg_dump $DATABASE_URL -Fc -f /tmp/pre-migration-$(date +%s).dump
   ```
   Keep for at least 24 hours. For TimescaleDB / continuous aggregates, use `pg_dump --no-synchronized-snapshots`.

### Cross-branch file operations

7. **When cherry-picking files between branches, only pick NEW files** (added on the source branch). Never cherry-pick a file that exists on both — you'll silently inherit the source branch's version of every adjacent change, including schema drops.

8. **Schema deltas are high-risk cherry-pick material.** Always prefer:
   - Appending new models + enums to the current schema manually
   - Re-declaring relations on existing models using `model X { ... }` block edits rather than full-file replacement

### Seed scripts

9. **Seed scripts are idempotent. Always.** Use `upsert` with a unique key, never `create`. A seed that can run twice without duplicating rows can also run safely in CI and in production demo environments.

10. **Seed scripts should match live DB slug/id conventions.** Before shipping, run `SELECT slug FROM "Company" LIMIT 10` and make sure your `DEFAULT_*_SLUGS` array matches. Prior incident: seed expected `foto-erhardt` but DB had `foto-erhardt-de`.

### What triggered these rules

- 2026-04-19 — feature branch with stale schema caused 171k-row data loss on `products.company_id`. Full recovery via raw ALTER TABLE + URL-domain backfill. Forecast + repricing schemas survived because they were in separate Postgres schemas (`forecast`, `repricing`) not in the dropping branch's `schemas = [...]` array — that's the only thing that prevented a bigger outage.

## 🚦 Multi-session coordination

Multiple Claude Code sessions work in parallel (via worktrees + feature branches). Rules to prevent conflicts:

1. **One feature = one branch = one session.** Don't spawn two sessions on the same feature branch.
2. **Before pulling a parallel session's branch to nogl-dev CT 504**, diff against the branch that's currently deployed there. Especially check `prisma/schema.prisma` — see rules 4, 7, 8 above.
3. **Branch protection on `main`** should require: `test` passing, `Vercel` passing (Vercel GitHub app auto-deploys), code review approval. Never force-push to `main`.
4. **The `.claude/prompts/` directory is the canonical source** for feature specs. If a session implements a prompt, that session is the owner until merge. Don't start a second session on the same prompt.

## Production URLs

- Dev server (CT 504): `http://10.10.10.182:3000` (internal), `https://scripts-helps-nest-ind.trycloudflare.com` (public tunnel, may rotate)
- Postgres: `10.10.10.213:5432/nogl_landing` (schemas: `nogl`, `public`, `forecast`)
- Redis: `10.10.10.214:6379`
- Calumet tenant ID: `cmnw4qqo10000ltccgauemneu`

## Prompts directory

Feature specifications for new Claude Code sessions live in `.claude/prompts/`. Read `_TESTING_AND_DATA_APPROACH.md` before implementing any prompt. The `.claude/research/` directory has background context for each prompt.

## Claude Code Toolkit
This project uses the [awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit).

Available slash commands (in `.claude/commands/`):
- `/git/*` — git workflows (commit, PR, release)
- `/documentation/*` — update-codemap, onboard
- `/testing/*` — test generation and coverage
- `/security/*` — security audit
- `/architecture/*` — architecture review
- `/refactoring/*` — refactoring helpers
- `/devops/*` — CI/CD and deployment

Agents in `.claude/agents/` cover: code review, testing, infrastructure, data/AI, and more.
