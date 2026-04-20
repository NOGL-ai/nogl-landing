'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  title: string;
  url: string;
  depth: number;
}

interface DocsTocProps {
  toc: TocItem[];
}

export function DocsToc({ toc }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headings = toc
      .filter((item) => item.depth <= 3)
      .map((item) => item.url.replace('#', ''));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );

    for (const id of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [toc]);

  const filtered = toc.filter((item) => item.depth <= 3);

  if (!filtered.length) return null;

  return (
    <nav aria-label="On this page">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1">
        {filtered.map((item) => {
          const id = item.url.replace('#', '');
          return (
            <li
              key={item.url}
              style={{ paddingLeft: `${(item.depth - 2) * 12}px` }}
            >
              <a
                href={item.url}
                className={cn(
                  'block text-xs py-0.5 transition-colors',
                  activeId === id
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
