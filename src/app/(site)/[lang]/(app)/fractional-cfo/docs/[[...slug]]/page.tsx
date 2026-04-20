export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { source } from '@/lib/docs/source';
import { DocsPageShell } from '../_components/DocsPageShell';

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { lang, slug = [] } = await params;

  // Resolve the page from the docs source (server-only; source imports Node.js modules)
  const page = source.getPage(slug, lang);

  if (!page) {
    notFound();
  }

  // fumadocs-mdx v10: body and toc are compiled at build time by the webpack
  // loader — no async load() needed; they're synchronously available on page.data
  const MDX = page.data.body;
  const toc = (page.data.toc as Array<{ title: string; url: string; depth: number }>) ?? [];

  // Build nav pages on the server so DocsSideNav (client component) doesn't
  // import fumadocs-mdx runtime (which uses node:path and can't be client-bundled)
  const navPages = source.getPages(lang).map((p) => ({
    url: p.url,
    slugs: p.slugs,
    data: { title: p.data.title },
  }));

  return (
    <DocsPageShell
      lang={lang}
      page={page}
      toc={toc}
      navPages={navPages}
    >
      <MDX />
    </DocsPageShell>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug = [] } = await params;
  const page = source.getPage(slug, lang);

  if (!page) return {};

  return {
    title: page.data.title,
    description: (page.data as { description?: string }).description,
  };
}
