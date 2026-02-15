import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ApiError, createErrorResponse } from  "@/utils/api-response.js";

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  request.log.error({
    err: error,
    url: request.url,
    method: request.method,
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', {
        issues: error.message,
      })
    );
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send(
      createErrorResponse(error.code, error.message, error.details)
    );
  }

  // Handle Fastify errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send(
      createErrorResponse(
        error.code || 'FASTIFY_ERROR',
        error.message
      )
    );
  }

  // Default internal server error
  return reply.status(500).send(
    createErrorResponse(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message
    )
  );
}