import * as yup from "yup";

// Base product validation schema
export const productSchema = yup.object({
  name: yup.string().required("Product name is required").max(255, "Product name too long"),
  sku: yup.string().required("SKU is required").max(100, "SKU too long"),
  description: yup.string().optional(),
  image: yup.string().url("Invalid image URL").optional(),
  productUrl: yup.string().url("Invalid product URL").optional(),
  cost: yup.number().required("Cost is required").positive("Cost must be positive"),
  price: yup.number().required("Price is required").positive("Price must be positive"),
  currency: yup.string().length(3, "Currency must be 3 characters").default("EUR"),
  minPrice: yup.number().positive("Min price must be positive").optional(),
  maxPrice: yup.number().positive("Max price must be positive").optional(),
  margin: yup.number().min(0, "Margin cannot be negative").max(100, "Margin cannot exceed 100%").optional(),
  stock: yup.number().integer("Stock must be an integer").min(0, "Stock cannot be negative").optional(),
  status: yup.string().oneOf(["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  featured: yup.boolean().default(false),
  channel: yup.string().optional(),
  categoryId: yup.string().optional(),
  brandId: yup.string().optional(),
  triggeredRule: yup.string().optional(),
});

// Create product schema
export const createProductSchema = productSchema;

// Update product schema (all fields optional except id)
export const updateProductSchema = productSchema.partial().shape({
  id: yup.string().required("Product ID is required"),
});

// Product query parameters schema
export const productQuerySchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(10),
  search: yup.string().optional(),
  status: yup.string().oneOf(["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  featured: yup.boolean().optional(),
  channel: yup.string().optional(),
  categoryId: yup.string().optional(),
  brandId: yup.string().optional(),
  minPrice: yup.number().positive().optional(),
  maxPrice: yup.number().positive().optional(),
  sortBy: yup.string().oneOf(["name", "price", "cost", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: yup.string().oneOf(["asc", "desc"]).default("desc"),
});

// Bulk operations schema
export const bulkUpdateSchema = yup.object({
  productIds: yup.array().of(yup.string().required()).min(1, "At least one product ID required"),
  updates: yup.object({
    status: yup.string().oneOf(["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"]).optional(),
    featured: yup.boolean().optional(),
    categoryId: yup.string().optional(),
    brandId: yup.string().optional(),
  }).test("has-updates", "At least one field to update required", function(value) {
    return value && Object.keys(value).length > 0;
  }),
});

export const bulkDeleteSchema = yup.object({
  productIds: yup.array().of(yup.string().required()).min(1, "At least one product ID required"),
});

// Brand validation schema
export const brandSchema = yup.object({
  name: yup.string().required("Brand name is required").max(255, "Brand name too long"),
  logo: yup.string().url("Invalid logo URL").optional(),
  website: yup.string().url("Invalid website URL").optional(),
  description: yup.string().optional(),
});

export const createBrandSchema = brandSchema;
export const updateBrandSchema = brandSchema.partial().shape({
  id: yup.string().required("Brand ID is required"),
});

// Category validation schema
export const categorySchema = yup.object({
  name: yup.string().required("Category name is required").max(255, "Category name too long"),
  slug: yup.string().required("Category slug is required").max(255, "Category slug too long"),
  description: yup.string().optional(),
  parentId: yup.string().optional(),
});

export const createCategorySchema = categorySchema;
export const updateCategorySchema = categorySchema.partial().shape({
  id: yup.string().required("Category ID is required"),
});

// Competitor validation schema
export const competitorSchema = yup.object({
  productId: yup.string().required("Product ID is required"),
  name: yup.string().required("Competitor name is required").max(255, "Competitor name too long"),
  url: yup.string().url("Invalid competitor URL").optional(),
  cheapest: yup.number().required("Cheapest price is required").positive("Cheapest price must be positive"),
  avg: yup.number().required("Average price is required").positive("Average price must be positive"),
  highest: yup.number().required("Highest price is required").positive("Highest price must be positive"),
  cheapestColor: yup.string().oneOf(["green", "red", "gray"]).default("gray"),
});

export const createCompetitorSchema = competitorSchema;
export const updateCompetitorSchema = competitorSchema.partial().shape({
  id: yup.string().required("Competitor ID is required"),
});

// Price history validation schema
export const priceHistorySchema = yup.object({
  productId: yup.string().required("Product ID is required"),
  price: yup.number().required("Price is required").positive("Price must be positive"),
  cost: yup.number().positive("Cost must be positive").optional(),
  currency: yup.string().length(3, "Currency must be 3 characters").default("EUR"),
  source: yup.string().oneOf(["manual", "api", "scraper"]).default("manual"),
});

export const createPriceHistorySchema = priceHistorySchema;

// Export types
export type ProductInput = yup.InferType<typeof productSchema>;
export type CreateProductInput = yup.InferType<typeof createProductSchema>;
export type UpdateProductInput = yup.InferType<typeof updateProductSchema>;
export type ProductQuery = yup.InferType<typeof productQuerySchema>;
export type BulkUpdateInput = yup.InferType<typeof bulkUpdateSchema>;
export type BulkDeleteInput = yup.InferType<typeof bulkDeleteSchema>;

export type BrandInput = yup.InferType<typeof brandSchema>;
export type CreateBrandInput = yup.InferType<typeof createBrandSchema>;
export type UpdateBrandInput = yup.InferType<typeof updateBrandSchema>;

export type CategoryInput = yup.InferType<typeof categorySchema>;
export type CreateCategoryInput = yup.InferType<typeof createCategorySchema>;
export type UpdateCategoryInput = yup.InferType<typeof updateCategorySchema>;

export type CompetitorInput = yup.InferType<typeof competitorSchema>;
export type CreateCompetitorInput = yup.InferType<typeof createCompetitorSchema>;
export type UpdateCompetitorInput = yup.InferType<typeof updateCompetitorSchema>;

export type PriceHistoryInput = yup.InferType<typeof priceHistorySchema>;
export type CreatePriceHistoryInput = yup.InferType<typeof createPriceHistorySchema>;
