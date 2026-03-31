"use client";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export default function BrandLogo({
  compact = false,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary/30 bg-[linear-gradient(145deg,rgba(255,224,102,0.2),rgba(12,12,12,0.95))] shadow-[0_18px_38px_rgba(255,208,54,0.14)]">
        <span className="font-mono text-sm font-semibold tracking-tight text-primary">
          {"{ }"}
        </span>
      </div>
      <div className={cn("space-y-1", wordmarkClassName)}>
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-foreground">
          <span>curl</span>
          <span className="text-primary">geco</span>
        </p>
        {!compact ? (
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
            AI playground
          </p>
        ) : null}
      </div>
    </div>
  );
}
