import { z } from "zod";

// Post Schemas
export const PostSchema = z.object({
  id: z.string().uuid(),
  platform: z.enum(["mercadolibre", "amazon", "facebook"]),
  productName: z.string().min(1).max(500),
  description: z.string().max(5000),
  price: z.number().positive(),
  currency: z.string().length(3),
  imageUrls: z.array(z.string().url()).min(1),
  sellerName: z.string().min(1),
  sellerUrl: z.string().url(),
  productUrl: z.string().url(),
  scrapedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(["pending", "processing", "analyzed", "error"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CreatePostSchema = PostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Anomaly Schemas
export const AnomalySchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  type: z.enum(["price", "packaging", "seller", "description", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1).max(1000),
  detectedAt: z.string().datetime(),
  validatedBy: z.string().optional(),
  validatedAt: z.string().datetime().optional(),
  status: z.enum(["pending", "confirmed", "false_positive", "rejected"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ValidateAnomalySchema = z.object({
  status: z.enum(["confirmed", "false_positive", "rejected"]),
  validatedBy: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

// Query Params Schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  lastEvaluatedKey: z.string().optional(),
});

export const PostFiltersSchema = z.object({
  platform: z.enum(["mercadolibre", "amazon", "facebook"]).optional(),
  status: z.enum(["pending", "processing", "analyzed", "error"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const AnomalyFiltersSchema = z.object({
  type: z
    .enum(["price", "packaging", "seller", "description", "other"])
    .optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z
    .enum(["pending", "confirmed", "false_positive", "rejected"])
    .optional(),
  minConfidence: z.coerce.number().min(0).max(1).optional(),
});

// Params Schemas
export const PostIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const AnomalyIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Export types inferred from schemas
export type PostInput = z.infer<typeof CreatePostSchema>;
export type AnomalyValidation = z.infer<typeof ValidateAnomalySchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
export type PostFilters = z.infer<typeof PostFiltersSchema>;
export type AnomalyFilters = z.infer<typeof AnomalyFiltersSchema>;
