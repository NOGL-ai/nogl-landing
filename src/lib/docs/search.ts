import { createI18nSearchAPI } from 'fumadocs-core/search/server';
import { source } from './source';

// Build per-language search indexes from the docs source at startup.
// Index.content is required — use description as a fallback for simple full-text.
export const { search, GET } = createI18nSearchAPI('simple', {
  indexes: source.getLanguages().map(({ language, pages }) => ({
    language,
    indexes: pages.map((page) => ({
      title: page.data.title,
      content: (page.data as { description?: string }).description ?? '',
      description: (page.data as { description?: string }).description ?? '',
      url: page.url,
    })),
  })),
});
