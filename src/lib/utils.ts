/**
 * Small shared utilities.
 */

/** Join conditional class names. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Generate a reasonably unique id without extra dependencies. */
export function uid(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** Derive a conversation title from the first user message. */
export function deriveTitle(content: string): string {
  const flat = content.replace(/\s+/g, " ").trim();
  if (flat.length === 0) return "New chat";
  return flat.length > 48 ? `${flat.slice(0, 48)}…` : flat;
}

/** Format a timestamp for the sidebar (locale-aware, compact). */
export function formatTime(timestamp: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}
