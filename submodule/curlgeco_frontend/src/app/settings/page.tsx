"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Download, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";
import { APP_STORAGE_KEY } from "@/lib/runtime-config";
import { useAppStore } from "@/lib/store";
import { buildExportPayload, parseImportPayload } from "@/lib/storage/export";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const auth = useAuth();
  const config = useRuntimeConfig();
  const endpoints = useAppStore((state) => state.endpoints);
  const threads = useAppStore((state) => state.threads);
  const testCases = useAppStore((state) => state.testCases);
  const testResults = useAppStore((state) => state.testResults);
  const logs = useAppStore((state) => state.logs);
  const settings = useAppStore((state) => state.settings);
  const setTestResults = useAppStore((state) => state.setTestResults);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportData = () => {
    const payload = buildExportPayload(endpoints, threads, testCases, testResults, logs, settings);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "curlgeco-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const raw = await file.text();
    const parsed = parseImportPayload(raw);
    localStorage.setItem(
      APP_STORAGE_KEY,
      JSON.stringify({
        state: {
          endpoints: parsed.endpoints,
          threads: parsed.threads,
          testCases: parsed.testCases,
          testResults: parsed.testResults,
          logs: parsed.logs,
          settings: parsed.settings,
        },
        version: 0,
      })
    );
    setTestResults(parsed.testResults);
    toast.success("Import complete. Refresh to apply.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted">Environment status and data portability.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Authentication</p>
            <p className="text-xs text-muted">Supabase drives signup and login for now.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
            <p className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {auth.enabled ? "Supabase configured" : "Supabase not configured"}
            </p>
            <p className="mt-3 leading-7">
              {auth.enabled
                ? config.requireAuth
                  ? "Protected mode is enabled for this deployment."
                  : "Users can sign in, but guest mode is still allowed."
                : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth."}
            </p>
          </div>
        </Card>

        <Card className="glass-panel space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Analytics</p>
            <p className="text-xs text-muted">Google Tag Manager loads only when configured.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
            <p className="text-foreground">{config.gtmId ? config.gtmId : "GTM disabled"}</p>
            <p className="mt-3 leading-7">
              Add <code>NEXT_PUBLIC_GTM_ID</code> to activate GTM without changing the app code.
            </p>
          </div>
        </Card>
      </div>

      <Card className="glass-panel space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Import / Export</p>
          <p className="text-xs text-muted">Move configs and results between browsers.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportData}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                importData(file);
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
}
