import { describe, expect, it } from "vitest";
import { SlidingWindowRateLimiter } from "@/lib/rate-limit";

describe("SlidingWindowRateLimiter", () => {
  it("allows requests up to the limit", () => {
    const limiter = new SlidingWindowRateLimiter(3, 60_000);
    const now = 1_000_000;
    expect(limiter.check("ip-a", now).allowed).toBe(true);
    expect(limiter.check("ip-a", now + 10).allowed).toBe(true);
    const third = limiter.check("ip-a", now + 20);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks requests over the limit with a retry hint", () => {
    const limiter = new SlidingWindowRateLimiter(2, 60_000);
    const now = 1_000_000;
    limiter.check("ip-a", now);
    limiter.check("ip-a", now + 1);
    const blocked = limiter.check("ip-a", now + 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("frees capacity after the window slides", () => {
    const limiter = new SlidingWindowRateLimiter(1, 1_000);
    const now = 1_000_000;
    expect(limiter.check("ip-a", now).allowed).toBe(true);
    expect(limiter.check("ip-a", now + 500).allowed).toBe(false);
    expect(limiter.check("ip-a", now + 1_200).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const limiter = new SlidingWindowRateLimiter(1, 60_000);
    const now = 1_000_000;
    expect(limiter.check("ip-a", now).allowed).toBe(true);
    expect(limiter.check("ip-b", now).allowed).toBe(true);
    expect(limiter.check("ip-a", now).allowed).toBe(false);
  });

  it("reset() clears all tracked state", () => {
    const limiter = new SlidingWindowRateLimiter(1, 60_000);
    const now = 1_000_000;
    limiter.check("ip-a", now);
    expect(limiter.check("ip-a", now).allowed).toBe(false);
    limiter.reset();
    expect(limiter.check("ip-a", now).allowed).toBe(true);
  });

  it("rejects invalid constructor arguments", () => {
    expect(() => new SlidingWindowRateLimiter(0, 1_000)).toThrow();
    expect(() => new SlidingWindowRateLimiter(1, 0)).toThrow();
  });
});
