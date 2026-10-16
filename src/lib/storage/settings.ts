/**
 * Browser-storage persistence for app settings (theme, language, model pick).
 * Defensive parsing: invalid values fall back to defaults.
 */
import { z } from "zod";
import type { AppSettings } from "@/lib/types";

export const SETTINGS_KEY = "nova-settings-v1";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  locale: "en",
};

const settingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  locale: z.enum(["en", "si", "ta"]).optional(),
  model: z.string().max(200).optional(),
});

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadSettings(): AppSettings {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_SETTINGS };
  try {
    const raw = storage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = settingsSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { ...DEFAULT_SETTINGS };
    return {
      theme: parsed.data.theme ?? DEFAULT_SETTINGS.theme,
      locale: parsed.data.locale ?? DEFAULT_SETTINGS.locale,
      model: parsed.data.model,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be full or blocked — settings stay in memory for this session.
  }
}
