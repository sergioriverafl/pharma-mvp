import type { ApiResponse } from "@/types/domain.types.js";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const createSuccessResponse = <T>(
  data: T,
  meta?: ApiResponse<T>["meta"],
): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    ...meta,
    timestamp: new Date().toISOString(),
  },
});

export const createErrorResponse = (
  code: string,
  message: string,
  details?: unknown,
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
  meta: {
    timestamp: new Date().toISOString(),
  },
});

// Common error creators
export const notFoundError = (resource: string, id: string) =>
  new ApiError("NOT_FOUND", `${resource} with id ${id} not found`, 404);

export const validationError = (message: string, details?: unknown) =>
  new ApiError("VALIDATION_ERROR", message, 400, details);

export const internalError = (message: string = "Internal server error") =>
  new ApiError("INTERNAL_ERROR", message, 500);

export const unauthorizedError = (message: string = "Unauthorized") =>
  new ApiError("UNAUTHORIZED", message, 401);
