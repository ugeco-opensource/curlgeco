"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Play, RefreshCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { requestChatCompletion } from "@/lib/hf/chatCompletion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LogsPage() {
  const logs = useAppStore((state) => state.logs);
  const endpoints = useAppStore((state) => state.endpoints);
  const addLog = useAppStore((state) => state.addLog);

  const [replayId, setReplayId] = useState<string | null>(null);

  const replay = async (logId: string) => {
    const entry = logs.find((item) => item.id === logId);
    if (!entry) return;
    const endpoint = endpoints.find((item) => item.id === entry.endpointId);
    if (!endpoint) {
      toast.error("Endpoint not found for replay");
      return;
    }
    setReplayId(logId);
    const start = performance.now();
    try {
      const response = await requestChatCompletion({
        endpoint,
        model: entry.modelId,
        messages: entry.request.messages.map(({ role, content }) => ({ role, content })),
        temperature: entry.request.params.temperature,
        max_tokens: entry.request.params.maxTokens,
        top_p: entry.request.params.topP,
        stream: false,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Replay failed");
      }
      const data = await response.json();
      addLog({
        id: nanoid(),
        endpointId: endpoint.id,
        modelId: entry.modelId,
        latencyMs: Math.round(performance.now() - start),
        success: true,
        createdAt: new Date().toISOString(),
        request: entry.request,
        responseSnippet: data?.choices?.[0]?.message?.content?.slice(0, 120) ?? "",
      });
      toast.success("Replay complete");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Replay failed";
      toast.error(message);
      addLog({
        id: nanoid(),
        endpointId: endpoint.id,
        modelId: entry.modelId,
        latencyMs: Math.round(performance.now() - start),
        success: false,
        createdAt: new Date().toISOString(),
        request: entry.request,
        error: message,
      });
    } finally {
      setReplayId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Logs</h1>
        <p className="text-sm text-muted">Inspect every request, latency profile, and replay path.</p>
      </div>
      {logs.length === 0 ? (
        <Card className="glass-panel p-8 text-center text-sm text-muted">
          No logs yet. Interact with chat or tests to populate logs.
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="glass-panel flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{log.modelId}</p>
                  <p className="text-xs text-muted">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="tag-gradient text-foreground">
                    {endpoints.find((endpoint) => endpoint.id === log.endpointId)?.name ?? log.endpointId}
                  </Badge>
                  {log.success ? (
                    <Badge className="bg-emerald-500/20 text-emerald-200">Success</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-200">Failure</Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted">
                <p>Latency: {log.latencyMs} ms</p>
                {log.error ? <p>Error: {log.error}</p> : null}
                {log.responseSnippet ? <p>Response: {log.responseSnippet}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => replay(log.id)}
                  disabled={replayId === log.id}
                >
                  {replayId === log.id ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Replay request
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
