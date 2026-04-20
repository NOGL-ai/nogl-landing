import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { docs, meta } from '@/.source';

export const source = loader({
  baseUrl: '/fractional-cfo/docs',
  source: createMDXSource(docs, meta),
  i18n: {
    defaultLanguage: 'en',
    languages: ['en', 'de'],
  },
});
