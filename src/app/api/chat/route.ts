/**
 * POST /api/chat
 *
 * Secure server-side chat endpoint:
 *  - rate limiting per client IP
 *  - request size limits + zod validation
 *  - server-only provider credentials (HF_TOKEN)
 *  - streaming SSE responses (delta / done / error)
 *  - safe error mapping (never leaks provider payloads or secrets)
 *
 * Error semantics:
 *  - failures before the first token are returned as JSON with a proper
 *    HTTP status (400/429/502/503/504/500)
 *  - failures after streaming started are sent as SSE "error" events
 */
import {
  chatRequestSchema,
  formatZodError,
  MAX_REQUEST_BYTES,
} from "@/lib/validation/chat";
import { SlidingWindowRateLimiter } from "@/lib/rate-limit";
import {
  getDefaultModel,
  getConfiguredModels,
  getMaxOutputTokens,
  getProvider,
  getProviderTimeoutMs,
  getRateLimit,
  getToken,
} from "@/lib/ai/config";
import { streamChat, toChatError, type StreamChatEvent } from "@/lib/ai/provider";
import {
  chatError,
  chatErrorStatus,
  type ChatErrorCode,
} from "@/lib/ai/errors";
import { SSE_HEADERS, sseEvent } from "@/lib/sse";

// Always respond dynamically — requests depend on headers and env.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateConfig = getRateLimit();
const limiter = new SlidingWindowRateLimiter(rateConfig.limit, rateConfig.windowMs);

/** Test helper: reset the per-IP rate limiter state. */
export function __resetRateLimiter(): void {
  limiter.reset();
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function jsonError(code: ChatErrorCode, extraHeaders?: Record<string, string>): Response {
  const body = chatError(code);
  return new Response(JSON.stringify(body), {
    status: chatErrorStatus(code),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function errorCodeToResponse(code: string): Response {
  const known: ChatErrorCode[] = [
    "bad_request",
    "rate_limited",
    "not_configured",
    "provider_auth",
    "provider_rate_limited",
    "provider_unavailable",
    "provider_error",
    "timeout",
    "internal_error",
  ];
  const typed = known.includes(code as ChatErrorCode) ? (code as ChatErrorCode) : "internal_error";
  return jsonError(typed);
}

export async function POST(request: Request): Promise<Response> {
  // 1) Rate limiting (best-effort per IP; single-instance in-memory store).
  const limit = limiter.check(clientIp(request));
  if (!limit.allowed) {
    return jsonError("rate_limited", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  // 2) Declared body size guard (before reading).
  const contentLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonError("bad_request");
  }

  // 3) Read body with a hard size cap.
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return jsonError("bad_request");
  }
  if (raw.length === 0 || raw.length > MAX_REQUEST_BYTES) {
    return jsonError("bad_request");
  }

  // 4) Parse + validate JSON payload.
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return jsonError("bad_request");
  }
  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    // Log validation details server-side only; client gets a generic message.
    console.warn("[api/chat] invalid request:", formatZodError(parsed.error));
    return jsonError("bad_request");
  }
  const { messages, model, locale } = parsed.data;

  // 5) Provider configuration (server-side secrets stay here).
  const token = getToken();
  const defaultModel = getDefaultModel();
  if (!token || !defaultModel) {
    return jsonError("not_configured");
  }

  // 6) Model must be one of the configured models — no client-injected models.
  const configuredModels = getConfiguredModels();
  const modelId = model ?? defaultModel;
  if (!configuredModels.includes(modelId)) {
    return jsonError("bad_request");
  }

  // 7) Open the provider stream and pre-read the first event so that
  //    immediate failures surface as real HTTP error responses.
  const abort = new AbortController();
  const iterator = streamChat({
    token,
    model: modelId,
    provider: getProvider(),
    messages,
    locale,
    maxTokens: getMaxOutputTokens(),
    timeoutMs: getProviderTimeoutMs(),
    signal: abort.signal,
  })[Symbol.asyncIterator]();

  let first: IteratorResult<StreamChatEvent>;
  try {
    first = await iterator.next();
  } catch (error) {
    const mapped = toChatError(error);
    console.error("[api/chat] provider failure:", mapped.code);
    return errorCodeToResponse(mapped.code);
  }

  if (first.done) {
    return jsonError("provider_error");
  }
  if (first.value.type === "error") {
    return errorCodeToResponse(first.value.error.code);
  }

  // 8) Stream deltas as SSE; later errors arrive as SSE "error" events.
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));
      const emit = (event: StreamChatEvent) => {
        if (event.type === "delta") {
          send(sseEvent("delta", { text: event.text }));
        } else if (event.type === "done") {
          send(
            sseEvent("done", {
              model: modelId,
              outputChars: event.outputChars,
              truncated: event.truncated,
            })
          );
        } else {
          send(sseEvent("error", event.error));
        }
      };

      try {
        emit(first.value);
        for (;;) {
          const next = await iterator.next();
          if (next.done) break;
          emit(next.value);
          if (next.value.type === "error" || next.value.type === "done") {
            break;
          }
        }
      } catch (error) {
        const mapped = toChatError(error);
        console.error("[api/chat] stream failure:", mapped.code);
        try {
          send(sseEvent("error", mapped));
        } catch {
          // Controller may already be closed.
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      }
    },
    cancel() {
      // Client disconnected (e.g. Stop button) — abort the provider call.
      abort.abort(new DOMException("Client cancelled", "AbortError"));
    },
  });

  return new Response(stream, { status: 200, headers: SSE_HEADERS });
}
