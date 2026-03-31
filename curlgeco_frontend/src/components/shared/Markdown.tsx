"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "").replace(/\n$/, "");

  if (inline) {
    return (
      <code className={cn("rounded bg-white/10 px-1 py-0.5 text-xs", className)}>{children}</code>
    );
  }

  const language = className?.replace("language-", "") ?? "";

  return (
    <div className="group relative">
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {language ? (
          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-muted">
            {language}
          </span>
        ) : null}
        <button
          type="button"
          className="rounded-full bg-white/10 p-1 text-muted hover:text-foreground"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <pre className={cn("rounded-2xl border border-white/10 bg-[#050912] p-4 text-xs leading-relaxed", className)}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose max-w-none text-sm text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypePrism]}
        components={{
          code: ({ inline, className, children }: any) => (
            <CodeBlock inline={inline} className={className}>
              {children}
            </CodeBlock>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
