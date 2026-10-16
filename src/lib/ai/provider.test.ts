import { describe, expect, it } from "vitest";
import {
  InferenceClientInputError,
  InferenceClientProviderApiError,
  InferenceClientProviderOutputError,
} from "@huggingface/inference";
import { toChatError, streamChat } from "@/lib/ai/provider";

describe("toChatError", () => {
  it("maps provider HTTP 401 to provider_auth without leaking the body", () => {
    const error = new InferenceClientProviderApiError(
      "token hf_secret leaked in message",
      { url: "https://router.huggingface.co", method: "POST" },
      { requestId: "r", status: 401, body: { secret: "hf_secret" } }
    );
    const mapped = toChatError(error);
    expect(mapped.code).toBe("provider_auth");
    expect(mapped.message).not.toContain("hf_secret");
  });

  it("maps input/output SDK errors to provider_error", () => {
    expect(toChatError(new InferenceClientInputError("bad input")).code).toBe(
      "provider_error"
    );
    expect(toChatError(new InferenceClientProviderOutputError("bad output")).code).toBe(
      "provider_error"
    );
  });

  it("maps fetch network failures (TypeError) to provider_unavailable", () => {
    const error = new TypeError("fetch failed");
    expect(toChatError(error).code).toBe("provider_unavailable");
  });

  it("maps TimeoutError to timeout and unknown errors to internal_error", () => {
    expect(toChatError(new DOMException("t", "TimeoutError")).code).toBe("timeout");
    const timeoutErr = new Error("t");
    timeoutErr.name = "TimeoutError";
    expect(toChatError(timeoutErr).code).toBe("timeout");
    expect(toChatError(new Error("boom")).code).toBe("internal_error");
  });
});

describe("streamChat abort handling", () => {
  it("yields a safe timeout error when the request is already aborted", async () => {
    const events: unknown[] = [];
    const controller = new AbortController();
    controller.abort(new DOMException("cancelled", "AbortError"));
    for await (const event of streamChat({
      token: "t",
      model: "m",
      provider: "auto",
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 100,
      timeoutMs: 1000,
      signal: controller.signal,
    })) {
      events.push(event);
    }
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "error", error: { code: "timeout" } });
  });
});
