"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { RuntimeConfigProvider } from "@/components/providers/RuntimeConfigProvider";
import type { RuntimeConfig } from "@/lib/runtime-config";

export default function AppProviders({
  children,
  config,
}: Readonly<{
  children: React.ReactNode;
  config: RuntimeConfig;
}>) {
  return (
    <RuntimeConfigProvider config={config}>
      <AuthProvider>{children}</AuthProvider>
    </RuntimeConfigProvider>
  );
}
