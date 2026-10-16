/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Suitable for a single-instance deployment (local dev, single container).
 * For multi-instance production deployments, replace this with a shared store
 * (e.g. Redis) — see README "Rate limiting" section.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying (only when blocked). */
  retryAfterSeconds: number;
  remaining: number;
}

export class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    /** Maximum number of requests allowed per window. */
    private readonly limit: number,
    /** Window size in milliseconds. */
    private readonly windowMs: number,
    /** Maximum tracked keys before the map is pruned (memory guard). */
    private readonly maxKeys = 2_000
  ) {
    if (limit <= 0 || windowMs <= 0) {
      throw new Error("limit and windowMs must be positive");
    }
  }

  check(key: string, now: number = Date.now()): RateLimitResult {
    const cutoff = now - this.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > cutoff);

    if (timestamps.length >= this.limit) {
      const oldest = timestamps[0] ?? now;
      this.hits.set(key, timestamps);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000)),
        remaining: 0,
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    if (this.hits.size > this.maxKeys) {
      this.prune(cutoff);
    }

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: this.limit - timestamps.length,
    };
  }

  /** Drop keys that have no recent activity. */
  private prune(cutoff: number): void {
    for (const [key, timestamps] of this.hits) {
      const active = timestamps.filter((t) => t > cutoff);
      if (active.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, active);
      }
    }
  }

  /** Test/ops helper: forget every tracked key. */
  reset(): void {
    this.hits.clear();
  }
}
