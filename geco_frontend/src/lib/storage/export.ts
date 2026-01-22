import type { AppSettings, ChatThread, EndpointConfig, LogEntry, TestCase, TestResult } from "@/lib/types";

export interface ExportPayload {
  version: number;
  exportedAt: string;
  endpoints: EndpointConfig[];
  threads: ChatThread[];
  testCases: TestCase[];
  testResults: TestResult[];
  logs: LogEntry[];
  settings: AppSettings;
}

export const buildExportPayload = (
  endpoints: EndpointConfig[],
  threads: ChatThread[],
  testCases: TestCase[],
  testResults: TestResult[],
  logs: LogEntry[],
  settings: AppSettings
): ExportPayload => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  endpoints,
  threads,
  testCases,
  testResults,
  logs,
  settings,
});

export const parseImportPayload = (raw: string): ExportPayload => {
  const parsed = JSON.parse(raw) as ExportPayload;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid import file");
  }
  return parsed;
};
