"use client";

/**
 * Message bubble for user and assistant messages.
 */
import { useCallback, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { IconCheck, IconCopy, IconRefresh } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: ChatMessage;
  isLastAssistant: boolean;
  isBusy: boolean;
  copyLabel: string;
  copiedLabel: string;
  retryLabel: string;
  regenerateLabel: string;
  stoppedLabel: string;
  errorLabel: string;
  onRetry: () => void;
  onRegenerate: () => void;
}

export function MessageBubble({
  message,
  isLastAssistant,
  isBusy,
  copyLabel,
  copiedLabel,
  retryLabel,
  regenerateLabel,
  stoppedLabel,
  errorLabel,
  onRetry,
  onRegenerate,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked.
    }
  }, [message.content]);

  return (
    <article
      className={cn(
        "animate-fade-in-up flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
      aria-label={isUser ? "Your message" : "Nova AI response"}
    >
      {!isUser && (
        <div className="mt-1 shrink-0">
          <LogoMark size={26} />
        </div>
      )}

      <div className={cn("flex max-w-[min(46rem,88%)] flex-col gap-1.5", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "glass border-accent-2/30 bg-accent-2/12 text-ink"
              : "glass-strong rounded-tl-md"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed">
              {message.content}
            </p>
          ) : message.error ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-sm leading-relaxed text-danger">{errorLabel}</p>
              <div>
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink hover:border-accent-2 hover:bg-surface-2/70 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <IconRefresh size={13} />
                  {retryLabel}
                </button>
              </div>
            </div>
          ) : (
            <>
              <MarkdownContent content={message.content} />
              {message.pending && message.content.length === 0 && (
                <div className="flex items-center gap-1.5 py-1" aria-label="Generating response">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent-2" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent-2" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-accent-2" />
                </div>
              )}
              {message.stopped && (
                <p className="mt-2 text-xs italic text-mist-dim">{stoppedLabel}</p>
              )}
            </>
          )}
        </div>

        {/* Actions row */}
        {!message.pending && message.content.length > 0 && (
          <div
            className={cn(
              "flex items-center gap-1 px-1",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? copiedLabel : copyLabel}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.72rem] text-mist-dim hover:text-ink hover:bg-surface-2/70 transition-colors cursor-pointer"
            >
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
              {copied ? copiedLabel : copyLabel}
            </button>
            {!isUser && isLastAssistant && !message.error && (
              <button
                type="button"
                onClick={onRegenerate}
                disabled={isBusy}
                aria-label={regenerateLabel}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.72rem] text-mist-dim hover:text-ink hover:bg-surface-2/70 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <IconRefresh size={12} />
                {regenerateLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
