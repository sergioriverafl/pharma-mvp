import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { scrapeMercadoLibre } from "./scraper";
import { ScrapedPost } from "./types";
import { config } from "./config";

const sqsClient = new SQSClient({});

interface LambdaEvent {
  searchQuery?: string;
  maxResults?: number;
}

export const handler = async (event: LambdaEvent) => {
  console.log("Starting MercadoLibre scraper", event);

  const searchQuery = event.searchQuery || "medicamentos";
  const maxResults = event.maxResults || config.scraper.defaultMaxResults;

  try {
    // Ejecutar scraping
    const result = await scrapeMercadoLibre(searchQuery, maxResults);

    console.log(`Scraped ${result.totalFound} posts`);
    if (result.errors.length > 0) {
      console.warn("Scraping errors:", result.errors);
    }

    // Enviar posts a SQS en lotes
    if (result.posts.length > 0) {
      await sendToSQS(result.posts);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        totalScraped: result.totalFound,
        errors: result.errors,
      }),
    };
  } catch (error) {
    console.error("Scraping failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

async function sendToSQS(posts: ScrapedPost[]): Promise<void> {
  const queueUrl = config.sqs.queueUrl;

  if (!queueUrl) {
    console.warn("SQS_QUEUE_URL not configured, skipping queue");
    return;
  }

  // Enviar en lotes de 10 (límite de SQS)
  const batches = chunkArray(posts, config.sqs.batchSize);

  for (const batch of batches) {
    const entries = batch.map((post, index) => ({
      Id: `${post.id}_${index}`,
      MessageBody: JSON.stringify(post),
      MessageAttributes: {
        platform: {
          DataType: "String",
          StringValue: post.platform,
        },
      },
    }));

    try {
      await sqsClient.send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        }),
      );

      console.log(`Sent batch of ${batch.length} messages to SQS`);
    } catch (error) {
      console.error("Error sending to SQS:", error);
      throw error;
    }
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
