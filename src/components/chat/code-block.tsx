"use client";

/**
 * Code block with language label and a Copy Code button.
 * Highlighted HTML comes from rehype-highlight (already sanitized by
 * react-markdown — no raw HTML is rendered).
 */
import { useCallback, useRef, useState } from "react";
import { IconCheck, IconCopy } from "@/components/icons";

export interface CodeBlockProps {
  language: string;
  /** Rendered <pre> element from react-markdown (highlighted spans inside). */
  children: React.ReactNode;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked — silently ignore.
    }
  }, []);

  return (
    <div className="code-block group">
      <div className="code-block-header">
        <span>{language || "code"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.68rem] normal-case tracking-normal text-mist hover:text-ink hover:bg-surface-2/80 transition-colors cursor-pointer"
        >
          {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}
