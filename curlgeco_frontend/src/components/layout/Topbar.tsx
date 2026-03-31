"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Topbar() {
  const router = useRouter();
  const endpoints = useAppStore((state) => state.endpoints);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const addThread = useAppStore((state) => state.addThread);

  const selectedEndpoint = useMemo(
    () => endpoints.find((item) => item.id === settings.defaultEndpointId),
    [endpoints, settings.defaultEndpointId]
  );

  return (
    <div className="sticky top-0 z-40 flex flex-col gap-4 border-b border-white/10 bg-[#070b18]/80 px-6 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Active session</p>
          <p className="text-xs text-muted">
            {selectedEndpoint?.name ?? "No endpoint selected"}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Select
            value={settings.defaultEndpointId ?? ""}
            onValueChange={(value) => updateSettings({ defaultEndpointId: value })}
          >
            <SelectTrigger className="min-w-[220px]">
              <SelectValue placeholder="Select endpoint" />
            </SelectTrigger>
            <SelectContent>
              {endpoints.length === 0 ? (
                <SelectItem value="none" disabled>
                  No endpoints yet
                </SelectItem>
              ) : (
                endpoints.map((endpoint) => (
                  <SelectItem key={endpoint.id} value={endpoint.id}>
                    {endpoint.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Input
            placeholder="Default model id"
            value={settings.defaultModelId ?? ""}
            onChange={(event) => updateSettings({ defaultModelId: event.target.value })}
            className="min-w-[220px]"
          />
        </div>
        <Button
          onClick={() => {
            addThread();
            router.push("/chat");
          }}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>
    </div>
  );
}
