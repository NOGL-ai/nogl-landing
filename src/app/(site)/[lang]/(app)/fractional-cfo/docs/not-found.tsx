import Link from 'next/link';
import type { Route } from 'next';

export default function DocsNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        This documentation page doesn't exist yet. It may have been moved or
        the URL might be incorrect.
      </p>
      <Link
        href={'/en/fractional-cfo/docs' as Route}
        className="text-sm text-primary underline underline-offset-4"
      >
        Back to docs home
      </Link>
    </div>
  );
}
