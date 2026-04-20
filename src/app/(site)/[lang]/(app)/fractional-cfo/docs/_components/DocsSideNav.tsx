'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { cn } from '@/lib/utils';

export interface NavPage {
  url: string;
  slugs: string[];
  data: { title: string };
}

interface DocsSideNavProps {
  lang: string;
  pages: NavPage[];
}

export function DocsSideNav({ lang, pages }: DocsSideNavProps) {
  const pathname = usePathname();

  // Group pages by their folder (first slug segment)
  const grouped = new Map<string, NavPage[]>();

  for (const page of pages) {
    const folder = page.slugs.length > 1 ? page.slugs[0] : '_root';
    if (!grouped.has(folder)) grouped.set(folder, []);
    grouped.get(folder)!.push(page);
  }

  const folderLabels: Record<string, string> = {
    _root: 'Overview',
    'getting-started': 'Getting Started',
    'core-features': 'Core Features',
    'admin-integrations': 'Admin & Integrations',
    reference: 'Reference',
  };

  return (
    <nav aria-label="Documentation navigation">
      <ul className="space-y-4">
        {Array.from(grouped.entries()).map(([folder, folderPages]) => (
          <li key={folder}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {folderLabels[folder] ?? folder}
            </p>
            <ul className="space-y-1">
              {folderPages.map((page) => {
                const href = `/${lang}/fractional-cfo/docs/${page.slugs.join('/')}` as Route;
                const isActive = pathname === href;
                return (
                  <li key={page.url}>
                    <Link
                      href={href}
                      className={cn(
                        'block rounded-md px-2 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/70 hover:text-foreground hover:bg-secondary',
                      )}
                    >
                      {page.data.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
