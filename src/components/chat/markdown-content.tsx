"use client";

/**
 * Markdown renderer for AI responses.
 *
 * Safety: react-markdown does NOT render raw HTML by default (no
 * rehype-raw), so untrusted model output cannot inject markup. Code is
 * highlighted server-of-build with rehype-highlight (class names only).
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "@/components/chat/code-block";

export interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre({ children }) {
            // Extract language + code text from the inner <code> element
            // produced by rehype-highlight, then wrap with our CodeBlock.
            const child = Array.isArray(children) ? children[0] : children;
            const props =
              child && typeof child === "object" && "props" in child
                ? (child.props as { className?: string; children?: React.ReactNode })
                : undefined;
            const match = /language-(\S+)/.exec(props?.className ?? "");
            return (
              <CodeBlock language={match?.[1] ?? ""}>{children}</CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
