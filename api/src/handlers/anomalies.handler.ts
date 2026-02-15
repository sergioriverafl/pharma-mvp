import type { FastifyInstance } from "fastify";
import { AnomaliesService } from "@/services/anomalies.service.js";
import { createSuccessResponse } from "@/utils/api-response.js";
import type {
  AnomalyFilters,
  PaginationParams,
} from "@/types/domain.types.js";
import {
  AnomalyIdParamSchema,
  PostIdParamSchema,
  PaginationSchema,
  AnomalyFiltersSchema,
  ValidateAnomalySchema,
} from "@/schemas/validation.schemas.js";

export async function anomaliesRoutes(fastify: FastifyInstance) {
  const anomaliesService = new AnomaliesService();

  // GET /anomalies - List all anomalies
  fastify.get("/anomalies", async (request) => {
    const query = PaginationSchema.merge(AnomalyFiltersSchema).parse(
      request.query,
    );

    const { page, limit, lastEvaluatedKey, ...filters } = query;

    const pagination: PaginationParams = { page, limit };
    if (lastEvaluatedKey) {
      pagination.lastEvaluatedKey = lastEvaluatedKey;
    }

    const cleanFilters: AnomalyFilters = {};
    if (filters.type) cleanFilters.type = filters.type;
    if (filters.severity) cleanFilters.severity = filters.severity;
    if (filters.status) cleanFilters.status = filters.status;
    if (filters.minConfidence !== undefined)
      cleanFilters.minConfidence = filters.minConfidence;

    const result = await anomaliesService.listAnomalies(
      pagination,
      cleanFilters,
    );

    return createSuccessResponse(result.items, {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.items.length,
      timestamp: new Date().toISOString(),
    });
  });

  // GET /anomalies/:id - Get single anomaly
  fastify.get("/anomalies/:id", async (request) => {
    const { id } = AnomalyIdParamSchema.parse(request.params);
    const anomaly = await anomaliesService.getAnomaly(id);
    return createSuccessResponse(anomaly);
  });

  // GET /anomalies/post/:id - Get anomalies for a specific post
  fastify.get("/anomalies/post/:id", async (request) => {
    const { id } = PostIdParamSchema.parse(request.params);
    const anomalies = await anomaliesService.getAnomaliesByPost(id);
    return createSuccessResponse(anomalies);
  });

  // PATCH /anomalies/:id/validate - Validate an anomaly
  fastify.patch("/anomalies/:id/validate", async (request) => {
    const { id } = AnomalyIdParamSchema.parse(request.params);
    const validation = ValidateAnomalySchema.parse(request.body);

    const anomaly = await anomaliesService.validateAnomaly(id, validation);
    return createSuccessResponse(anomaly);
  });

  // GET /anomalies/stats - Get statistics
  fastify.get("/anomalies/stats", async () => {
    const stats = await anomaliesService.getStats();
    return createSuccessResponse(stats);
  });
}
