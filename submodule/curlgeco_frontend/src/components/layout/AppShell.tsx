"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Connections", href: "/connections" },
  { label: "Chat", href: "/chat" },
  { label: "Tests", href: "/tests" },
  { label: "Logs", href: "/logs" },
  { label: "Settings", href: "/settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.settings.theme);
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const config = useRuntimeConfig();
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!config.requireAuth || isAuthRoute || !auth.initialized || !auth.enabled) {
      return;
    }

    if (!auth.user) {
      router.replace("/auth");
    }
  }, [auth.enabled, auth.initialized, auth.user, config.requireAuth, isAuthRoute, router]);

  useEffect(() => {
    if (!config.requireAuth || !isAuthRoute || !auth.initialized) {
      return;
    }

    if (auth.user) {
      router.replace("/");
    }
  }, [auth.initialized, auth.user, config.requireAuth, isAuthRoute, router]);

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-grid">
        <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    );
  }

  if (config.requireAuth && !auth.enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel max-w-2xl space-y-4 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">
            Auth configuration required
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Supabase must be configured before protected mode can run.
          </h1>
          <p className="text-sm leading-7 text-muted">
            Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then restart the app.
          </p>
        </div>
      </div>
    );
  }

  if (config.requireAuth && (!auth.initialized || !auth.user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-white/5 px-5 py-3 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Preparing your workspace
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <div className="border-b border-primary/10 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold",
                    pathname === link.href
                      ? "bg-primary/15 text-foreground"
                      : "text-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
