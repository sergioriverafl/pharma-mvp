// Domain Types
export interface Post {
  id: string;
  platform: "mercadolibre" | "amazon" | "facebook";
  productName: string;
  description: string;
  price: number;
  currency: string;
  imageUrls: string[];
  sellerName: string;
  sellerUrl: string;
  productUrl: string;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "processing" | "analyzed" | "error";
  metadata?: Record<string, unknown>;
}

export interface Anomaly {
  id: string;
  postId: string;
  type: "price" | "packaging" | "seller" | "description" | "other";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number; // 0-1
  reason: string;
  detectedAt: string;
  validatedBy?: string;
  validatedAt?: string;
  status: "pending" | "confirmed" | "false_positive" | "rejected";
  metadata?: Record<string, unknown>;
}

export interface AnalysisResult {
  postId: string;
  hasAnomalies: boolean;
  anomalies: Omit<Anomaly, "id" | "postId">[];
  processedAt: string;
  provider: string;
  rawResponse?: unknown;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  lastEvaluatedKey?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    hasMore: boolean;
    lastEvaluatedKey?: string;
  };
}

// Query Filters
export interface PostFilters {
  platform?: Post["platform"];
  status?: Post["status"];
  startDate?: string;
  endDate?: string;
}

export interface AnomalyFilters {
  type?: Anomaly["type"];
  severity?: Anomaly["severity"];
  status?: Anomaly["status"];
  minConfidence?: number;
}
