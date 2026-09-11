"use client";

import { Github } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-6 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BrandLogo compact />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span>
            <span className="text-foreground">curlgeco</span> by{" "}
            <a
              href="https://ugeco.in"
              target="_blank"
              rel="noreferrer"
              className="text-primary transition hover:text-[#fde047]"
            >
              ugeco
            </a>
          </span>
          <a
            href="https://github.com/ugeco-opensource/curlgeco"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
