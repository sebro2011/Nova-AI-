/**
 * Browser-storage persistence for conversations.
 *
 * Scope & honesty: this stores conversation history in the browser's
 * localStorage on the current device only. It is NOT cloud sync and NOT
 * account-level privacy — anyone with access to this browser profile can
 * read it, and clearing site data deletes it.
 *
 * All parsing is defensive: corrupt or outdated entries are dropped instead
 * of crashing the app. Storage logic is isolated here so a secure database
 * can replace it later without touching UI code.
 */
import { z } from "zod";
import type { Conversation } from "@/lib/types";

export const STORAGE_KEY = "nova-conversations-v1";
/** Upper bound on persisted conversations (oldest are dropped first). */
export const MAX_STORED_CONVERSATIONS = 50;
/** Upper bound on persisted messages per conversation. */
export const MAX_STORED_MESSAGES = 200;

export const storedMessageSchema = z.object({
  id: z.string().min(1).max(64),
  role: z.enum(["user", "assistant"]),
  content: z.string().max(100_000),
  createdAt: z.number().int().nonnegative(),
  error: z.boolean().optional(),
  stopped: z.boolean().optional(),
});

export const storedConversationSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().max(160),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  messages: z.array(storedMessageSchema).max(MAX_STORED_MESSAGES),
});

export const storedPayloadSchema = z.object({
  version: z.literal(1),
  conversations: z.array(storedConversationSchema).max(MAX_STORED_CONVERSATIONS),
});

export type StorageResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "quota" | "error" };

/**
 * Parse raw stored JSON into valid conversations.
 * Never throws: corrupt data is ignored and reported as empty.
 */
export function parseStoredConversations(raw: string | null): Conversation[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  const result = storedPayloadSchema.safeParse(parsed);
  if (!result.success) return [];

  return result.data.conversations.map((c) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messages: c.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
      error: m.error ?? false,
      stopped: m.stopped ?? false,
    })),
  }));
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Access can throw in privacy modes / sandboxed iframes.
    return null;
  }
}

export function loadConversations(): Conversation[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return parseStoredConversations(storage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Persist conversations. Keeps the newest conversations when the browser
 * storage quota is hit, then retries once. Returns a result instead of
 * throwing so the UI can degrade gracefully.
 */
export function saveConversations(conversations: Conversation[]): StorageResult {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: "unavailable" };

  const trimmed = conversations
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_STORED_CONVERSATIONS)
    .map((c) => ({
      id: c.id,
      title: c.title.slice(0, 160),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messages: c.messages.slice(-MAX_STORED_MESSAGES).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content.slice(0, 100_000),
        createdAt: m.createdAt,
        ...(m.error ? { error: true } : {}),
        ...(m.stopped ? { stopped: true } : {}),
      })),
    }));

  const payload = JSON.stringify({ version: 1 as const, conversations: trimmed });

  try {
    storage.setItem(STORAGE_KEY, payload);
    return { ok: true };
  } catch (error) {
    if (isQuotaError(error)) {
      // Retry with fewer conversations (drop the oldest half).
      try {
        const reduced = trimmed.slice(0, Math.max(1, Math.floor(trimmed.length / 2)));
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 1 as const, conversations: reduced })
        );
        return { ok: true };
      } catch {
        return { ok: false, reason: "quota" };
      }
    }
    return { ok: false, reason: "error" };
  }
}

export function clearStoredConversations(): StorageResult {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: "unavailable" };
  try {
    storage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}
