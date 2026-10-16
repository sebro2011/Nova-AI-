/**
 * Client-side streaming chat requests against /api/chat.
 * Parses the SSE stream (event: delta | done | error).
 */

export interface ClientChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatRequest {
  conversationId?: string;
  messages: ClientChatMessage[];
  model?: string;
  locale?: string;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
}

export interface StreamChatResult {
  model: string | null;
  outputChars: number;
  truncated: boolean;
}

export class ChatRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 0) {
    super(message);
    this.name = "ChatRequestError";
    this.code = code;
    this.status = status;
  }
}

function parseSseBlock(block: string): { event: string; data: unknown } | null {
  let event = "message";
  let dataText = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataText += line.slice(5).trim();
    }
  }
  if (!dataText) return null;
  try {
    return { event, data: JSON.parse(dataText) };
  } catch {
    return null;
  }
}

export async function streamChatRequest(
  request: StreamChatRequest
): Promise<StreamChatResult> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: request.conversationId,
        messages: request.messages,
        model: request.model,
        locale: request.locale,
      }),
      signal: request.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ChatRequestError("network", "Network error", 0);
  }

  if (!response.ok) {
    let code = "internal_error";
    let message = "Request failed";
    try {
      const body = (await response.json()) as { code?: string; message?: string };
      if (typeof body.code === "string") code = body.code;
      if (typeof body.message === "string") message = body.message;
    } catch {
      // Non-JSON error body — keep defaults.
    }
    throw new ChatRequestError(code, message, response.status);
  }

  if (!response.body) {
    throw new ChatRequestError("internal_error", "Empty response stream", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let model: string | null = null;
  let outputChars = 0;
  let truncated = false;

  const handleEvent = (block: string): "continue" | "stop" => {
    const parsed = parseSseBlock(block);
    if (!parsed) return "continue";
    if (parsed.event === "delta") {
      const text = (parsed.data as { text?: unknown })?.text;
      if (typeof text === "string" && text.length > 0) {
        outputChars += text.length;
        request.onDelta(text);
      }
      return "continue";
    }
    if (parsed.event === "done") {
      const data = parsed.data as { model?: unknown; truncated?: unknown };
      if (typeof data?.model === "string") model = data.model;
      if (typeof data?.truncated === "boolean") truncated = data.truncated;
      return "stop";
    }
    if (parsed.event === "error") {
      const data = parsed.data as { code?: unknown; message?: unknown };
      throw new ChatRequestError(
        typeof data?.code === "string" ? data.code : "internal_error",
        typeof data?.message === "string" ? data.message : "Stream error",
        response.status
      );
    }
    return "continue";
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let index = buffer.indexOf("\n\n");
      while (index !== -1) {
        const block = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (handleEvent(block) === "stop") {
          await reader.cancel().catch(() => undefined);
          return { model, outputChars, truncated };
        }
        index = buffer.indexOf("\n\n");
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { model, outputChars, truncated };
}
