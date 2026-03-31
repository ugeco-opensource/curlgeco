"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleUserRound, LogOut, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";
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
  const { enabled, user, signOut } = useAuth();
  const config = useRuntimeConfig();

  const selectedEndpoint = endpoints.find((item) => item.id === settings.defaultEndpointId);

  return (
    <div className="sticky top-0 z-40 flex flex-col gap-4 border-b border-primary/10 bg-[rgba(10,10,10,0.82)] px-6 py-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-white/6">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">
            Active session
          </p>
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
        <div className="flex flex-wrap items-center gap-2">
          {enabled && user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-primary/15 bg-white/4 px-3 py-2 text-xs text-muted sm:flex">
                <CircleUserRound className="h-4 w-4 text-primary" />
                <span className="max-w-[220px] truncate">{user.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await signOut();
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Signed out");
                  router.push("/auth");
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : enabled || config.requireAuth ? (
            <Button variant="outline" asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
          ) : (
            <div className="rounded-full border border-primary/15 bg-white/4 px-3 py-2 text-xs uppercase tracking-[0.24em] text-muted">
              Guest mode
            </div>
          )}
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
    </div>
  );
}
