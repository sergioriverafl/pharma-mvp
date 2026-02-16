import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "@/utils/dynamodb.js";
import type {
  Post,
  PaginationParams,
  PostFilters,
} from "@/types/domain.types.js";
import { notFoundError } from "@/utils/api-response.js";

export class PostsRepository {
  private tableName = TABLES.POSTS;

  async create(post: Post): Promise<Post> {
    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: post,
      }),
    );
    return post;
  }

  async getById(id: string): Promise<Post> {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    if (!result.Item) {
      throw notFoundError("Post", id);
    }

    return result.Item as Post;
  }

  async list(
    pagination: PaginationParams = {},
    filters: PostFilters = {},
  ): Promise<{ items: Post[]; lastEvaluatedKey?: string }> {
    const { limit = 20, lastEvaluatedKey } = pagination;

    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.platform) {
      filterExpressions.push("#platform = :platform");
      expressionAttributeNames["#platform"] = "platform";
      expressionAttributeValues[":platform"] = filters.platform;
    }

    if (filters.status) {
      filterExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = filters.status;
    }

    if (filters.startDate) {
      filterExpressions.push("#scrapedAt >= :startDate");
      expressionAttributeNames["#scrapedAt"] = "scrapedAt";
      expressionAttributeValues[":startDate"] = filters.startDate;
    }

    if (filters.endDate) {
      filterExpressions.push("#scrapedAt <= :endDate");
      expressionAttributeNames["#scrapedAt"] = "scrapedAt";
      expressionAttributeValues[":endDate"] = filters.endDate;
    }

    const result = await docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey
          ? JSON.parse(Buffer.from(lastEvaluatedKey, "base64").toString())
          : undefined,
        ...(filterExpressions.length > 0 && {
          FilterExpression: filterExpressions.join(" AND "),
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }),
      }),
    );

    const response: { items: Post[]; lastEvaluatedKey?: string } = {
      items: (result.Items || []) as Post[],
    };

    if (result.LastEvaluatedKey) {
      response.lastEvaluatedKey = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey),
      ).toString("base64");
    }

    return response;
  }

  async updateStatus(id: string, status: Post["status"]): Promise<Post> {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    if (!result.Attributes) {
      throw notFoundError("Post", id);
    }

    return result.Attributes as Post;
  }

  async getByPlatform(
    platform: Post["platform"],
    pagination: PaginationParams = {},
  ): Promise<{ items: Post[]; lastEvaluatedKey?: string }> {
    const { limit = 20, lastEvaluatedKey } = pagination;

    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "platform-index", // GSI name
        KeyConditionExpression: "#platform = :platform",
        ExpressionAttributeNames: {
          "#platform": "platform",
        },
        ExpressionAttributeValues: {
          ":platform": platform,
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey
          ? JSON.parse(Buffer.from(lastEvaluatedKey, "base64").toString())
          : undefined,
      }),
    );

    const response: { items: Post[]; lastEvaluatedKey?: string } = {
      items: (result.Items || []) as Post[],
    };

    if (result.LastEvaluatedKey) {
      response.lastEvaluatedKey = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey),
      ).toString("base64");
    }

    return response;
  }
}
