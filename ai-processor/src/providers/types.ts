// Estructura de entrada para el análisis
export interface PostAnalysisInput {
  postId: string;
  platform: 'mercadolibre' | 'amazon' | 'facebook';
  title: string;
  description: string;
  price: number;
  currency: string;
  sellerName: string;
  sellerRating?: number;
  imageUrls: string[];
}

// Resultado del análisis de IA
export interface AnalysisResult {
  postId: string;
  isAnomaly: boolean;
  confidence: number; // 0-1
  anomalies: Anomaly[];
  analysisDate: string;
  provider: string;
}

export interface Anomaly {
  type: 'price' | 'packaging' | 'seller' | 'description' | 'image';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence?: string;
}

// Interface que deben implementar todos los providers
export interface AIProvider {
  name: string;
  analyze(input: PostAnalysisInput): Promise<AnalysisResult>;
}
