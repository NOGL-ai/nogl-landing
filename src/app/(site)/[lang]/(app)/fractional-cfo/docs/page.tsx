export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Route } from 'next';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function DocsIndexPage({ params }: PageProps) {
  const { lang } = await params;
  // Redirect index to the overview page
  redirect(`/${lang}/fractional-cfo/docs/index` as Route);
}
