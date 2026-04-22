# Product Type Taxonomy

## Route

- **`/[lang]/product-taxonomy`** (protected) — Particl-style **Explore** workspace: AI categorization explainer, example PDP → path, **Taxonomy Explorer** with five depth columns, disabled **Customize** (placeholder for a future paid tier).

## Data

- Demo tree: `src/data/product-type-taxonomy.ts` (`PRODUCT_TYPE_TAXONOMY_ROOTS`, `TAXONOMY_MAX_DEPTH = 5`).
- Replace with a CSV/JSON import (e.g. [Google Product Taxonomy](https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt)) or an internal API that returns the same `ProductTaxonomyNode` shape.

## UX

- Column *n* lists children of the node selected in column *n−1*. Empty deeper columns show guidance until the parent depth is selected.
- Leaves with no children show a short “no further types” message for the demo dataset.

## Navigation

- **Digital Shelf → Product taxonomy** (`navigationItemsV2.tsx`).
- `routes.config.ts` includes `/product-taxonomy` under protected routes.
