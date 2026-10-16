/**
 * GET /api/models
 *
 * Returns which AI models are configured on this server (names only).
 * Never exposes tokens or any other secrets. Used by the UI to show
 * the model picker only when multiple models are configured.
 */
import {
  getConfiguredModels,
  getDefaultModel,
  getProvider,
} from "@/lib/ai/config";
import type { ModelsInfo } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const models = getConfiguredModels();
  const defaultModel = getDefaultModel();
  const info: ModelsInfo = {
    configured: Boolean(defaultModel),
    models,
    defaultModel,
    provider: getProvider(),
  };
  return new Response(JSON.stringify(info), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
