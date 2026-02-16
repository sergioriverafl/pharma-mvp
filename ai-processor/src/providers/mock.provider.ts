import { AIProvider, PostAnalysisInput, AnalysisResult, Anomaly } from './types';

export class MockProvider implements AIProvider {
  name = 'mock';

  async analyze(input: PostAnalysisInput): Promise<AnalysisResult> {
    // Simular latencia de procesamiento
    await this.delay(500);

    const anomalies = this.detectAnomalies(input);
    
    return {
      postId: input.postId,
      isAnomaly: anomalies.length > 0,
      confidence: anomalies.length > 0 ? 0.85 : 0.95,
      anomalies,
      analysisDate: new Date().toISOString(),
      provider: this.name
    };
  }

  private detectAnomalies(input: PostAnalysisInput): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Simular detección de precio sospechoso
    if (input.price < 10 || input.price > 1000) {
      anomalies.push({
        type: 'price',
        severity: input.price < 10 ? 'high' : 'medium',
        description: `Precio inusual: ${input.currency} ${input.price}`,
        evidence: 'Precio fuera del rango esperado para productos farmacéuticos'
      });
    }

    // Simular detección en descripción
    const suspiciousKeywords = ['original', 'garantizado', 'importado', '100% efectivo'];
    const hasSuspiciousWords = suspiciousKeywords.some(kw => 
      input.description.toLowerCase().includes(kw)
    );
    
    if (hasSuspiciousWords) {
      anomalies.push({
        type: 'description',
        severity: 'medium',
        description: 'Descripción contiene palabras sospechosas',
        evidence: 'Uso de términos típicos de productos falsificados'
      });
    }

    // Simular detección de vendedor no confiable
    if (input.sellerRating && input.sellerRating < 3.5) {
      anomalies.push({
        type: 'seller',
        severity: 'high',
        description: `Vendedor con baja calificación: ${input.sellerRating}`,
        evidence: 'Rating del vendedor por debajo del estándar'
      });
    }

    return anomalies;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
