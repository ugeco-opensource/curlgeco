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
    <aside className="hidden h-screen w-72 flex-col border-r border-border bg-[#0e0e12] px-6 py-8 lg:flex">
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
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-transparent text-muted hover:border-border hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
