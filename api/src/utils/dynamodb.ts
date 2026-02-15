import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // Para desarrollo local con LocalStack o DynamoDB Local
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table names from environment
export const TABLES = {
  POSTS: process.env.POSTS_TABLE_NAME || 'pharma-posts',
  ANOMALIES: process.env.ANOMALIES_TABLE_NAME || 'pharma-anomalies',
} as const;