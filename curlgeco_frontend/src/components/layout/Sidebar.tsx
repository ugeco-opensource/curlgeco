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
    <aside className="hidden h-screen w-64 flex-col border-r border-white/10 bg-[#070b18]/80 px-6 py-8 backdrop-blur-lg lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-secondary/70 text-white shadow-lg">
          U
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">UGECO Lab</p>
          <p className="text-xs text-muted">Model testing suite</p>
        </div>
      </div>
      <nav className="mt-10 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-white/10 text-foreground shadow-lg"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-muted">
        <p className="font-semibold text-foreground">Local-only storage</p>
        <p className="mt-1">Connections + keys are stored in browser localStorage.</p>
      </div>
    </aside>
  );
}
