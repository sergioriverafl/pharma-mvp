import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  AIProvider,
  PostAnalysisInput,
  AnalysisResult,
  Anomaly,
} from "./types";

export class BedrockProvider implements AIProvider {
  name = "bedrock-claude";
  private client: BedrockRuntimeClient;
  private modelId = "anthropic.claude-3-sonnet-20240229-v1:0";

  constructor(region = "us-east-1") {
    this.client = new BedrockRuntimeClient({ region });
  }

  async analyze(input: PostAnalysisInput): Promise<AnalysisResult> {
    const prompt = this.buildPrompt(input);

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return this.parseClaudeResponse(input.postId, responseBody.content[0].text);
  }


  // todo: prompt para prueba al interconectar todas las aplicaciones
  // todo: afinar sistema propio para detectar anomalias en las publicaciones
  //       crear sistema propio estilo colección de reglas que permitar refinar el resultado, tanto a nivel
  //       programtico como con IA.
  //       Crear sistema con conjunto de experiencias que permita retro-alimentar aplicaciones de
  //       capas más altas.
  //       Sistema de mascaras (investigar)


  private buildPrompt(input: PostAnalysisInput): string {
    return `Analiza la siguiente publicación de producto farmacéutico y detecta anomalías:
Plataforma: ${input.platform}
Título: ${input.title}
Descripción: ${input.description}
Precio: ${input.currency} ${input.price}
Vendedor: ${input.sellerName}
Rating: ${input.sellerRating || "N/A"}

Detecta anomalías en estas categorías:
- price: Precio inusualmente bajo o alto
- packaging: Problemas con empaque visible
- seller: Vendedor no autorizado o sospechoso  
- description: Texto engañoso o promesas exageradas
- image: Imágenes de baja calidad o inconsistentes

Responde ÚNICAMENTE con JSON en este formato:
{
  "isAnomaly": boolean,
  "confidence": number (0-1),
  "anomalies": [
    {
      "type": "price|packaging|seller|description|image",
      "severity": "low|medium|high",
      "description": "descripción breve",
      "evidence": "evidencia específica"
    }
  ]
}`;
  }

  private parseClaudeResponse(
    postId: string,
    responseText: string,
  ): AnalysisResult {
    try {
      // Extraer JSON del response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        postId,
        isAnomaly: parsed.isAnomaly,
        confidence: parsed.confidence,
        anomalies: parsed.anomalies || [],
        analysisDate: new Date().toISOString(),
        provider: this.name,
      };
    } catch (error) {
      console.error("Error parsing Claude response:", error);
      // Fallback: considerar anómalo si hay error
      return {
        postId,
        isAnomaly: true,
        confidence: 0.5,
        anomalies: [
          {
            type: "description",
            severity: "medium",
            description: "Error en análisis automático",
            evidence: "Requiere revisión manual",
          },
        ],
        analysisDate: new Date().toISOString(),
        provider: this.name,
      };
    }
  }
}
