import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { buildApp } from "@/app.js";

let app: Awaited<ReturnType<typeof buildApp>> | null = null;

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  // Reuse app instance across invocations (Lambda container reuse)
  if (!app) {
    app = await buildApp();
    await app.ready();
  }

  // Convert API Gateway event to Fastify request
  const response = await app.inject({
    method: event.httpMethod as any,
    url:
      event.path +
      (event.queryStringParameters
        ? "?" +
          new URLSearchParams(
            Object.entries(event.queryStringParameters).map(([key, value]) => [
              key,
              Array.isArray(value) ? value[0] : value,
            ]),
          ).toString()
        : ""),
    headers: event.headers as Record<string, string>,
    payload: event.body,
    remoteAddress: event.requestContext.identity.sourceIp,
  } as any);

  return {
    statusCode: response.statusCode as number,
    headers: Object.fromEntries(
      Object.entries(response.headers as Record<string, any>).map(
        ([key, value]) => [
          key,
          typeof value === "string" ? value : String(value),
        ],
      ),
    ),
    body: response.body.toString(),
    isBase64Encoded: false,
  };
}
