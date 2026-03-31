import Link from "next/link";
import { Activity, ArrowUpRight, FlaskConical, MessageSquareText, PlugZap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardPanels from "@/components/shared/DashboardPanels";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">UGECO Model Lab</h1>
          <p className="text-sm text-muted">
            A premium playground for Hugging Face chat models — stream, test, compare.
          </p>
        </div>
        <Button asChild>
          <Link href="/chat">
            Jump into chat <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <PlugZap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Connect endpoints</p>
              <p className="text-xs text-muted">Save router + dedicated endpoints locally.</p>
            </div>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/connections">Manage connections</Link>
          </Button>
        </Card>
        <Card className="glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Chat playground</p>
              <p className="text-xs text-muted">System prompts, streaming, markdown.</p>
            </div>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/chat">Open playground</Link>
          </Button>
        </Card>
        <Card className="glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-foreground">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Test suite</p>
              <p className="text-xs text-muted">Compare outputs + export reports.</p>
            </div>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/tests">Run tests</Link>
          </Button>
        </Card>
      </div>

      <Card className="glass-panel">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Observability</p>
            <p className="text-xs text-muted">All requests and latency live in the Logs view.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/logs">Open logs</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </Card>

      <DashboardPanels />
    </div>
  );
}
