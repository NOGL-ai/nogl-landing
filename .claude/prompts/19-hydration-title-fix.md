# Fix empty document.title on several RSC pages (hydration mismatch)

## Goal

Several pages show an empty `<title>` tag during testing (e.g. `/en/companies`, `/en/companies/calumet-de/*`, `/en/demand`, `/en/marketing-assets`). The browser tab shows the URL as fallback, and external share previews (when someone shares a link) don't show a meaningful title.

This is a low-priority polish fix — a 2-4 hour task, not a feature.

## Root cause

These pages are React Server Components in the Next.js App Router, and they either:
1. **Don't export a `metadata` object** at all → Next falls back to the root layout's default metadata, which is often empty or "NOGL" only
2. **Export metadata dynamically** via `generateMetadata(...)` but the function silently fails (e.g. `await getCompany()` errors are caught without logging) → Next falls back to default
3. Export static metadata but it's overridden by a parent layout's generateMetadata

## Fix strategy

### Pass 1 — Audit every page

Run this to find RSC pages missing metadata:

```bash
# Find every page.tsx under src/app/(site)/[lang]/(app)/
find src/app/\(site\)/\[lang\]/\(app\) -name 'page.tsx' -exec grep -L 'export.*metadata\|generateMetadata' {} \;
```

For each result, add a proper metadata export.

### Pass 2 — Fix known culprits

Based on testing, these pages need metadata fixes:

| Route | Current | Expected |
|---|---|---|
| `/en/companies` | `""` | `"Competitor Explorer | NOGL"` |
| `/en/companies/[slug]` | `""` | `"{companyName} — Competitor Analysis | NOGL"` (dynamic via generateMetadata) |
| `/en/companies/[slug]/pricing` | `""` | `"{companyName} Pricing | NOGL"` |
| `/en/companies/[slug]/products` | `""` | `"{companyName} Products | NOGL"` |
| `/en/companies/[slug]/events` | `""` | `"{companyName} Events | NOGL"` |
| `/en/companies/[slug]/assets` | `""` | `"{companyName} Assets | NOGL"` |
| `/en/companies/[slug]/pivot` | `""` | `"{companyName} Pivot Analysis | NOGL"` |
| `/en/trends` | `""` | `"Trends | NOGL"` |
| `/en/marketing-assets` | `""` | `"Marketing Asset Library | NOGL"` |
| `/en/analytics/dashboards` | `""` | `"Analytics Dashboards | NOGL"` (+ dynamic per-board) |

### Pattern for static metadata

```tsx
// src/app/(site)/[lang]/(app)/companies/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Explorer | NOGL',
  description: 'Track and analyze competitor catalogs, pricing, and marketing strategies.',
};

export default async function CompaniesPage() { /* ... */ }
```

### Pattern for dynamic metadata

```tsx
// src/app/(site)/[lang]/(app)/companies/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const company = await prisma.company.findUnique({
      where: { slug },
      select: { name: true, domain: true },
    });
    if (!company) return { title: 'Not Found | NOGL' };
    return {
      title: `${company.name} — Competitor Analysis | NOGL`,
      description: `Track pricing, products, and marketing activity for ${company.domain}.`,
    };
  } catch (err) {
    console.error('[metadata] failed:', err);
    return { title: 'Competitor Analysis | NOGL' };
  }
}
```

**Key rule:** always log errors in `generateMetadata` catch blocks. Silent failures are the #1 cause of empty titles.

### Pattern for nested tab pages

When a tab route (e.g. `companies/[slug]/pricing`) has its own `generateMetadata`, Next uses it. If the tab doesn't export metadata, Next falls back to the parent `page.tsx` metadata (not the layout). So each tab page needs its own metadata export.

## Root-layout default

Update `src/app/layout.tsx` root metadata to provide a decent fallback:

```tsx
export const metadata: Metadata = {
  title: {
    default: 'NOGL — Competitive Intelligence for Retail',
    template: '%s',  // child titles override entirely when provided
  },
  description: 'Track competitor pricing, forecast demand, automate repricing.',
  openGraph: {
    type: 'website',
    siteName: 'NOGL',
    locale: 'en_US',
    alternateLocale: 'de_DE',
  },
};
```

## OpenGraph + Twitter tags

While fixing titles, add OpenGraph for share previews:

```tsx
export const metadata: Metadata = {
  title: 'Page title',
  description: 'Page description',
  openGraph: {
    title: 'Page title | NOGL',
    description: 'Page description',
    images: [{ url: 'https://nogl.ai/og-image.png', width: 1200, height: 630 }],
  },
};
```

One generic OG image (`public/og-image.png`) is enough for v1.

## Locale metadata

If the page uses `next-intl`, pass the locale to the `generateMetadata` title:

```tsx
const t = await getTranslations({ locale: params.lang, namespace: 'metadata' });
return { title: t('companies.title') };
```

## Acceptance criteria

- [ ] Every page under `/en/*` has either a static `metadata` export or a `generateMetadata` function
- [ ] `document.title` is non-empty on every route after full hydration
- [ ] Dynamic pages (`[slug]`) show the actual entity name, not a generic fallback
- [ ] OpenGraph tags present on all pages (title, description, type=website)
- [ ] Shared link (LinkedIn/Slack) shows readable title + description in preview
- [ ] DE locale shows German titles when applicable
- [ ] `npm run build` passes
- [ ] Playwright E2E test verifies `await page.title()` is non-empty for 20 key routes

## Out of scope

- Favicon replacement (use existing)
- Schema.org structured data (v2 — for SEO)
- Dynamic OG images (v2 — using `@vercel/og` to generate per-page images)
- Social-card screenshot-to-image pipeline (v2)

## Branch + commits

```bash
git checkout -b fix/hydration-title
```

1. `fix(metadata): add static metadata to all (app) routes`
2. `fix(metadata): add generateMetadata to dynamic [slug] routes with error logging`
3. `fix(metadata): update root layout with OG + Twitter fallbacks`
4. `test(metadata): Playwright assertion for 20 key routes`

## Reference files

- Root layout: `src/app/layout.tsx`
- Route pattern: `src/app/(site)/[lang]/(app)/companies/page.tsx` (and siblings)
- Testing pattern: `.claude/prompts/_TESTING_AND_DATA_APPROACH.md`
- Next.js metadata docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
