import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { z } from 'zod';

// destructure into docs + meta so each is a standalone collection export
// (fumadocs-mdx validateConfig checks for _doc === "collections" on each named export)
// dir defaults to "content/docs" — no need to override
export const { docs, meta } = defineDocs({
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      updated: z.string().optional(),
      owner: z.string().optional(),
    }),
  },
  meta: {
    schema: z.object({
      title: z.string(),
      pages: z.array(z.string()).optional(),
    }),
  },
});

export default defineConfig({ lastModifiedTime: 'git' });
