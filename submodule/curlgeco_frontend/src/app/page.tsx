"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  FlaskConical,
  Github,
  MessageSquareText,
  PlugZap,
} from "lucide-react";
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
  return (
    <div className="space-y-8">
      <Card className="glass-panel card-glow overflow-hidden p-6 sm:p-10">
        <div className="space-y-6">
          <BrandLogo />
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground lg:text-6xl">
              An AI playground for fast prompt iteration.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted">
              Point curlgeco at any Hugging Face or OpenAI-compatible endpoint, then
              stream chat, run prompt suites, and replay every request. Your endpoints,
              keys, and history stay in your browser.
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
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {workspaceCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.href} className="glass-panel flex flex-col p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-white/5">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-5 text-lg font-semibold text-foreground">{card.title}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{card.copy}</p>
              <div className="mt-auto pt-5">
                <Button variant="secondary" asChild>
                  <Link href={card.href}>
                    Open
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="glass-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">
              curlgeco by{" "}
              <a
                href="https://ugeco.in"
                target="_blank"
                rel="noreferrer"
                className="text-primary transition hover:text-[#fde047]"
              >
                ugeco
              </a>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Open source, and there is no curlgeco server: the app is a static
              site, so your keys go straight from your browser to the endpoint you
              configured and nowhere else.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/ugeco-opensource/curlgeco"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </Card>

      <DashboardPanels />
    </div>
  );
}
