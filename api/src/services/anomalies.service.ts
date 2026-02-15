import { randomUUID } from "crypto";
import { AnomaliesRepository } from "@/repositories/anomalies.repository.js";
import type {
  Anomaly,
  AnomalyFilters,
  PaginationParams,
  PaginatedResponse,
} from "@/types/domain.types.js";
import type { AnomalyValidation } from "@/schemas/validation.schemas.js";

export class AnomaliesService {
  private repository: AnomaliesRepository;

  constructor() {
    this.repository = new AnomaliesRepository();
  }

  async getAnomaly(id: string): Promise<Anomaly> {
    return this.repository.getById(id);
  }

  async getAnomaliesByPost(postId: string): Promise<Anomaly[]> {
    return this.repository.getByPostId(postId);
  }

  async listAnomalies(
    pagination: PaginationParams = {},
    filters: AnomalyFilters = {},
  ): Promise<PaginatedResponse<Anomaly>> {
    const { page = 1, limit = 20 } = pagination;

    const result = await this.repository.list(
      { limit, ...pagination },
      filters,
    );

    return {
      items: result.items,
      pagination: {
        page,
        limit,
        hasMore: !!result.lastEvaluatedKey,
        ...(result.lastEvaluatedKey && {
          lastEvaluatedKey: result.lastEvaluatedKey,
        }),
      },
    };
  }

  async validateAnomaly(
    id: string,
    validation: AnomalyValidation,
  ): Promise<Anomaly> {
    return this.repository.validate(
      id,
      validation.status,
      validation.validatedBy,
    );
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<Anomaly["type"], number>;
    bySeverity: Record<Anomaly["severity"], number>;
    byStatus: Record<Anomaly["status"], number>;
  }> {
    // Note: Same caveat as PostsService - not scalable for production
    const result = await this.repository.list({ limit: 1000 });
    const anomalies = result.items;

    const byType = anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
        return acc;
      },
      {} as Record<Anomaly["type"], number>,
    );

    const bySeverity = anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
        return acc;
      },
      {} as Record<Anomaly["severity"], number>,
    );

    const byStatus = anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.status] = (acc[anomaly.status] || 0) + 1;
        return acc;
      },
      {} as Record<Anomaly["status"], number>,
    );

    return {
      total: anomalies.length,
      byType,
      bySeverity,
      byStatus,
    };
  }

  async createAnomaly(
    postId: string,
    anomalyData: Omit<Anomaly, "id" | "postId">,
  ): Promise<Anomaly> {
    const anomaly: Anomaly = {
      id: randomUUID(),
      postId,
      ...anomalyData,
    };

    return this.repository.create(anomaly);
  }
}
