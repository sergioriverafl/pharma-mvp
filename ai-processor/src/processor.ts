import { AIProviderFactory } from './providers/factory';
import { PostAnalysisInput } from './providers/types';
import { DynamoService } from './services/dynamo.service';

export class Processor {
  private aiProvider = AIProviderFactory.create();
  private dynamoService = new DynamoService();

  async processPost(post: PostAnalysisInput): Promise<void> {
    console.log(`Processing post ${post.postId} from ${post.platform}`);
    
    try {
      // Actualizar estado a "procesando"
      await this.dynamoService.updateProcessingStatus(post.postId, 'processing');

      // Analizar con IA
      const result = await this.aiProvider.analyze(post);
      
      console.log(`Analysis complete for ${post.postId}:`, {
        isAnomaly: result.isAnomaly,
        confidence: result.confidence,
        anomalyCount: result.anomalies.length
      });

      // Guardar resultado
      await this.dynamoService.saveAnalysisResult(result);
      
      // Actualizar estado a "completado"
      await this.dynamoService.updateProcessingStatus(post.postId, 'completed');

    } catch (error) {
      console.error(`Error processing post ${post.postId}:`, error);
      
      // Guardar error en DynamoDB
      await this.dynamoService.updateProcessingStatus(
        post.postId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      throw error;
    }
  }
}
