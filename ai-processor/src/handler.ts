import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { Processor } from './processor';
import { PostAnalysisInput } from './providers/types';

const processor = new Processor();

export const handler = async (event: SQSEvent, context: Context) => {
  console.log(`Processing ${event.Records.length} messages`);

  const results = await Promise.allSettled(
    event.Records.map(record => processRecord(record))
  );

  const failures = results.filter(r => r.status === 'rejected');
  
  if (failures.length > 0) {
    console.error(`Failed to process ${failures.length} messages`);
    
    // Devolver los IDs de los mensajes fallidos para retry
    return {
      batchItemFailures: failures.map((_, index) => ({
        itemIdentifier: event.Records[index].messageId
      }))
    };
  }

  console.log('All messages processed successfully');
  return { batchItemFailures: [] };
};

async function processRecord(record: SQSRecord): Promise<void> {
  try {
    const post: PostAnalysisInput = JSON.parse(record.body);
    await processor.processPost(post);
  } catch (error) {
    console.error('Error processing record:', error);
    throw error;
  }
}
