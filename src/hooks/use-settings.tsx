"use client";

/**
 * App settings context: theme + language + selected model,
 * persisted to browser storage (best-effort).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AppSettings, Locale, ThemeMode } from "@/lib/types";
import { loadSettings, saveSettings } from "@/lib/storage/settings";
import { translate, type TranslationKey } from "@/lib/i18n";

interface SettingsContextValue {
  settings: AppSettings;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  setModel: (model: string | undefined) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: light)";

function subscribeSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia(COLOR_SCHEME_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSystemPrefersLight(): boolean {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({ theme: "dark", locale: "en" });

  // Hydrate from storage on mount (localStorage is unavailable during SSR).
  useEffect(() => {
    const loaded = loadSettings();
    /* eslint-disable react-hooks/set-state-in-effect */
    setSettings(loaded);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // System color scheme, kept in sync via subscription (external system).
  const systemPrefersLight = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemPrefersLight,
    () => false
  );

  const resolvedTheme: "dark" | "light" =
    settings.theme === "system"
      ? systemPrefersLight
        ? "light"
        : "dark"
      : settings.theme;

  // Apply the resolved theme to <html data-theme="…"> (DOM side effect only).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Keep <html lang> in sync for accessibility / font selection.
  useEffect(() => {
    document.documentElement.setAttribute("lang", settings.locale);
  }, [settings.locale]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      resolvedTheme,
      setTheme: (theme) => update({ theme }),
      setLocale: (locale) => update({ locale }),
      setModel: (model) => update({ model }),
    }),
    [settings, resolvedTheme, update]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}

/** Translation helper bound to the active locale. */
export function useT(): (key: TranslationKey) => string {
  const { settings } = useSettings();
  return useCallback(
    (key: TranslationKey) => translate(settings.locale, key),
    [settings.locale]
  );
}
