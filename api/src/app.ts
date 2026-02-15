import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { errorHandler } from '@/middleware/error-handler.js';
import { healthRoutes } from '@/handlers/health.handler.js';
import { postsRoutes } from '@/handlers/posts.handler.js';
import { anomaliesRoutes } from '@/handlers/anomalies.handler.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            headers: request.headers,
            hostname: request.hostname,
            remoteAddress: request.ip,
          };
        },
      },
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    trustProxy: true,
  });

  // Register plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // Disable for API
  });

  // Set error handler
  app.setErrorHandler(errorHandler);

  // Register routes
  await app.register(healthRoutes);
  await app.register(postsRoutes, { prefix: '/api/v1' });
  await app.register(anomaliesRoutes, { prefix: '/api/v1' });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method}:${request.url} not found`,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });

  return app;
}