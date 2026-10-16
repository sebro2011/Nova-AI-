"use client";

/**
 * Conversation store: in-memory state with browser-storage persistence.
 * All storage access goes through @/lib/storage/conversations so the
 * persistence backend can be swapped for a database later.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, Conversation, MessageRole } from "@/lib/types";
import {
  clearStoredConversations,
  loadConversations,
  saveConversations,
  type StorageResult,
} from "@/lib/storage/conversations";
import { deriveTitle, uid } from "@/lib/utils";

export type StorageWarning = "quota" | "unavailable" | "error" | null;

export interface ConversationsApi {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  storageWarning: StorageWarning;
  createConversation: () => string;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;
  appendMessage: (conversationId: string, role: MessageRole, content: string) => string;
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<ChatMessage>
  ) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
}

function applyStorageWarning(result: StorageResult): StorageWarning {
  if (result.ok) return null;
  return result.reason;
}

export function useConversations(): ConversationsApi {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<StorageWarning>(null);
  const hydrated = useRef(false);

  // Load persisted conversations once on mount (localStorage cannot be read
  // during SSR, so hydration happens in an effect — standard persistence pattern).
  useEffect(() => {
    const stored = loadConversations();
    /* eslint-disable react-hooks/set-state-in-effect */
    setConversations(stored);
    setActiveId(stored[0]?.id ?? null);
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
  }, []);

  // Persist on every change after hydration (skip initial empty state).
  useEffect(() => {
    if (!hydrated.current) return;
    const result = saveConversations(conversations);
    setStorageWarning(applyStorageWarning(result));
  }, [conversations]);

  const createConversation = useCallback((): string => {
    const id = uid("conv");
    const now = Date.now();
    const conversation: Conversation = {
      id,
      title: "New chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    const clean = title.trim().slice(0, 120);
    if (!clean) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: clean, updatedAt: Date.now() } : c))
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setActiveId((current) => {
        if (current !== id) return current;
        return next[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    setStorageWarning(applyStorageWarning(clearStoredConversations()));
  }, []);

  const appendMessage = useCallback(
    (conversationId: string, role: MessageRole, content: string): string => {
      const messageId = uid("msg");
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const message: ChatMessage = {
            id: messageId,
            role,
            content,
            createdAt: Date.now(),
          };
          const messages = [...c.messages, message];
          const title =
            c.messages.length === 0 && role === "user" ? deriveTitle(content) : c.title;
          return { ...c, title, messages, updatedAt: Date.now() };
        })
      );
      return messageId;
    },
    []
  );

  const updateMessage = useCallback(
    (conversationId: string, messageId: string, patch: Partial<ChatMessage>) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
          };
        })
      );
    },
    []
  );

  const removeMessage = useCallback((conversationId: string, messageId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.filter((m) => m.id !== messageId),
            }
          : c
      )
    );
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeId) ?? null;

  return {
    conversations,
    activeId,
    activeConversation,
    storageWarning,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAll,
    appendMessage,
    updateMessage,
    removeMessage,
  };
}
