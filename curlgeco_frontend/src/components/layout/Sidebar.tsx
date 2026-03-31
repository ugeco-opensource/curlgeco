"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FlaskConical,
  LayoutDashboard,
  MessageSquareText,
  PlugZap,
  Settings,
} from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Connections", href: "/connections", icon: PlugZap },
  { label: "Chat", href: "/chat", icon: MessageSquareText },
  { label: "Tests", href: "/tests", icon: FlaskConical },
  { label: "Logs", href: "/logs", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-primary/10 bg-[linear-gradient(180deg,rgba(9,9,9,0.96),rgba(18,18,18,0.92))] px-6 py-8 backdrop-blur-lg lg:flex">
      <BrandLogo />
      <nav className="mt-10 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-primary/30 bg-primary/12 text-foreground shadow-[0_16px_34px_rgba(255,208,54,0.08)]"
                  : "border-transparent text-muted hover:border-primary/20 hover:bg-white/4 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl border border-primary/15 bg-[linear-gradient(180deg,rgba(255,224,102,0.08),rgba(255,255,255,0.02))] p-4 text-xs text-muted">
        <p className="font-semibold uppercase tracking-[0.24em] text-foreground">
          Local-first workspace
        </p>
        <p className="mt-2 leading-6">
          Connections, chats, tests, and logs stay in browser storage until you
          wire Supabase persistence later.
        </p>
      </div>
    </aside>
  );
}
