/**
 * Safe, client-facing error mapping for provider failures.
 * Raw provider payloads are never forwarded to the client.
 */

export interface ChatErrorBody {
  /** Stable machine-readable error code used for i18n on the client. */
  code: string;
  /** Safe human-readable message (English fallback; client may translate). */
  message: string;
}

export type ChatErrorCode =
  | "bad_request"
  | "rate_limited"
  | "not_configured"
  | "provider_auth"
  | "provider_rate_limited"
  | "provider_unavailable"
  | "provider_error"
  | "timeout"
  | "output_too_long"
  | "internal_error";

const ERROR_STATUS: Record<ChatErrorCode, number> = {
  bad_request: 400,
  rate_limited: 429,
  not_configured: 503,
  provider_auth: 502,
  provider_rate_limited: 429,
  provider_unavailable: 502,
  provider_error: 502,
  timeout: 504,
  output_too_long: 200,
  internal_error: 500,
};

const ERROR_MESSAGE: Record<ChatErrorCode, string> = {
  bad_request: "The request was invalid.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  not_configured:
    "The AI provider is not configured on this server. Add HF_TOKEN and HF_MODEL to the server environment.",
  provider_auth:
    "The server could not authenticate with the AI provider. Please contact the administrator.",
  provider_rate_limited:
    "The AI provider is currently rate limited. Please try again shortly.",
  provider_unavailable:
    "The AI provider is currently unavailable. Please try again shortly.",
  provider_error:
    "The AI provider returned an unexpected error. Please try again.",
  timeout: "The AI provider took too long to respond. Please try again.",
  output_too_long: "",
  internal_error: "An unexpected error occurred. Please try again.",
};

export function chatError(code: ChatErrorCode): ChatErrorBody {
  return { code, message: ERROR_MESSAGE[code] };
}

export function chatErrorStatus(code: ChatErrorCode): number {
  return ERROR_STATUS[code];
}

/** Map a provider HTTP status code to a safe chat error code. */
export function mapProviderStatus(status: number): ChatErrorCode {
  if (status === 400 || status === 422) return "provider_error";
  if (status === 401 || status === 403) return "provider_auth";
  if (status === 429) return "provider_rate_limited";
  if (status === 504) return "timeout";
  if (status >= 500) return "provider_unavailable";
  return "provider_error";
}

/** Map an unknown thrown value (e.g. AbortError) to a safe chat error code. */
export function mapUnknownError(error: unknown): ChatErrorCode {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "timeout";
  }
  if (error instanceof Error && error.name === "AbortError") {
    return "timeout";
  }
  return "internal_error";
}
