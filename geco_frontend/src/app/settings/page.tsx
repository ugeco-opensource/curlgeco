"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { buildExportPayload, parseImportPayload } from "@/lib/storage/export";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const endpoints = useAppStore((state) => state.endpoints);
  const threads = useAppStore((state) => state.threads);
  const testCases = useAppStore((state) => state.testCases);
  const testResults = useAppStore((state) => state.testResults);
  const logs = useAppStore((state) => state.logs);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const setTestResults = useAppStore((state) => state.setTestResults);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportData = () => {
    const payload = buildExportPayload(endpoints, threads, testCases, testResults, logs, settings);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ugeco-lab-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const raw = await file.text();
    const parsed = parseImportPayload(raw);
    localStorage.setItem(
      "ugeco-model-lab",
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
        <p className="text-sm text-muted">Theme, defaults, and data portability.</p>
      </div>
      <Card className="glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Theme</p>
            <p className="text-xs text-muted">Dark is the default UGECO look.</p>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs">Light</Label>
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(checked) => updateSettings({ theme: checked ? "dark" : "light" })}
            />
            <Label className="text-xs">Dark</Label>
          </div>
        </div>
      </Card>

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
