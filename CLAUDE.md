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
