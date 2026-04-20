'use client';

import type { ReactNode } from 'react';
import { DocsSideNav } from './DocsSideNav';
import { DocsToc } from './DocsToc';
import { DocsBreadcrumbs } from './DocsBreadcrumbs';
import { DocsFeedback } from './DocsFeedback';
import { EditOnGithub } from './EditOnGithub';

interface DocsPageShellProps {
  lang: string;
  page: {
    slugs: string[];
    data: {
      title: string;
      description?: string;
    };
  };
  toc: Array<{ title: string; url: string; depth: number }>;
  children: ReactNode;
}

export function DocsPageShell({ lang, page, toc, children }: DocsPageShellProps) {
  const docPath = `fractional-cfo/docs/${page.slugs.join('/')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_200px] min-h-screen gap-0">
      {/* Left: Side Navigation */}
      <aside className="hidden lg:block border-r border-border bg-background/50">
        <div className="sticky top-16 overflow-y-auto max-h-[calc(100vh-4rem)] p-4">
          <DocsSideNav lang={lang} />
        </div>
      </aside>

      {/* Center: Content */}
      <main className="min-w-0 px-6 py-8">
        <DocsBreadcrumbs lang={lang} slugs={page.slugs} title={page.data.title} />

        <article className="prose prose-neutral dark:prose-invert max-w-none mt-4">
          {children}
        </article>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-start justify-between">
          <DocsFeedback docPath={docPath} locale={lang as 'en' | 'de'} />
          <EditOnGithub docPath={`${lang}/fractional-cfo/${page.slugs.join('/')}`} />
        </div>
      </main>

      {/* Right: Table of Contents */}
      {toc.length > 0 && (
        <aside className="hidden xl:block">
          <div className="sticky top-16 overflow-y-auto max-h-[calc(100vh-4rem)] p-4">
            <DocsToc toc={toc} />
          </div>
        </aside>
      )}
    </div>
  );
}
