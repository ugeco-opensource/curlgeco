"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPanels() {
  const endpoints = useAppStore((state) => state.endpoints);
  const testResults = useAppStore((state) => state.testResults);
  const logs = useAppStore((state) => state.logs);

  const recentLogs = useMemo(() => logs.slice(0, 4), [logs]);
  const recentTests = useMemo(() => testResults.slice(0, 4), [testResults]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="glass-panel space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">
            Workspace snapshot
          </p>
          <p className="text-xs text-muted">What curlgeco is carrying right now.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="tag-gradient text-foreground">{endpoints.length} endpoints</Badge>
          <Badge className="tag-gradient text-foreground">{testResults.length} test results</Badge>
          <Badge className="tag-gradient text-foreground">{logs.length} log entries</Badge>
        </div>
      </Card>
      <Card className="glass-panel space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">
            Recent activity
          </p>
          <p className="text-xs text-muted">Latest tests and replayable logs.</p>
        </div>
        <div className="space-y-2">
          {recentLogs.length === 0 && recentTests.length === 0 ? (
            <p className="text-xs text-muted">No activity yet.</p>
          ) : (
            <>
              {recentLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                  <p className="text-muted">Log · {log.modelId}</p>
                  <p className="text-foreground">{log.latencyMs} ms</p>
                </div>
              ))}
              {recentTests.map((result) => (
                <div key={result.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                  <p className="text-muted">Test · {result.modelId}</p>
                  <p className="text-foreground">{result.latencyMs} ms</p>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
