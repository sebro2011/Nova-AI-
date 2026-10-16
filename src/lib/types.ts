/**
 * Shared domain types for Nova AI.
 */

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  /** True while the assistant response is still streaming. */
  pending?: boolean;
  /** Set when generation failed and the message can be retried. */
  error?: boolean;
  /** Machine-readable error code for localized error text (not persisted). */
  errorCode?: string;
  /** Set when generation was stopped by the user before completion. */
  stopped?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type Locale = "en" | "si" | "ta";

export type ThemeMode = "dark" | "light" | "system";

export interface AppSettings {
  theme: ThemeMode;
  locale: Locale;
  /** Model id chosen by the user among the server-configured models. */
  model?: string;
}

/** Information about the AI models configured on the server (never includes secrets). */
export interface ModelsInfo {
  configured: boolean;
  models: string[];
  defaultModel: string | null;
  provider: string;
}
