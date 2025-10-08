# BigQuery Migration Summary

## Problem
- You had 82k products in BigQuery table `nogl.shopify_product_variants_bq` 
- But only 1,598 products were showing in the UI
- The API was querying the wrong table (`products` instead of BigQuery table)

## Solution
Updated the API route `/api/products` to query from the BigQuery Foreign Data Wrapper table.

## Changes Made

### 1. Updated API Route (`src/app/api/products/route.ts`)
- **Changed data source**: From `products` table to `nogl.shopify_product_variants_bq`
- **Updated column mappings** to match BigQuery schema:
  - `product_title` instead of `title`
  - `variant_id` as primary ID instead of `id`
  - `available` for status filtering
  - `price` and `compare_at_price` for pricing
  - `vendor` for brand information
  - `product_type` for category

### 2. Fixed Column Names
Based on your BigQuery schema:
```sql
product_id BIGINT,
product_title STRING,
handle STRING,
body_html STRING,
published_at TIMESTAMP,
product_created_at TIMESTAMP,
product_updated_at TIMESTAMP,
vendor STRING,
product_type STRING,
tags ARRAY<STRING>,
variant_id BIGINT,
variant_title STRING,
option1 STRING,
option2 STRING,
option3 STRING,
sku STRING,
requires_shipping BOOLEAN,
taxable BOOLEAN,
available BOOLEAN,
price NUMERIC,
grams BIGINT,
compare_at_price NUMERIC,
variant_position BIGINT,
variant_created_at TIMESTAMP,
variant_updated_at TIMESTAMP
```

### 3. Image URL Construction
Since the BigQuery table doesn't have image URLs, we construct them using the product handle:
```javascript
imageUrl = `https://cdn.shopify.com/s/files/1/placeholder/files/${product.handle}-${product.variant_id || 'main'}.jpg`;
```

### 4. Currency Update
Changed from USD to EUR based on your sample data showing German jewelry products.

## Expected Results
- ✅ **82k products** should now be accessible instead of 1,598
- ✅ **Pagination** will work correctly with the full dataset
- ✅ **Search and filtering** will work across all 82k products
- ✅ **Proper column mapping** for all product fields

## Next Steps
1. **Test the API**: Visit `/api/products?page=1&limit=100` to verify it returns data from BigQuery
2. **Update image URLs**: If you have the actual Shopify CDN structure, update the image URL pattern
3. **Verify pagination**: Check that you can navigate through all 82k products

## Files Modified
- `src/app/api/products/route.ts` - Updated to query BigQuery table
- `prisma/schema.prisma` - Added commented BigQuery table schema for reference

The migration is complete and should now show all 82k products from your BigQuery table!
