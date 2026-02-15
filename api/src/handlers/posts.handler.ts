import type { FastifyInstance } from "fastify";
import { PostsService } from "@/services/posts.service.js";
import {
  PostIdParamSchema,
  PaginationSchema,
  PostFiltersSchema,
  CreatePostSchema,
} from "@/schemas/validation.schemas.js";
import { createSuccessResponse } from "@/utils/api-response.js";

export async function postsRoutes(fastify: FastifyInstance) {
  const postsService = new PostsService();

  // GET /posts - List all posts
  fastify.get("/posts", async (request) => {
    const query = PaginationSchema.merge(PostFiltersSchema).parse(
      request.query,
    );

    const { page, limit, lastEvaluatedKey, ...filters } = query;

    const pagination: {
      page: number;
      limit: number;
      lastEvaluatedKey?: string;
    } = { page, limit };
    if (lastEvaluatedKey) {
      pagination.lastEvaluatedKey = lastEvaluatedKey;
    }

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined),
    );

    const result = await postsService.listPosts(
      pagination,
      cleanedFilters as any,
    );

    return createSuccessResponse(result.items, {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.items.length,
      timestamp: new Date().toISOString(),
    });
  });

  // GET /posts/:id - Get single post
  fastify.get("/posts/:id", async (request) => {
    const { id } = PostIdParamSchema.parse(request.params);
    const post = await postsService.getPost(id);
    return createSuccessResponse(post);
  });

  // POST /posts - Create new post (for testing)
  fastify.post("/posts", async (request) => {
    const postData = CreatePostSchema.parse(request.body);
    const post = await postsService.createPost(postData);
    return createSuccessResponse(post);
  });

  // GET /posts/platform/:platform - Get posts by platform
  fastify.get("/posts/platform/:platform", async (request) => {
    const { platform } = request.params as {
      platform: "mercadolibre" | "amazon" | "facebook";
    };
    const query = PaginationSchema.parse(request.query);

    const pagination: {
      page: number;
      limit: number;
      lastEvaluatedKey?: string;
    } = { page: query.page, limit: query.limit };
    if (query.lastEvaluatedKey) {
      pagination.lastEvaluatedKey = query.lastEvaluatedKey;
    }

    const result = await postsService.getPostsByPlatform(platform, pagination);

    return createSuccessResponse(result.items, {
      page: result.pagination.page,
      limit: result.pagination.limit,
      timestamp: new Date().toISOString(),
    });
  });

  // GET /posts/stats - Get statistics
  fastify.get("/posts/stats", async () => {
    const stats = await postsService.getStats();
    return createSuccessResponse(stats);
  });
}
