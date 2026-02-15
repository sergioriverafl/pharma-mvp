import { GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '@/utils/dynamodb.js';
import type { Anomaly, AnomalyFilters, PaginationParams } from '@/types/domain.types.js';
import { notFoundError } from '../utils/api-response.js';

export class AnomaliesRepository {
  private tableName = TABLES.ANOMALIES;

  async create(anomaly: Anomaly): Promise<Anomaly> {
    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: anomaly,
      })
    );
    return anomaly;
  }

  async createBatch(anomalies: Anomaly[]): Promise<void> {
    // For simplicity, sequential puts. For production, use BatchWriteCommand
    for (const anomaly of anomalies) {
      await this.create(anomaly);
    }
  }

  async getById(id: string): Promise<Anomaly> {
    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    if (!result.Item) {
      throw notFoundError('Anomaly', id);
    }

    return result.Item as Anomaly;
  }

  async getByPostId(postId: string): Promise<Anomaly[]> {
    // Assumes GSI on postId exists
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'postId-index',
        KeyConditionExpression: '#postId = :postId',
        ExpressionAttributeNames: {
          '#postId': 'postId',
        },
        ExpressionAttributeValues: {
          ':postId': postId,
        },
      })
    );

    return (result.Items || []) as Anomaly[];
  }

  async list(
    pagination: PaginationParams = {},
    filters: AnomalyFilters = {}
  ): Promise<{ items: Anomaly[]; lastEvaluatedKey?: string }> {
    const { limit = 20, lastEvaluatedKey } = pagination;

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.type) {
      filterExpressions.push('#type = :type');
      expressionAttributeNames['#type'] = 'type';
      expressionAttributeValues[':type'] = filters.type;
    }

    if (filters.severity) {
      filterExpressions.push('#severity = :severity');
      expressionAttributeNames['#severity'] = 'severity';
      expressionAttributeValues[':severity'] = filters.severity;
    }

    if (filters.status) {
      filterExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = filters.status;
    }

    if (filters.minConfidence !== undefined) {
      filterExpressions.push('#confidence >= :minConfidence');
      expressionAttributeNames['#confidence'] = 'confidence';
      expressionAttributeValues[':minConfidence'] = filters.minConfidence;
    }

    const result = await docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey
          ? JSON.parse(Buffer.from(lastEvaluatedKey, 'base64').toString())
          : undefined,
        ...(filterExpressions.length > 0 && {
          FilterExpression: filterExpressions.join(' AND '),
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }),
      })
    );

    const response: { items: Anomaly[]; lastEvaluatedKey?: string } = {
      items: (result.Items || []) as Anomaly[],
    };

    if (result.LastEvaluatedKey) {
      response.lastEvaluatedKey = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
    }

    return response;
  }

  async validate(id: string, status: Anomaly['status'], validatedBy: string): Promise<Anomaly> {
    const result = await docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          'SET #status = :status, #validatedBy = :validatedBy, #validatedAt = :validatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#validatedBy': 'validatedBy',
          '#validatedAt': 'validatedAt',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':validatedBy': validatedBy,
          ':validatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    if (!result.Attributes) {
      throw notFoundError('Anomaly', id);
    }

    return result.Attributes as Anomaly;
  }
}