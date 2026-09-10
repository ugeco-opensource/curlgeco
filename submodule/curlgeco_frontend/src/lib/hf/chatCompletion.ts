import type { EndpointConfig } from "@/lib/types";

export interface ChatCompletionRequest {
  endpoint: EndpointConfig;
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export async function requestChatCompletion(
  { endpoint, model, messages, temperature, max_tokens, top_p, stream }: ChatCompletionRequest,
  signal?: AbortSignal
): Promise<Response> {
  if (!endpoint?.baseUrl || !endpoint?.apiKey) {
    throw new Error("Missing endpoint configuration");
  }

  const url = `${endpoint.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${endpoint.apiKey}`,
    ...(endpoint.headers ?? {}),
  };

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, temperature, max_tokens, top_p, stream }),
    signal,
  });
}
