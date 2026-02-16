import { AIProvider } from './types';
import { MockProvider } from './mock.provider';
import { BedrockProvider } from './bedrock.provider';

export type ProviderType = 'mock' | 'bedrock';

export class AIProviderFactory {
  static create(type?: ProviderType): AIProvider {
    const providerType = type || (process.env.AI_PROVIDER as ProviderType) || 'mock';
    
    switch (providerType) {
      case 'bedrock':
        return new BedrockProvider(process.env.AWS_REGION);
      case 'mock':
      default:
        return new MockProvider();
    }
  }
}
