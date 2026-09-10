"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  FlaskConical,
  MessageSquareText,
  PlugZap,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";
import DashboardPanels from "@/components/shared/DashboardPanels";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const workspaceCards = [
  {
    title: "Connections",
    copy: "Save Hugging Face router, dedicated, or generic OpenAI-compatible endpoints.",
    href: "/connections",
    icon: PlugZap,
  },
  {
    title: "Chat Lab",
    copy: "Stream completions, tune system prompts, and export sessions.",
    href: "/chat",
    icon: MessageSquareText,
  },
  {
    title: "Test Runs",
    copy: "Benchmark prompt packs, compare endpoints, and share markdown reports.",
    href: "/tests",
    icon: FlaskConical,
  },
  {
    title: "Replay Logs",
    copy: "Inspect every request, latency pattern, and failure replay path.",
    href: "/logs",
    icon: Activity,
  },
];

export default function DashboardPage() {
  const auth = useAuth();
  const config = useRuntimeConfig();

  return (
    <div className="space-y-8">
      <Card className="glass-panel card-glow overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_360px]">
          <div className="space-y-6">
            <BrandLogo />
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-primary">
                curlgeco workspace
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-foreground lg:text-6xl">
                An AI playground built for fast prompt iteration and clean deployment paths.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted">
                curlgeco keeps endpoint testing, streaming chat, evaluation runs,
                and exportable logs in one place while staying ready for Supabase auth,
                Google Tag Manager, Docker, and AKS Helm rollout.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/chat">
                  Open chat lab
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/connections">Configure endpoints</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="rounded-3xl border border-primary/15 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Access control
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {auth.enabled
                  ? auth.user?.email || "Supabase enabled"
                  : "Guest mode active"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted">
                {auth.enabled
                  ? config.requireAuth
                    ? "Protected mode is active for this deployment."
                    : "Users can sign in, but guest browsing is still allowed."
                  : "Authentication is optional until Supabase env vars are provided."}
              </p>
            </Card>
            <Card className="rounded-3xl border border-primary/15 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Tracking
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {config.gtmId ? config.gtmId : "Google Tag Manager disabled"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted">
                GTM loads only when <code>NEXT_PUBLIC_GTM_ID</code> is present.
              </p>
            </Card>
            <Card className="rounded-3xl border border-primary/15 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Deployment
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                curlgeco.ugeco.in
              </p>
              <p className="mt-2 text-sm leading-7 text-muted">
                Helm is wired for the shared public <code>nginx</code> ingress and
                the <code>letsencrypt-ugeco-dns</code> cluster issuer.
              </p>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {workspaceCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="glass-panel p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-white/5">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-5 text-lg font-semibold text-foreground">{card.title}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{card.copy}</p>
              <Button variant="secondary" className="mt-5" asChild>
                <Link href={card.href}>
                  Open
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="glass-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              Implementation notes
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              curlgeco by ugeco
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              The frontend remains local-first for endpoint secrets and test runs.
              Supabase adds user access without introducing a custom backend, and
              provider calls are made directly from the browser to each configured endpoint.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/15 bg-white/4 px-4 py-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              No API keys are written to server logs.
            </div>
          </div>
        </div>
      </Card>

      <DashboardPanels />
    </div>
  );
}
