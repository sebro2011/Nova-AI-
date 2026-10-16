"use client";

/**
 * Main chat workspace: orchestrates sidebar, message list, composer,
 * streaming requests, retry/regenerate, settings and confirmations.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelsInfo } from "@/lib/types";
import { useConversations } from "@/hooks/use-conversations";
import { useSettings, useT } from "@/hooks/use-settings";
import { useToast } from "@/components/ui/toast";
import { Sidebar } from "@/components/sidebar";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { IconMenu, IconSettings } from "@/components/icons";
import { ChatRequestError, streamChatRequest } from "@/lib/chat-client";
import { LogoMark } from "@/components/logo";

export function ChatWorkspace() {
  const t = useT();
  const { settings, setModel } = useSettings();
  const { showToast } = useToast();
  const store = useConversations();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [modelsInfo, setModelsInfo] = useState<ModelsInfo | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  // Streaming append buffer: keeps deltas correct across React batching.
  const deltaBuffer = useRef<Map<string, string>>(new Map());
  const appendDelta = useCallback(
    (conversationId: string, messageId: string, delta: string): string => {
      const key = `${conversationId}:${messageId}`;
      const next = (deltaBuffer.current.get(key) ?? "") + delta;
      deltaBuffer.current.set(key, next);
      return next;
    },
    []
  );

  // Fetch configured model info once.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ModelsInfo | null) => {
        if (!cancelled && data) setModelsInfo(data);
      })
      .catch(() => {
        // Ignore — UI degrades gracefully without model info.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Warn on storage failures.
  useEffect(() => {
    if (store.storageWarning) {
      showToast(t("storageWarning"), "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.storageWarning]);

  const runAssistant = useCallback(
    async (
      conversationId: string,
      history: Array<{ role: "user" | "assistant"; content: string }>
    ) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setIsBusy(true);

      const assistantId = store.appendMessage(conversationId, "assistant", "");
      store.updateMessage(conversationId, assistantId, { pending: true });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await streamChatRequest({
          conversationId,
          messages: history,
          model: settings.model,
          locale: settings.locale,
          signal: controller.signal,
          onDelta: (text) => {
            store.updateMessage(conversationId, assistantId, {
              content: appendDelta(conversationId, assistantId, text),
            });
          },
        });
        store.updateMessage(conversationId, assistantId, {
          pending: false,
          error: false,
          stopped: result.truncated || undefined,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          store.updateMessage(conversationId, assistantId, { pending: false, stopped: true });
        } else {
          const code =
            error instanceof ChatRequestError ? error.code : "internal_error";
          store.updateMessage(conversationId, assistantId, {
            pending: false,
            error: true,
            errorCode: code,
          });
        }
      } finally {
        busyRef.current = false;
        setIsBusy(false);
        abortRef.current = null;
      }
    },
    [store, settings.model, settings.locale, appendDelta]
  );

  const sendText = useCallback(
    (text: string) => {
      if (busyRef.current) return;
      const existing = store.activeConversation;
      let conversationId: string;
      let history: Array<{ role: "user" | "assistant"; content: string }>;

      if (existing) {
        conversationId = existing.id;
        history = [
          ...existing.messages
            .filter((m) => !m.error && m.content.length > 0)
            .map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: text },
        ];
      } else {
        conversationId = store.createConversation();
        history = [{ role: "user" as const, content: text }];
      }

      store.appendMessage(conversationId, "user", text);
      void runAssistant(conversationId, history);
    },
    [store, runAssistant]
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      const conversation = store.activeConversation;
      if (!conversation || busyRef.current) return;
      const index = conversation.messages.findIndex((m) => m.id === messageId);
      if (index === -1) return;
      const history = conversation.messages
        .slice(0, index)
        .filter((m) => !m.error && m.content.length > 0)
        .map((m) => ({ role: m.role, content: m.content }));
      store.removeMessage(conversation.id, messageId);
      deltaBuffer.current.delete(`${conversation.id}:${messageId}`);
      void runAssistant(conversation.id, history);
    },
    [store, runAssistant]
  );

  const regenerate = useCallback(() => {
    const conversation = store.activeConversation;
    if (!conversation || busyRef.current) return;
    const messages = conversation.messages;
    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") {
        lastAssistantIndex = i;
        break;
      }
    }
    if (lastAssistantIndex === -1) return;
    const lastAssistant = messages[lastAssistantIndex];
    if (!lastAssistant) return;
    const history = messages
      .slice(0, lastAssistantIndex)
      .filter((m) => !m.error && m.content.length > 0)
      .map((m) => ({ role: m.role, content: m.content }));
    if (history.length === 0 || history[history.length - 1]?.role !== "user") return;
    store.removeMessage(conversation.id, lastAssistant.id);
    deltaBuffer.current.delete(`${conversation.id}:${lastAssistant.id}`);
    void runAssistant(conversation.id, history);
  }, [store, runAssistant]);

  const stop = useCallback(() => {
    abortRef.current?.abort(new DOMException("User stopped", "AbortError"));
  }, []);

  const newChat = useCallback(() => {
    if (busyRef.current) stop();
    store.createConversation();
  }, [store, stop]);

  const confirmDelete = () => {
    if (deleteTargetId) {
      store.deleteConversation(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const confirmClear = () => {
    if (busyRef.current) stop();
    store.clearAll();
    setClearConfirmOpen(false);
    showToast(t("historyCleared"), "success");
  };

  const activeConversation = store.activeConversation;
  const modelPickerVisible = (modelsInfo?.models.length ?? 0) > 1;

  return (
    <div className="cosmic-bg flex h-dvh overflow-hidden">
      <Sidebar
        conversations={store.conversations}
        activeId={store.activeId}
        open={sidebarOpen}
        modelsInfo={modelsInfo}
        onSelect={store.selectConversation}
        onNewChat={newChat}
        onRename={store.renameConversation}
        onDeleteRequest={(id) => setDeleteTargetId(id)}
        onClearRequest={() => setClearConfirmOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("mobileMenu")}
            className="rounded-lg p-2 text-mist hover:text-ink hover:bg-surface-2/70 transition-colors lg:hidden cursor-pointer"
          >
            <IconMenu size={19} />
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="lg:hidden">
              <LogoMark size={22} />
            </span>
            <h1 className="truncate text-[0.92rem] font-medium text-ink">
              {activeConversation?.title ?? t("newChat")}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {modelPickerVisible && (
              <label className="hidden items-center gap-2 sm:flex">
                <span className="sr-only">{t("modelLabel")}</span>
                <select
                  value={settings.model ?? modelsInfo?.defaultModel ?? ""}
                  onChange={(e) => setModel(e.target.value || undefined)}
                  className="glass h-9 rounded-lg bg-transparent px-2.5 text-[0.78rem] text-ink outline-none cursor-pointer"
                >
                  {modelsInfo?.models.map((model) => (
                    <option key={model} value={model} className="bg-cosmos text-ink">
                      {model}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("settings")}
              onClick={() => setSettingsOpen(true)}
            >
              <IconSettings size={18} />
            </Button>
          </div>
        </header>

        {/* Messages + composer */}
        <MessageList
          messages={activeConversation?.messages ?? []}
          isBusy={isBusy}
          onRetry={retryMessage}
          onRegenerate={regenerate}
          onSuggestion={sendText}
        />

        <Composer
          disabled={Boolean(modelsInfo && !modelsInfo.configured)}
          isBusy={isBusy}
          placeholder={t("composerPlaceholder")}
          sendLabel={t("send")}
          stopLabel={t("stop")}
          charUnit={t("charCount")}
          onSend={sendText}
          onStop={stop}
        />
      </div>

      {/* Overlays */}
      <SettingsPanel
        open={settingsOpen}
        modelsInfo={modelsInfo}
        onClose={() => setSettingsOpen(false)}
        onClearHistory={() => {
          setSettingsOpen(false);
          setClearConfirmOpen(true);
        }}
      />
      <ConfirmDialog
        open={deleteTargetId !== null}
        title={t("confirmDeleteTitle")}
        body={t("confirmDeleteBody")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
      <ConfirmDialog
        open={clearConfirmOpen}
        title={t("confirmClearTitle")}
        body={t("confirmClearBody")}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        danger
        onConfirm={confirmClear}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  );
}
