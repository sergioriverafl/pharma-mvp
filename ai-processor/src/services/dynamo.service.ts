import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { AnalysisResult } from '../providers/types';

export class DynamoService {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName?: string, region?: string) {
    const dynamoClient = new DynamoDBClient({ region: region || process.env.AWS_REGION });
    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = tableName || process.env.POSTS_TABLE || 'pharma-posts';
  }

  async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: {
        postId: result.postId
      },
      UpdateExpression: 'SET #analysis = :analysis, #isAnomaly = :isAnomaly, #confidence = :confidence, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#analysis': 'analysis',
        '#isAnomaly': 'isAnomaly',
        '#confidence': 'confidence',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':analysis': result,
        ':isAnomaly': result.isAnomaly,
        ':confidence': result.confidence,
        ':updatedAt': new Date().toISOString()
      }
    });

    await this.client.send(command);
  }

  async updateProcessingStatus(postId: string, status: 'processing' | 'completed' | 'failed', error?: string): Promise<void> {
    const updateExpression = error 
      ? 'SET #status = :status, #error = :error, #updatedAt = :updatedAt'
      : 'SET #status = :status, #updatedAt = :updatedAt';
    
    const expressionValues: Record<string, any> = {
      ':status': status,
      ':updatedAt': new Date().toISOString()
    };

    const expressionNames: Record<string, string> = {
      '#status': 'processingStatus',
      '#updatedAt': 'updatedAt'
    };

    if (error) {
      expressionValues[':error'] = error;
      expressionNames['#error'] = 'processingError';
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { postId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues
    });

    await this.client.send(command);
  }
}
