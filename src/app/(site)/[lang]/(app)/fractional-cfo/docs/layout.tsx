import type { ReactNode } from 'react';
import type { Route } from 'next';
import { source } from '@/lib/docs/source';

export const metadata = {
  title: {
    default: 'Help & Docs',
    template: '%s — NOGL Help',
  },
  description: 'NOGL Fractional CFO documentation and help center.',
};

interface DocsLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  // Just pass children through — the DocsPageShell handles layout inside each page
  return <>{children}</>;
}
