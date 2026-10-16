/**
 * Server-side AI configuration, read from environment variables.
 *
 *   HF_TOKEN    – Hugging Face access token (server-only, never sent to clients)
 *   HF_MODEL    – default model id, e.g. "Qwen/Qwen2.5-72B-Instruct"
 *   HF_MODELS   – optional comma-separated allowlist of model ids for the picker
 *   HF_PROVIDER – optional Inference Provider (default "auto")
 *
 * No secret values are ever returned from this module's public functions.
 */

const HUGGINGFACE_PROVIDER_VALUES = [
  "baseten",
  "cerebras",
  "cohere",
  "deepinfra",
  "fal-ai",
  "featherless-ai",
  "fireworks-ai",
  "groq",
  "hf-inference",
  "humain-ai",
  "novita",
  "nscale",
  "openai",
  "openrouter",
  "ovhcloud",
  "publicai",
  "replicate",
  "scaleway",
  "together",
  "wavespeed",
  "zai-org",
  "auto",
] as const;

export type ProviderName = (typeof HUGGINGFACE_PROVIDER_VALUES)[number];

export function getToken(): string | null {
  const token = process.env.HF_TOKEN?.trim();
  return token && token.length > 0 ? token : null;
}

export function getProvider(): ProviderName {
  const raw = process.env.HF_PROVIDER?.trim().toLowerCase() as ProviderName | undefined;
  if (raw && (HUGGINGFACE_PROVIDER_VALUES as readonly string[]).includes(raw)) {
    return raw;
  }
  // Invalid or missing provider falls back to the SDK's routing policy.
  return "auto";
}

export function getDefaultModel(): string | null {
  const model = process.env.HF_MODEL?.trim();
  return model && model.length > 0 ? model : null;
}

/**
 * Configured model allowlist. Includes the default model plus optional
 * HF_MODELS entries. Returns an empty list when nothing is configured.
 */
export function getConfiguredModels(): string[] {
  const seen = new Set<string>();
  const defaultModel = getDefaultModel();
  if (defaultModel) {
    seen.add(defaultModel);
  }
  const extra = process.env.HF_MODELS ?? "";
  for (const entry of extra.split(",")) {
    const model = entry.trim();
    if (model.length > 0) {
      seen.add(model);
    }
  }
  return [...seen];
}

export function isConfiguredModel(model: string): boolean {
  return getConfiguredModels().includes(model);
}

/** Max generated tokens for one response (env-overridable, clamped). */
export function getMaxOutputTokens(): number {
  const raw = Number.parseInt(process.env.MAX_OUTPUT_TOKENS ?? "", 10);
  if (Number.isFinite(raw) && raw >= 64 && raw <= 4_096) {
    return raw;
  }
  return 1_024;
}

/** Overall provider request timeout in milliseconds (env-overridable, clamped). */
export function getProviderTimeoutMs(): number {
  const raw = Number.parseInt(process.env.PROVIDER_TIMEOUT_MS ?? "", 10);
  if (Number.isFinite(raw) && raw >= 5_000 && raw <= 120_000) {
    return raw;
  }
  return 60_000;
}

/** Rate limit: max chat requests per IP per window (env-overridable). */
export function getRateLimit(): { limit: number; windowMs: number } {
  const limitRaw = Number.parseInt(process.env.RATE_LIMIT_MAX ?? "", 10);
  const windowRaw = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "", 10);
  return {
    limit: Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 20,
    windowMs: Number.isFinite(windowRaw) && windowRaw > 0 ? windowRaw : 60_000,
  };
}
