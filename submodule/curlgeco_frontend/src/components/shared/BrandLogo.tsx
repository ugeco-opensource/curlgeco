"use client";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

/**
 * The `{}` path is the outlined master from curlgeco-brand-pack/svg, so the
 * in-app mark and the favicon are the same artwork. The wordmark is set live
 * in Inter Tight at the pack's weight and tracking.
 */
const BRACE_PATH =
  "M196.8 419.84Q176.26 419.84 161.28 411.66Q146.31 403.47 139.17 389.02Q132.03 374.57 134.12 355.42L139.34 304.93Q140.39 293.78 134.64 287.17Q128.9 280.55 118.45 280.55H69.7V231.8H118.45Q128.9 231.8 134.64 225.01Q140.39 218.22 139.34 207.42L134.12 154.84Q132.38 136.04 139.52 121.93Q146.66 107.83 161.46 100Q176.26 92.16 196.8 92.16H226.4V140.91H207.25Q197.15 140.91 191.4 146.66Q185.66 152.4 186.35 161.81L191.58 214.39Q192.97 226.92 186.53 236.5Q180.09 246.08 167.55 251.47Q155.01 256.87 137.6 256.87V254.43Q155.01 254.43 167.55 260Q180.09 265.58 186.53 275.33Q192.97 285.08 191.58 297.96L186.35 350.19Q185.31 359.6 191.06 365.34Q196.8 371.09 207.25 371.09H226.4V419.84ZM285.6 419.84V371.09H304.75Q315.2 371.09 320.94 365.34Q326.69 359.6 325.65 350.19L320.42 297.96Q319.38 285.08 325.65 275.33Q331.91 265.58 344.62 260Q357.33 254.43 374.4 254.43V256.87Q348.63 256.87 333.65 245.03Q318.68 233.19 320.42 214.39L325.65 161.81Q326.34 152.4 320.6 146.66Q314.85 140.91 304.75 140.91H285.6V92.16H315.2Q335.74 92.16 350.37 100Q364.99 107.83 372.48 121.93Q379.97 136.04 377.88 154.84L372.66 207.42Q371.61 218.22 377.36 225.01Q383.1 231.8 393.55 231.8H442.3V280.55H393.55Q383.1 280.55 377.36 287.17Q371.61 293.78 372.66 304.93L377.88 355.42Q379.97 374.57 372.66 389.02Q365.34 403.47 350.54 411.66Q335.74 419.84 315.2 419.84Z";

export function BraceMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="curlgeco"
      className={cn("h-10 w-10", className)}
    >
      <rect width="512" height="512" rx="112" ry="112" fill="var(--cg-primary)" />
      <path fill="var(--cg-bg)" d={BRACE_PATH} />
    </svg>
  );
}

export default function BrandLogo({
  compact = false,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BraceMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <div className={cn("leading-none", wordmarkClassName)}>
        <p
          className={cn(
            "font-bold tracking-[-0.015em] text-foreground",
            compact ? "text-lg" : "text-xl"
          )}
        >
          <span>curl</span>
          <span className="text-primary">geco</span>
        </p>
        {!compact ? (
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            AI playground
          </p>
        ) : null}
      </div>
    </div>
  );
}
