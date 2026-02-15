import { randomUUID } from 'crypto';
import { PostsRepository } from '@/repositories/posts.repository.js';
import type { Post, PostFilters, PaginationParams, PaginatedResponse } from '@/types/domain.types.js';
import type { PostInput } from '@/schemas/validation.schemas.js';

export class PostsService {
  private repository: PostsRepository;

  constructor() {
    this.repository = new PostsRepository();
  }

  async createPost(input: PostInput): Promise<Post> {
    const now = new Date().toISOString();
    const post: Post = {
      id: randomUUID(),
      ...input,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: input.metadata || {},
    };

    return this.repository.create(post);
  }

  async getPost(id: string): Promise<Post> {
    return this.repository.getById(id);
  }

  async listPosts(
    pagination: PaginationParams = {},
    filters: PostFilters = {}
  ): Promise<PaginatedResponse<Post>> {
    const { page = 1, limit = 20 } = pagination;

    const result = await this.repository.list({ limit, ...pagination }, filters);

    return {
      items: result.items,
      pagination: {
        page,
        limit,
        hasMore: !!result.lastEvaluatedKey,
        ...(result.lastEvaluatedKey && { lastEvaluatedKey: result.lastEvaluatedKey }),
      },
    };
  }

  async updatePostStatus(id: string, status: Post['status']): Promise<Post> {
    return this.repository.updateStatus(id, status);
  }

  async getPostsByPlatform(
    platform: Post['platform'],
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Post>> {
    const { page = 1, limit = 20 } = pagination;

    const result = await this.repository.getByPlatform(platform, { limit, ...pagination });

    return {
      items: result.items,
      pagination: {
        page,
        limit,
        hasMore: !!result.lastEvaluatedKey,
        ...(result.lastEvaluatedKey && { lastEvaluatedKey: result.lastEvaluatedKey }),
      },
    };
  }

  async getStats(): Promise<{
    total: number;
    byPlatform: Record<Post['platform'], number>;
    byStatus: Record<Post['status'], number>;
  }> {
    const result = await this.repository.list({ limit: 1000 });
    const posts = result.items;

    const byPlatform: Record<Post['platform'], number> = posts.reduce(
      (acc: Record<Post['platform'], number>, post: Post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
      },
      {} as Record<Post['platform'], number>
    );

    const byStatus = posts.reduce(
      (acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      },
      {} as Record<Post['status'], number>
    );

    return {
      total: posts.length,
      byPlatform,
      byStatus,
    };
  }
}