export type ProviderType = "HF_ROUTER" | "HF_DEDICATED_ENDPOINT" | "OPENAI_COMPATIBLE_GENERIC";

export interface EndpointConfig {
  id: string;
  name: string;
  provider: ProviderType;
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  headers?: Record<string, string>;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatParams {
  temperature: number;
  maxTokens: number;
  topP: number;
  stream: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  systemPrompt: string;
  messages: ChatMessage[];
  params: ChatParams;
  endpointId?: string;
  modelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  name: string;
  prompt: string;
  expected?: string;
  tags: string[];
  paramsOverrides?: Partial<ChatParams>;
}

export interface TestResult {
  id: string;
  testCaseId: string;
  endpointId: string;
  modelId: string;
  responseText: string;
  latencyMs: number;
  tokens?: number;
  createdAt: string;
  error?: string;
}

export interface LogEntry {
  id: string;
  endpointId: string;
  modelId: string;
  latencyMs: number;
  success: boolean;
  createdAt: string;
  error?: string;
  request: {
    messages: ChatMessage[];
    params: ChatParams;
  };
  responseSnippet?: string;
}

export interface AppSettings {
  defaultEndpointId?: string;
  defaultModelId?: string;
}
