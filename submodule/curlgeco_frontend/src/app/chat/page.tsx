"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Loader2,
  PauseCircle,
  RefreshCcw,
  Trash2,
  Download,
} from "lucide-react";
import { useAppStore, ensureActiveThread, makeAssistantMessage, makeUserMessage } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";
import { readChatStream } from "@/lib/hf/streaming";
import { requestChatCompletion } from "@/lib/hf/chatCompletion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Markdown from "@/components/shared/Markdown";

export default function ChatPage() {
  const threads = useAppStore((state) => state.threads);
  const activeThreadId = useAppStore((state) => state.activeThreadId);
  const addThread = useAppStore((state) => state.addThread);
  const setActiveThread = useAppStore((state) => state.setActiveThread);
  const updateThread = useAppStore((state) => state.updateThread);
  const addMessage = useAppStore((state) => state.addMessage);
  const updateMessage = useAppStore((state) => state.updateMessage);
  const setThreadParams = useAppStore((state) => state.setThreadParams);
  const setThreadSystemPrompt = useAppStore((state) => state.setThreadSystemPrompt);
  const endpoints = useAppStore((state) => state.endpoints);
  const settings = useAppStore((state) => state.settings);
  const addLog = useAppStore((state) => state.addLog);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (threads.length === 0) {
      addThread();
      return;
    }
    const nextActive = ensureActiveThread(threads, activeThreadId);
    if (nextActive && nextActive !== activeThreadId) {
      setActiveThread(nextActive);
    }
  }, [threads, activeThreadId, addThread, setActiveThread]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId),
    [threads, activeThreadId]
  );

  const endpoint = useMemo(() => {
    if (!activeThread) return undefined;
    return endpoints.find((item) => item.id === (activeThread.endpointId ?? settings.defaultEndpointId));
  }, [activeThread, endpoints, settings.defaultEndpointId]);

  const modelId =
    activeThread?.modelId ?? settings.defaultModelId ?? endpoint?.defaultModel ?? "";

  const sendMessage = async (content: string, historyOverride?: ChatMessage[]) => {
    if (!activeThread) return;
    if (!endpoint) {
      toast.error("Select an endpoint before chatting.");
      return;
    }
    if (!modelId) {
      toast.error("Set a model id before sending a message.");
      return;
    }

    const userMessage = makeUserMessage(content);
    addMessage(activeThread.id, userMessage);

    const assistantMessage = makeAssistantMessage();
    addMessage(activeThread.id, assistantMessage);

    setInput("");
    setIsStreaming(true);

    const payloadMessages: ChatMessage[] = [
      { id: nanoid(), role: "system", content: activeThread.systemPrompt, createdAt: new Date().toISOString() },
      ...(historyOverride ?? activeThread.messages),
      userMessage,
    ];

    const controller = new AbortController();
    abortRef.current = controller;
    const start = performance.now();

    try {
      const response = await requestChatCompletion(
        {
          endpoint,
          model: modelId,
          messages: payloadMessages.map(({ role, content }) => ({ role, content })),
          temperature: activeThread.params.temperature,
          max_tokens: activeThread.params.maxTokens,
          top_p: activeThread.params.topP,
          stream: activeThread.params.stream,
        },
        controller.signal
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Request failed");
      }

      if (activeThread.params.stream) {
        let buffer = "";
        await readChatStream(response, {
          onToken: (token) => {
            buffer += token;
            updateMessage(activeThread.id, assistantMessage.id, buffer);
          },
          onComplete: () => {
            setIsStreaming(false);
            addLog({
              id: nanoid(),
              endpointId: endpoint.id,
              modelId: modelId,
              latencyMs: Math.round(performance.now() - start),
              success: true,
              createdAt: new Date().toISOString(),
              request: { messages: payloadMessages, params: activeThread.params },
              responseSnippet: buffer.slice(0, 120),
            });
          },
          onError: (error) => {
            setIsStreaming(false);
            toast.error(error);
            addLog({
              id: nanoid(),
              endpointId: endpoint.id,
              modelId: modelId,
              latencyMs: Math.round(performance.now() - start),
              success: false,
              createdAt: new Date().toISOString(),
              error,
              request: { messages: payloadMessages, params: activeThread.params },
            });
          },
        });
      } else {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content ?? "";
        updateMessage(activeThread.id, assistantMessage.id, text);
        setIsStreaming(false);
        addLog({
          id: nanoid(),
          endpointId: endpoint.id,
          modelId: modelId,
          latencyMs: Math.round(performance.now() - start),
          success: true,
          createdAt: new Date().toISOString(),
          request: { messages: payloadMessages, params: activeThread.params },
          responseSnippet: text.slice(0, 120),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      toast.error(message);
      updateMessage(activeThread.id, assistantMessage.id, `Error: ${message}`);
      setIsStreaming(false);
      addLog({
        id: nanoid(),
        endpointId: endpoint.id,
        modelId: modelId,
        latencyMs: Math.round(performance.now() - start),
        success: false,
        createdAt: new Date().toISOString(),
        error: message,
        request: { messages: payloadMessages, params: activeThread.params },
      });
    }
  };

  const regenerate = async () => {
    if (!activeThread) return;
    if (isStreaming) return;
    const lastUserIndex = [...activeThread.messages]
      .map((msg, index) => ({ msg, index }))
      .reverse()
      .find((item) => item.msg.role === "user")?.index;

    if (lastUserIndex === undefined) return;
    const trimmed = activeThread.messages.slice(0, lastUserIndex + 1);
    updateThread({ ...activeThread, messages: trimmed });
    await sendMessage(trimmed[lastUserIndex].content, trimmed.slice(0, -1));
  };

  const clearChat = () => {
    if (!activeThread) return;
    updateThread({ ...activeThread, messages: [] });
  };

  const exportChat = () => {
    if (!activeThread) return;
    const blob = new Blob([JSON.stringify(activeThread, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `curlgeco-${activeThread.title.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
      <Card className="glass-panel flex h-[70vh] flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Threads</p>
          <Button size="sm" onClick={() => addThread()}>
            New
          </Button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {threads.map((thread) => (
            <button
              key={thread.id}
              className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition ${
                thread.id === activeThreadId
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-white/10 bg-white/5 text-muted hover:text-foreground"
              }`}
              onClick={() => setActiveThread(thread.id)}
            >
              <p className="font-semibold text-foreground">{thread.title}</p>
              <p className="text-xs text-muted">
                {thread.messages.length} messages
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="glass-panel flex h-[70vh] flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-foreground">Chat Lab</p>
            <p className="text-xs text-muted">
              Streaming responses, markdown rendering, and per-thread model controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={regenerate} disabled={isStreaming}>
              <RefreshCcw className="h-3 w-3" />
              Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={clearChat} disabled={isStreaming}>
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={exportChat}>
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">System prompt</p>
            <Textarea
              value={activeThread?.systemPrompt ?? ""}
              onChange={(event) =>
                activeThread && setThreadSystemPrompt(activeThread.id, event.target.value)
              }
              className="mt-2 min-h-[80px]"
              placeholder="Define assistant behavior"
            />
          </div>
          {activeThread?.messages.length ? (
            activeThread.messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl border p-4 ${
                  message.role === "user"
                    ? "border-primary/30 bg-primary/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {message.role}
                </p>
                <Markdown content={message.content || (isStreaming && message.role === "assistant" ? "..." : "")} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted">
              Start by sending a prompt into the active curlgeco thread.
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Send a prompt to the selected model"
            className="min-h-[80px]"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted">
              {isStreaming ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Streaming
                </span>
              ) : (
                <span>Ready</span>
              )}
            </div>
            <div className="flex gap-2">
              {isStreaming ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    abortRef.current?.abort();
                    setIsStreaming(false);
                  }}
                >
                  <PauseCircle className="h-4 w-4" /> Stop
                </Button>
              ) : null}
              <Button
                size="sm"
                onClick={() => input.trim() && sendMessage(input.trim())}
                disabled={!input.trim() || isStreaming}
              >
                Send
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel h-[70vh] space-y-4 p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Thread settings</p>
          <p className="text-xs text-muted">Per-thread endpoint, model, and response controls.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Endpoint</p>
            <Select
              value={activeThread?.endpointId ?? settings.defaultEndpointId ?? ""}
              onValueChange={(value) =>
                activeThread && updateThread({ ...activeThread, endpointId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select endpoint" />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Model ID</p>
            <Input
              value={activeThread?.modelId ?? settings.defaultModelId ?? ""}
              onChange={(event) =>
                activeThread && updateThread({ ...activeThread, modelId: event.target.value })
              }
              placeholder="Qwen/Qwen2.5-7B-Instruct"
            />
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Parameters</p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between gap-2">
                Temperature
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={activeThread?.params.temperature ?? 0.6}
                  onChange={(event) =>
                    activeThread &&
                    setThreadParams(activeThread.id, { temperature: Number(event.target.value) })
                  }
                  className="h-8 w-20 text-right"
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                Max tokens
                <Input
                  type="number"
                  min={1}
                  max={4096}
                  value={activeThread?.params.maxTokens ?? 200}
                  onChange={(event) =>
                    activeThread &&
                    setThreadParams(activeThread.id, { maxTokens: Number(event.target.value) })
                  }
                  className="h-8 w-20 text-right"
                />
              </label>
              <label className="flex items-center justify-between gap-2">
                Top P
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={activeThread?.params.topP ?? 1}
                  onChange={(event) =>
                    activeThread &&
                    setThreadParams(activeThread.id, { topP: Number(event.target.value) })
                  }
                  className="h-8 w-20 text-right"
                />
              </label>
              <div className="flex items-center justify-between">
                <span>Stream responses</span>
                <Switch
                  checked={activeThread?.params.stream ?? true}
                  onCheckedChange={(checked) =>
                    activeThread && setThreadParams(activeThread.id, { stream: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
