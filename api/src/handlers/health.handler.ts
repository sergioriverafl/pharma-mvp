import type { FastifyInstance } from 'fastify';
import { createSuccessResponse } from  "@/utils/api-response.js";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    return createSuccessResponse({
      status: 'healthy',
      service: 'pharma-mvp-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  fastify.get('/health/ready', async () => {
    // Check dependencies (DynamoDB, S3, etc.)
    // For now, simple check
    return createSuccessResponse({
      ready: true,
      checks: {
        dynamodb: 'ok',
        s3: 'ok',
      },
    });
  });
}