"use client";

import { createContext, useContext } from "react";
import type { RuntimeConfig } from "@/lib/runtime-config";

const RuntimeConfigContext = createContext<RuntimeConfig | null>(null);

export function RuntimeConfigProvider({
  children,
  config,
}: Readonly<{
  children: React.ReactNode;
  config: RuntimeConfig;
}>) {
  return (
    <RuntimeConfigContext.Provider value={config}>
      {children}
    </RuntimeConfigContext.Provider>
  );
}

export const useRuntimeConfig = () => {
  const context = useContext(RuntimeConfigContext);
  if (!context) {
    throw new Error("Runtime config is unavailable.");
  }
  return context;
};
