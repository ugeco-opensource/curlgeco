"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCheck, Copy, Loader2, Play, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { TestCase, TestResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const testCaseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  prompt: z.string().min(4, "Prompt required"),
  expected: z.string().optional(),
  tags: z.string().optional(),
  temperature: z.coerce.number().min(0).max(2).optional(),
  maxTokens: z.coerce.number().min(1).max(4096).optional(),
  topP: z.coerce.number().min(0).max(1).optional(),
});

type TestCaseFormValues = z.input<typeof testCaseSchema>;

export default function TestsPage() {
  const testCases = useAppStore((state) => state.testCases);
  const addTestCase = useAppStore((state) => state.addTestCase);
  const removeTestCase = useAppStore((state) => state.removeTestCase);
  const testResults = useAppStore((state) => state.testResults);
  const setTestResults = useAppStore((state) => state.setTestResults);
  const clearTestResults = useAppStore((state) => state.clearTestResults);
  const endpoints = useAppStore((state) => state.endpoints);
  const settings = useAppStore((state) => state.settings);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [endpointId, setEndpointId] = useState(settings.defaultEndpointId ?? "");
  const [compareEndpointId, setCompareEndpointId] = useState("");
  const [modelId, setModelId] = useState(settings.defaultModelId ?? "");

  const form = useForm<TestCaseFormValues>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: {
      name: "",
      prompt: "",
      expected: "",
      tags: "",
      temperature: 0.4,
      maxTokens: 200,
      topP: 1,
    },
  });

  const endpoint = endpoints.find((item) => item.id === endpointId);
  const compareEndpoint = endpoints.find((item) => item.id === compareEndpointId);

  const createTestCase = (values: TestCaseFormValues) => {
    const temperature = values.temperature !== undefined ? Number(values.temperature) : undefined;
    const maxTokens = values.maxTokens !== undefined ? Number(values.maxTokens) : undefined;
    const topP = values.topP !== undefined ? Number(values.topP) : undefined;
    const testCase: TestCase = {
      id: nanoid(),
      name: values.name,
      prompt: values.prompt,
      expected: values.expected,
      tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      paramsOverrides: {
        temperature,
        maxTokens,
        topP,
      },
    };
    addTestCase(testCase);
    toast.success("Test case saved");
    form.reset();
    setDialogOpen(false);
  };

  const runSingle = async (targetEndpointId: string, testCase: TestCase) => {
    const targetEndpoint = endpoints.find((item) => item.id === targetEndpointId);
    if (!targetEndpoint) throw new Error("Endpoint not found");

    const start = performance.now();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: targetEndpoint,
        model: modelId || targetEndpoint.defaultModel,
        messages: [{ role: "user", content: testCase.prompt }],
        temperature: testCase.paramsOverrides?.temperature ?? 0.4,
        max_tokens: testCase.paramsOverrides?.maxTokens ?? 200,
        top_p: testCase.paramsOverrides?.topP ?? 1,
        stream: false,
      }),
    });
    const latency = Math.round(performance.now() - start);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Request failed");
    }

    const data = await response.json();
    return {
      responseText: data?.choices?.[0]?.message?.content ?? "",
      latencyMs: latency,
      tokens: data?.usage?.total_tokens,
      modelId: modelId || targetEndpoint.defaultModel,
    };
  };

  const runTests = async () => {
    if (!endpoint) {
      toast.error("Select a primary endpoint");
      return;
    }
    if (!modelId && !endpoint.defaultModel) {
      toast.error("Set a model id");
      return;
    }
    if (compareMode && !compareEndpoint) {
      toast.error("Select a comparison endpoint");
      return;
    }
    if (testCases.length === 0) {
      toast.error("Add at least one test case");
      return;
    }

    setRunning(true);
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        const primary = await runSingle(endpoint.id, testCase);
        results.push({
          id: nanoid(),
          testCaseId: testCase.id,
          endpointId: endpoint.id,
          modelId: primary.modelId,
          responseText: primary.responseText,
          latencyMs: primary.latencyMs,
          tokens: primary.tokens,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        results.push({
          id: nanoid(),
          testCaseId: testCase.id,
          endpointId: endpoint.id,
          modelId: modelId || endpoint.defaultModel,
          responseText: "",
          latencyMs: 0,
          createdAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Request failed",
        });
      }

      if (compareMode && compareEndpoint) {
        try {
          const secondary = await runSingle(compareEndpoint.id, testCase);
          results.push({
            id: nanoid(),
            testCaseId: testCase.id,
            endpointId: compareEndpoint.id,
            modelId: secondary.modelId,
            responseText: secondary.responseText,
            latencyMs: secondary.latencyMs,
            tokens: secondary.tokens,
            createdAt: new Date().toISOString(),
          });
        } catch (error) {
          results.push({
            id: nanoid(),
            testCaseId: testCase.id,
            endpointId: compareEndpoint.id,
            modelId: modelId || compareEndpoint.defaultModel,
            responseText: "",
            latencyMs: 0,
            createdAt: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Request failed",
          });
        }
      }
    }

    setTestResults(results);
    setRunning(false);
    toast.success("Test suite finished");
  };

  const resultsByCase = useMemo(() => {
    const map: Record<string, TestResult[]> = {};
    for (const result of testResults) {
      if (!map[result.testCaseId]) map[result.testCaseId] = [];
      map[result.testCaseId].push(result);
    }
    return map;
  }, [testResults]);

  const exportResults = () => {
    const blob = new Blob([JSON.stringify(testResults, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ugeco-test-results.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyMarkdown = async () => {
    const lines = ["# UGECO Model Lab Report", "", `Generated: ${new Date().toLocaleString()}`, ""];
    for (const testCase of testCases) {
      lines.push(`## ${testCase.name}`);
      lines.push(`Prompt: ${testCase.prompt}`);
      const caseResults = resultsByCase[testCase.id] ?? [];
      for (const result of caseResults) {
        lines.push(`- Endpoint: ${result.endpointId} (${result.modelId})`);
        lines.push(`  - Latency: ${result.latencyMs}ms`);
        lines.push(`  - Error: ${result.error ?? "None"}`);
      }
      lines.push("");
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Markdown report copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Testing Suite</h1>
          <p className="text-sm text-muted">Run batch prompts, compare endpoints, and export results.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New test case
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create test case</DialogTitle>
              <DialogDescription>Use tags for easy filtering later.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={form.handleSubmit(createTestCase)}>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} placeholder="Summarization sanity" />
              </div>
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea {...form.register("prompt")} placeholder="Summarize the following document..." />
              </div>
              <div className="space-y-2">
                <Label>Expected behavior</Label>
                <Textarea {...form.register("expected")} placeholder="Concise 3 bullet summary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input {...form.register("tags")} placeholder="summarization, safety" />
                </div>
                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <Input type="number" step={0.1} {...form.register("temperature")} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Max tokens</Label>
                  <Input type="number" {...form.register("maxTokens")} />
                </div>
                <div className="space-y-2">
                  <Label>Top P</Label>
                  <Input type="number" step={0.1} {...form.register("topP")} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-panel space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px]">
            <Label>Primary endpoint</Label>
            <Select value={endpointId} onValueChange={setEndpointId}>
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
          <div className="min-w-[200px]">
            <Label>Model id</Label>
            <Input value={modelId} onChange={(event) => setModelId(event.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={compareMode} onCheckedChange={setCompareMode} />
            <span className="text-sm text-muted">Compare mode</span>
          </div>
          {compareMode ? (
            <div className="min-w-[200px]">
              <Label>Compare endpoint</Label>
              <Select value={compareEndpointId} onValueChange={setCompareEndpointId}>
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
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={runTests} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run tests
          </Button>
          <Button variant="secondary" onClick={clearTestResults}>
            Clear results
          </Button>
          <Button variant="outline" onClick={exportResults}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={copyMarkdown}>
            <Copy className="h-4 w-4" /> Copy Markdown
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">Test cases</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="cases">
          <div className="grid gap-4 lg:grid-cols-2">
            {testCases.length === 0 ? (
              <Card className="glass-panel p-8 text-center text-sm text-muted">
                Create your first test case to begin benchmarking.
              </Card>
            ) : (
              testCases.map((testCase) => (
                <Card key={testCase.id} className="glass-panel space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{testCase.name}</p>
                      <p className="text-xs text-muted">{testCase.prompt}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeTestCase(testCase.id)}>
                      Remove
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {testCase.tags.map((tag) => (
                      <Badge key={tag} className="tag-gradient text-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {testCase.expected ? <p className="text-xs text-muted">Expected: {testCase.expected}</p> : null}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="results">
          <div className="space-y-4">
            {testCases.map((testCase) => {
              const caseResults = resultsByCase[testCase.id] ?? [];
              return (
                <Card key={testCase.id} className="glass-panel space-y-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{testCase.name}</p>
                    <p className="text-xs text-muted">{testCase.prompt}</p>
                  </div>
                  <div className={`grid gap-4 ${compareMode ? "lg:grid-cols-2" : ""}`}>
                    {caseResults.length === 0 ? (
                      <p className="text-sm text-muted">No results yet.</p>
                    ) : (
                      caseResults.map((result) => (
                        <div key={result.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span>{result.endpointId}</span>
                            {result.error ? (
                              <span className="text-red-400">Error</span>
                            ) : (
                              <span className="flex items-center gap-1 text-emerald-300">
                                <CheckCheck className="h-3 w-3" /> OK
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-muted">Latency: {result.latencyMs} ms</p>
                          {result.tokens ? <p className="text-xs text-muted">Tokens: {result.tokens}</p> : null}
                          {result.error ? (
                            <p className="mt-2 text-xs text-red-300">{result.error}</p>
                          ) : (
                            <p className="mt-2 text-sm text-foreground">{result.responseText}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
