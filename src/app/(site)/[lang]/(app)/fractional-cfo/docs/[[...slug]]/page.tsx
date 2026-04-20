export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { source } from '@/lib/docs/source';
import { DocsPageShell } from '../_components/DocsPageShell';

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { lang, slug = [] } = await params;

  // Resolve the page from the docs source
  const page = source.getPage(slug, lang);

  if (!page) {
    notFound();
  }

  // fumadocs-mdx v10: body and toc are compiled at build time by the webpack
  // loader — no async load() needed; they're synchronously available on page.data
  const MDX = page.data.body;
  const toc = (page.data.toc as Array<{ title: string; url: string; depth: number }>) ?? [];

  return (
    <DocsPageShell
      lang={lang}
      page={page}
      toc={toc}
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
    description: page.data.description,
  };
}
