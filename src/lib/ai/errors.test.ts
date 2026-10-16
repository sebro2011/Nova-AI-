import { describe, expect, it } from "vitest";
import {
  chatError,
  chatErrorStatus,
  mapProviderStatus,
  mapUnknownError,
} from "@/lib/ai/errors";

describe("provider error mapping", () => {
  it("maps 400/422 to provider_error", () => {
    expect(mapProviderStatus(400)).toBe("provider_error");
    expect(mapProviderStatus(422)).toBe("provider_error");
  });

  it("maps 401/403 to provider_auth", () => {
    expect(mapProviderStatus(401)).toBe("provider_auth");
    expect(mapProviderStatus(403)).toBe("provider_auth");
  });

  it("maps 429 to provider_rate_limited", () => {
    expect(mapProviderStatus(429)).toBe("provider_rate_limited");
  });

  it("maps 504 to timeout and other 5xx to provider_unavailable", () => {
    expect(mapProviderStatus(504)).toBe("timeout");
    expect(mapProviderStatus(500)).toBe("provider_unavailable");
    expect(mapProviderStatus(503)).toBe("provider_unavailable");
  });

  it("maps unexpected statuses to provider_error", () => {
    expect(mapProviderStatus(418)).toBe("provider_error");
    expect(mapProviderStatus(0)).toBe("provider_error");
  });
});

describe("unknown error mapping", () => {
  it("maps AbortError to timeout", () => {
    expect(mapUnknownError(new DOMException("aborted", "AbortError"))).toBe("timeout");
    const err = new Error("aborted");
    err.name = "AbortError";
    expect(mapUnknownError(err)).toBe("timeout");
  });

  it("maps anything else to internal_error", () => {
    expect(mapUnknownError(new Error("boom"))).toBe("internal_error");
    expect(mapUnknownError("string error")).toBe("internal_error");
    expect(mapUnknownError(undefined)).toBe("internal_error");
  });
});

describe("chatError bodies", () => {
  it("returns stable codes and safe messages", () => {
    const body = chatError("provider_auth");
    expect(body.code).toBe("provider_auth");
    expect(body.message.length).toBeGreaterThan(0);
    // Never leak sensitive internals in messages.
    expect(body.message.toLowerCase()).not.toContain("token");
    expect(body.message.toLowerCase()).not.toContain("hf_");
  });

  it("maps codes to sensible HTTP statuses", () => {
    expect(chatErrorStatus("bad_request")).toBe(400);
    expect(chatErrorStatus("rate_limited")).toBe(429);
    expect(chatErrorStatus("not_configured")).toBe(503);
    expect(chatErrorStatus("provider_auth")).toBe(502);
    expect(chatErrorStatus("timeout")).toBe(504);
  });
});
