"use client";

import Link from "next/link";
import BrandLogo from "@/components/shared/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 px-6 py-5 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BrandLogo compact />
        <div className="text-xs uppercase tracking-[0.24em] text-muted">
          <span className="text-foreground">curlgeco</span>
          <span> by </span>
          <Link href="https://ugeco.in" className="text-primary transition hover:text-primary/80">
            ugeco
          </Link>
        </div>
      </div>
    </footer>
  );
}
