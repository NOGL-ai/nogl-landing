interface TranslateBannerProps {
  lang: string;
  slugs: string[];
}

export function TranslateBanner({ lang, slugs }: TranslateBannerProps) {
  const enPath = `en/fractional-cfo/${slugs.join('/')}`;
  const translationUrl = `https://github.com/nogl-ai/nogl-landing/new/main/content/docs/${lang}/fractional-cfo?filename=${slugs.join('/')}.mdx`;

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
      <span aria-hidden="true">🌐</span>
      <span>
        This page hasn&apos;t been translated yet and is shown in English.{' '}
        <a
          href={translationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-medium hover:text-amber-900 dark:hover:text-amber-200"
        >
          Help translate this page
        </a>
        .
      </span>
    </div>
  );
}
