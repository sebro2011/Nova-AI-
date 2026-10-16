/**
 * Server-side streaming integration with Hugging Face Inference Providers
 * via the official "@huggingface/inference" SDK.
 *
 * The access token stays on the server. Clients never talk to the provider.
 */
import {
  chatCompletionStream,
  InferenceClientError,
  InferenceClientInputError,
  InferenceClientProviderApiError,
  InferenceClientProviderOutputError,
} from "@huggingface/inference";
import type { Locale } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import {
  chatError,
  mapProviderStatus,
  mapUnknownError,
  type ChatErrorBody,
} from "@/lib/ai/errors";

export interface ProviderMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatParams {
  token: string;
  model: string;
  provider: string;
  messages: ProviderMessage[];
  locale?: Locale;
  maxTokens: number;
  timeoutMs: number;
  signal?: AbortSignal;
}

export type StreamChatEvent =
  | { type: "delta"; text: string }
  | { type: "done"; outputChars: number; truncated: boolean }
  | { type: "error"; error: ChatErrorBody };

/** Hard cap on generated characters, to bound memory/abuse even if the model runs long. */
export const MAX_OUTPUT_CHARS = 32_000;

/**
 * Stream a chat completion from the provider.
 * Yields text deltas and terminates with "done" or "error".
 */
export async function* streamChat(
  params: StreamChatParams
): AsyncGenerator<StreamChatEvent> {
  const {
    token,
    model,
    provider,
    messages,
    locale = "en",
    maxTokens,
    timeoutMs,
    signal,
  } = params;

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new DOMException("Provider timed out", "TimeoutError"));
  }, timeoutMs);
  const onExternalAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeout);
      yield {
        type: "error",
        error: chatError("timeout"),
      };
      return;
    }
    signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  const providerMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: buildSystemPrompt(locale) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let outputChars = 0;
  const truncated = false;

  try {
    const stream = chatCompletionStream(
      {
        accessToken: token,
        model,
        provider: provider as never,
        messages: providerMessages,
        max_tokens: maxTokens,
        stream: true,
      },
      {
        signal: controller.signal,
        retry_on_error: false,
      }
    );

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta.length > 0) {
        outputChars += delta.length;
        if (outputChars > MAX_OUTPUT_CHARS) {
          // Cap exceeded: end the stream without a "done" event.
          yield {
            type: "error",
            error: chatError("output_too_long"),
          };
          return;
        }
        yield { type: "delta", text: delta };
      }
    }

    yield { type: "done", outputChars, truncated };
  } catch (error) {
    yield { type: "error", error: toChatError(error) };
  } finally {
    clearTimeout(timeout);
    if (signal) {
      signal.removeEventListener("abort", onExternalAbort);
    }
  }
}

/** Convert a thrown provider/SDK error into a safe client-facing error. */
export function toChatError(error: unknown): ChatErrorBody {
  if (error instanceof InferenceClientProviderApiError) {
    // Never forward the provider response body — only map the status.
    return chatError(mapProviderStatus(error.httpResponse.status));
  }
  if (error instanceof InferenceClientInputError) {
    return chatError("provider_error");
  }
  if (error instanceof InferenceClientProviderOutputError) {
    return chatError("provider_error");
  }
  if (error instanceof InferenceClientError) {
    return chatError("provider_error");
  }
  if (
    (error instanceof Error && error.name === "TimeoutError") ||
    (error instanceof DOMException && error.name === "TimeoutError")
  ) {
    return chatError("timeout");
  }
  if (error instanceof TypeError) {
    // fetch() network failure while reaching the provider.
    return chatError("provider_unavailable");
  }
  return chatError(mapUnknownError(error));
}
