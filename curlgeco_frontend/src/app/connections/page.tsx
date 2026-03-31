"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, PlugZap, Plus, Rocket } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { EndpointConfig, ProviderType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const providerLabels: Record<ProviderType, string> = {
  HF_ROUTER: "HF Router",
  HF_DEDICATED_ENDPOINT: "HF Dedicated Endpoint",
  OPENAI_COMPATIBLE_GENERIC: "OpenAI-compatible",
};

const connectionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  provider: z.enum(["HF_ROUTER", "HF_DEDICATED_ENDPOINT", "OPENAI_COMPATIBLE_GENERIC"]),
  baseUrl: z.string().url("Valid base URL required"),
  apiKey: z.string().min(8, "API key required"),
  defaultModel: z.string().min(2, "Model id required"),
  headers: z.string().optional(),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

export default function ConnectionsPage() {
  const endpoints = useAppStore((state) => state.endpoints);
  const addEndpoint = useAppStore((state) => state.addEndpoint);
  const removeEndpoint = useAppStore((state) => state.removeEndpoint);

  const [showKey, setShowKey] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { latency: number; status: string }>>({});

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
      provider: "HF_ROUTER",
      baseUrl: "https://router.huggingface.co/v1",
      apiKey: "",
      defaultModel: "",
      headers: "",
    },
  });

  const providerValue = form.watch("provider");

  const applyProviderDefaults = (provider: ProviderType) => {
    if (provider === "HF_ROUTER") {
      form.setValue("baseUrl", "https://router.huggingface.co/v1");
    }
  };

  const onSubmit = (values: ConnectionFormValues) => {
    let baseUrl = values.baseUrl;
    if (values.provider === "HF_DEDICATED_ENDPOINT" && !baseUrl.endsWith("/v1")) {
      baseUrl = `${baseUrl.replace(/\/$/, "")}/v1`;
    }
    let headers: Record<string, string> | undefined = undefined;
    if (values.headers) {
      try {
        headers = JSON.parse(values.headers);
      } catch {
        toast.error("Headers must be valid JSON");
        return;
      }
    }
    const endpoint: EndpointConfig = {
      id: nanoid(),
      name: values.name,
      provider: values.provider,
      baseUrl,
      apiKey: values.apiKey,
      defaultModel: values.defaultModel,
      headers,
      createdAt: new Date().toISOString(),
    };
    addEndpoint(endpoint);
    toast.success("Endpoint saved locally");
    setDialogOpen(false);
    form.reset();
  };

  const testConnection = async (endpoint: EndpointConfig) => {
    setTestingId(endpoint.id);
    const start = performance.now();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint,
          model: endpoint.defaultModel,
          messages: [{ role: "user", content: "Hello" }],
          temperature: 0.2,
          max_tokens: 50,
          top_p: 1,
          stream: false,
        }),
      });
      const latency = Math.round(performance.now() - start);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Connection failed");
      }
      const data = await response.json();
      setTestResults((prev) => ({
        ...prev,
        [endpoint.id]: { latency, status: data?.choices?.[0]?.message?.content ?? "Success" },
      }));
      toast.success("Connection OK");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connection failed";
      toast.error(message);
      setTestResults((prev) => ({
        ...prev,
        [endpoint.id]: { latency: Math.round(performance.now() - start), status: message },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const hasEndpoints = endpoints.length > 0;
  const sortedEndpoints = useMemo(
    () => [...endpoints].sort((a, b) => a.name.localeCompare(b.name)),
    [endpoints]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Connections</h1>
          <p className="text-sm text-muted">
            Store endpoints locally and test them against the OpenAI-compatible chat API.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add endpoint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add connection</DialogTitle>
              <DialogDescription>Keys are stored in localStorage only.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="HF Router / Llama 70B" {...form.register("name")} />
                  {form.formState.errors.name ? (
                    <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={providerValue}
                    onValueChange={(value: ProviderType) => {
                      form.setValue("provider", value);
                      applyProviderDefaults(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HF_ROUTER">HF Router</SelectItem>
                      <SelectItem value="HF_DEDICATED_ENDPOINT">HF Dedicated Endpoint</SelectItem>
                      <SelectItem value="OPENAI_COMPATIBLE_GENERIC">OpenAI-compatible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input placeholder="https://router.huggingface.co/v1" {...form.register("baseUrl")} />
                {form.formState.errors.baseUrl ? (
                  <p className="text-xs text-red-400">{form.formState.errors.baseUrl.message}</p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input
                      type={showKey ? "text" : "password"}
                      placeholder="hf_xxxxx"
                      {...form.register("apiKey")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.apiKey ? (
                    <p className="text-xs text-red-400">{form.formState.errors.apiKey.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Default model id</Label>
                  <Input placeholder="Qwen/Qwen2.5-7B-Instruct" {...form.register("defaultModel")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Advanced headers (JSON)</Label>
                <Textarea placeholder='{"X-Custom": "value"}' {...form.register("headers")} />
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save endpoint</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!hasEndpoints ? (
        <Card className="glass-panel p-8 text-center">
          <PlugZap className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-lg font-semibold text-foreground">No endpoints yet</p>
          <p className="text-sm text-muted">Add a Hugging Face router or dedicated endpoint to begin testing.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {sortedEndpoints.map((endpoint) => (
            <Card key={endpoint.id} className="glass-panel space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{endpoint.name}</p>
                  <p className="text-xs text-muted">{endpoint.baseUrl}</p>
                </div>
                <Badge className="tag-gradient text-xs text-foreground">{providerLabels[endpoint.provider]}</Badge>
              </div>
              <div className="text-sm text-muted">
                <p>Default model: <span className="text-foreground">{endpoint.defaultModel}</span></p>
                {endpoint.headers ? <p>Custom headers enabled</p> : null}
              </div>
              {testResults[endpoint.id] ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                  <p className="text-muted">Last test</p>
                  <p className="text-foreground">{testResults[endpoint.id].status}</p>
                  <p className="text-muted">{testResults[endpoint.id].latency} ms</p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => testConnection(endpoint)}
                  disabled={testingId === endpoint.id}
                >
                  {testingId === endpoint.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  Test connection
                </Button>
                <Button variant="outline" size="sm" onClick={() => removeEndpoint(endpoint.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
