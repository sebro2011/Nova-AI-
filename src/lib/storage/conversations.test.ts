import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredConversations,
  loadConversations,
  parseStoredConversations,
  saveConversations,
  STORAGE_KEY,
} from "@/lib/storage/conversations";
import type { Conversation } from "@/lib/types";

function sampleConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "conv_test",
    title: "Test chat",
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_100_000,
    messages: [
      { id: "m1", role: "user", content: "Hello", createdAt: 1_700_000_000_000 },
      {
        id: "m2",
        role: "assistant",
        content: "Hi there!",
        createdAt: 1_700_000_050_000,
      },
    ],
    ...overrides,
  };
}

/** Minimal in-memory localStorage replacement for node tests. */
class MemoryStorage {
  private store = new Map<string, string>();
  private quotaError = false;

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.quotaError) {
      throw new DOMException("quota", "QuotaExceededError");
    }
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  /** Test hook: simulate a full storage quota. */
  setQuotaError(active: boolean): void {
    this.quotaError = active;
  }
}

const memory = new MemoryStorage();

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: memory });
  memory.setQuotaError(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseStoredConversations", () => {
  it("parses a valid payload", () => {
    const raw = JSON.stringify({ version: 1, conversations: [sampleConversation()] });
    const result = parseStoredConversations(raw);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Test chat");
    expect(result[0]?.messages).toHaveLength(2);
  });

  it("returns empty for null / empty input", () => {
    expect(parseStoredConversations(null)).toEqual([]);
    expect(parseStoredConversations("")).toEqual([]);
  });

  it("returns empty for corrupt JSON instead of throwing", () => {
    expect(parseStoredConversations("{not json")).toEqual([]);
    expect(parseStoredConversations("42")).toEqual([]);
    expect(parseStoredConversations('"a string"')).toEqual([]);
  });

  it("drops the payload when the schema shape is wrong", () => {
    const raw = JSON.stringify({ version: 2, conversations: [] });
    expect(parseStoredConversations(raw)).toEqual([]);
  });

  it("drops messages with invalid roles", () => {
    const payload = {
      version: 1,
      conversations: [
        {
          ...sampleConversation(),
          messages: [{ id: "m1", role: "tool", content: "x", createdAt: 1 }],
        },
      ],
    };
    expect(parseStoredConversations(JSON.stringify(payload))).toEqual([]);
  });
});

describe("saveConversations / loadConversations", () => {
  it("round-trips conversations through storage", () => {
    const conversation = sampleConversation();
    const result = saveConversations([conversation]);
    expect(result.ok).toBe(true);
    const loaded = loadConversations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe("conv_test");
    expect(loaded[0]?.messages[1]?.content).toBe("Hi there!");
  });

  it("keeps only the newest conversations", () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      sampleConversation({
        id: `conv_${i}`,
        updatedAt: 1_700_000_000_000 + i,
      })
    );
    saveConversations(many);
    const loaded = loadConversations();
    expect(loaded.length).toBeLessThanOrEqual(50);
    // Newest first survives.
    expect(loaded.some((c) => c.id === "conv_59")).toBe(true);
    expect(loaded.some((c) => c.id === "conv_0")).toBe(false);
  });

  it("returns a quota result instead of throwing when storage is full", () => {
    memory.setQuotaError(true);
    const result = saveConversations([sampleConversation()]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("quota");
    }
  });

  it("loadConversations returns empty on storage read failure", () => {
    vi.stubGlobal("window", {
      get localStorage(): never {
        throw new Error("blocked");
      },
    });
    expect(loadConversations()).toEqual([]);
  });

  it("clearStoredConversations removes the stored key", () => {
    saveConversations([sampleConversation()]);
    expect(loadConversations()).toHaveLength(1);
    const cleared = clearStoredConversations();
    expect(cleared.ok).toBe(true);
    expect(memory.getItem(STORAGE_KEY)).toBeNull();
    expect(loadConversations()).toEqual([]);
  });

  it("degrades gracefully when localStorage is unavailable", () => {
    vi.stubGlobal("window", {});
    expect(saveConversations([sampleConversation()])).toEqual({
      ok: false,
      reason: "unavailable",
    });
  });
});
