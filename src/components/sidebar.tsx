"use client";

/**
 * Application sidebar: branding, new chat, conversation history
 * (rename / delete inline), clear history, settings + info links.
 * Desktop: fixed column. Mobile: slide-in drawer with overlay.
 */
import { useEffect, useRef, useState } from "react";
import type { Conversation, ModelsInfo } from "@/lib/types";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  IconAlert,
  IconChat,
  IconClose,
  IconPencil,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@/components/icons";
import { useT } from "@/hooks/use-settings";
import { cn, formatTime } from "@/lib/utils";

export interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  modelsInfo: ModelsInfo | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDeleteRequest: (id: string) => void;
  onClearRequest: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  open,
  modelsInfo,
  onSelect,
  onNewChat,
  onRename,
  onDeleteRequest,
  onClearRequest,
  onOpenSettings,
  onClose,
}: SidebarProps) {
  const t = useT();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const locale = typeof document !== "undefined" ? document.documentElement.lang : "en";

  useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingId]);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const startRename = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setDraft(conversation.title);
  };

  const commitRename = () => {
    if (editingId && draft.trim()) {
      onRename(editingId, draft);
    }
    setEditingId(null);
    setDraft("");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col border-r border-hairline bg-cosmos/95 backdrop-blur-xl",
          "transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1.5 text-mist hover:text-ink hover:bg-surface-2/70 transition-colors lg:hidden cursor-pointer"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* New chat */}
        <div className="px-4">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => {
              onNewChat();
              onClose();
            }}
          >
            <IconPlus size={16} />
            {t("newChat")}
          </Button>
        </div>

        {/* Model notice (when not configured) */}
        {modelsInfo && !modelsInfo.configured && (
          <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/8 px-3 py-2.5">
            <IconAlert size={15} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="text-[0.72rem] font-semibold text-danger">
                {t("modelNotConfigured")}
              </p>
              <p className="mt-0.5 text-[0.66rem] leading-snug text-mist">
                {t("modelNotConfiguredHint")}
              </p>
            </div>
          </div>
        )}

        {/* Conversation history */}
        <nav className="mt-5 flex min-h-0 flex-1 flex-col px-3" aria-label={t("chatHistory")}>
          <h2 className="px-2 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-mist-dim">
            {t("chatHistory")}
          </h2>
          <ul className="thin-scrollbar flex-1 space-y-0.5 overflow-y-auto pb-3">
            {conversations.length === 0 && (
              <li className="px-2 py-3 text-xs text-mist-dim">{t("noChatsYet")}</li>
            )}
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeId;
              return (
                <li key={conversation.id}>
                  {editingId === conversation.id ? (
                    <div className="px-1.5 py-1">
                      <input
                        ref={editInputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingId(null);
                          }
                        }}
                        maxLength={120}
                        aria-label={t("rename")}
                        className="w-full rounded-lg border border-accent-2/60 bg-surface px-2.5 py-1.5 text-xs text-ink outline-none"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex items-center gap-1 rounded-xl transition-colors",
                        isActive
                          ? "bg-accent-2/16 border border-accent-2/40"
                          : "border border-transparent hover:bg-surface-2/60"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(conversation.id);
                          onClose();
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left cursor-pointer"
                        aria-current={isActive ? "true" : undefined}
                      >
                        <IconChat
                          size={14}
                          className={cn(
                            "shrink-0",
                            isActive ? "text-accent-2" : "text-mist-dim"
                          )}
                        />
                        <span className="flex min-w-0 flex-col">
                          <span
                            className={cn(
                              "truncate text-[0.8rem]",
                              isActive ? "text-ink font-medium" : "text-mist"
                            )}
                          >
                            {conversation.title}
                          </span>
                          <span className="truncate text-[0.62rem] text-mist-dim">
                            {formatTime(conversation.updatedAt, locale)}
                          </span>
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center pr-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => startRename(conversation)}
                          aria-label={`${t("rename")}: ${conversation.title}`}
                          className="rounded-md p-1.5 text-mist-dim hover:text-ink hover:bg-surface-2 cursor-pointer"
                        >
                          <IconPencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(conversation.id)}
                          aria-label={`${t("delete")}: ${conversation.title}`}
                          className="rounded-md p-1.5 text-mist-dim hover:text-danger hover:bg-danger/10 cursor-pointer"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-hairline px-3 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-danger hover:bg-danger/10 hover:text-danger"
            onClick={onClearRequest}
            disabled={conversations.length === 0}
          >
            <IconTrash size={14} />
            {t("clearHistory")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start"
            onClick={onOpenSettings}
          >
            <IconSettings size={14} />
            {t("settings")}
          </Button>
          <p className="mt-2.5 px-2 text-[0.6rem] leading-relaxed text-mist-dim">
            {t("poweredBy")}
          </p>
        </div>
      </aside>
    </>
  );
}
