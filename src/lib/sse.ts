/**
 * Server-Sent Events helpers for the chat stream.
 * Wire format:
 *   event: delta
 *   data: {"text":"..."}
 *
 *   event: done
 *   data: {"outputChars":123,"truncated":false}
 *
 *   event: error
 *   data: {"code":"...","message":"..."}
 */

export type SseEventName = "delta" | "done" | "error";

function encodeData(payload: unknown): string {
  // JSON is single-line by construction except for strings containing \n,
  // which json escapes — safe to append per SSE spec.
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export function sseEvent(name: SseEventName, payload: unknown): string {
  return `event: ${name}\n${encodeData(payload)}`;
}

export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;
