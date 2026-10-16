"use client";

/**
 * Scrollable message list with smooth auto-scroll to the latest message.
 */
import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import { MessageBubble } from "@/components/chat/message-bubble";
import { EmptyState } from "@/components/chat/empty-state";
import { useT } from "@/hooks/use-settings";

export interface MessageListProps {
  messages: ChatMessage[];
  isBusy: boolean;
  onRetry: (messageId: string) => void;
  onRegenerate: () => void;
  onSuggestion: (text: string) => void;
}

export function MessageList({
  messages,
  isBusy,
  onRetry,
  onRegenerate,
  onSuggestion,
}: MessageListProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    // Stick to bottom only when the user is already near the bottom.
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 220) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div
      ref={scrollRef}
      className="thin-scrollbar flex-1 overflow-y-auto overflow-x-hidden"
      aria-label={t("messagesLabel")}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <EmptyState onSuggestion={onSuggestion} />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastAssistant={message.id === lastAssistantId}
              isBusy={isBusy}
              copyLabel={t("copyMessage")}
              copiedLabel={t("copied")}
              retryLabel={t("retry")}
              regenerateLabel={t("regenerate")}
              stoppedLabel={t("stoppedNotice")}
              errorLabel={errorLabelFor(message.errorCode, t)}
              onRetry={() => onRetry(message.id)}
              onRegenerate={onRegenerate}
            />
          ))
        )}
        <div ref={bottomRef} className="h-2 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}

function errorLabelFor(
  code: string | undefined,
  t: ReturnType<typeof useT>
): string {
  switch (code) {
    case "network":
      return t("errorNetwork");
    case "bad_request":
      return t("errorBadRequest");
    case "rate_limited":
      return t("errorRateLimited");
    case "not_configured":
      return t("errorNotConfigured");
    case "provider_auth":
      return t("errorProviderAuth");
    case "provider_rate_limited":
      return t("errorProviderRateLimited");
    case "provider_unavailable":
      return t("errorProviderUnavailable");
    case "provider_error":
      return t("errorProviderError");
    case "timeout":
      return t("errorTimeout");
    default:
      return t("errorInternal");
  }
}
