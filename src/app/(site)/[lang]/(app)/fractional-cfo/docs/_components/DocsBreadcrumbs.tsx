import Link from 'next/link';
import type { Route } from 'next';

interface DocsBreadcrumbsProps {
  lang: string;
  slugs: string[];
  title: string;
}

const segmentLabels: Record<string, string> = {
  'getting-started': 'Getting Started',
  'core-features': 'Core Features',
  'admin-integrations': 'Admin & Integrations',
  reference: 'Reference',
};

export function DocsBreadcrumbs({ lang, slugs, title }: DocsBreadcrumbsProps) {
  const parts = [
    { label: 'Help & Docs', href: `/${lang}/fractional-cfo/docs` as Route },
  ];

  if (slugs.length > 1) {
    parts.push({
      label: segmentLabels[slugs[0]] ?? slugs[0],
      href: `/${lang}/fractional-cfo/docs/${slugs[0]}` as Route,
    });
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        {parts.map((part, idx) => (
          <li key={part.href} className="flex items-center gap-1.5">
            {idx > 0 && <span aria-hidden="true">/</span>}
            <Link
              href={part.href}
              className="hover:text-foreground transition-colors"
            >
              {part.label}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true">/</span>
          <span className="text-foreground font-medium" aria-current="page">
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
}
