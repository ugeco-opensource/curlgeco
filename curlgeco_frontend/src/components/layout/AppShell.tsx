"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="min-h-screen bg-grid">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <div className="lg:hidden border-b border-white/10 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold",
                    pathname === link.href
                      ? "bg-white/10 text-foreground"
                      : "text-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
