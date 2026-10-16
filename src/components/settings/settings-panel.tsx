"use client";

/**
 * Settings panel: theme, language, model information, clear history,
 * app information, privacy & usage links. Only functional settings shown.
 */
import { useEffect } from "react";
import type { ModelsInfo, ThemeMode } from "@/lib/types";
import { LOCALES } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/icons";
import { useSettings, useT } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

export interface SettingsPanelProps {
  open: boolean;
  modelsInfo: ModelsInfo | null;
  onClose: () => void;
  onClearHistory: () => void;
}

export function SettingsPanel({
  open,
  modelsInfo,
  onClose,
  onClearHistory,
}: SettingsPanelProps) {
  const t = useT();
  const { settings, setTheme, setLocale } = useSettings();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const themes: Array<{ value: ThemeMode; label: string }> = [
    { value: "dark", label: t("themeDark") },
    { value: "light", label: t("themeLight") },
    { value: "system", label: t("themeSystem") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="glass-strong thin-scrollbar relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 animate-fade-in-up"
      >
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-semibold text-ink">
            {t("settings")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-lg p-1.5 text-mist hover:text-ink hover:bg-surface-2/70 transition-colors cursor-pointer"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Theme */}
        <section className="mt-6">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist-dim">
            {t("theme")}
          </h3>
          <div className="mt-2.5 flex gap-2" role="radiogroup" aria-label={t("theme")}>
            {themes.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={settings.theme === option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-[0.8rem] font-medium transition-colors cursor-pointer",
                  settings.theme === option.value
                    ? "border-accent-2/70 bg-accent-2/15 text-ink"
                    : "border-hairline text-mist hover:border-hairline-strong hover:text-ink"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section className="mt-6">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist-dim">
            {t("language")}
          </h3>
          <div className="mt-2.5 flex gap-2" role="radiogroup" aria-label={t("language")}>
            {LOCALES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={settings.locale === option.value}
                onClick={() => setLocale(option.value)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-[0.8rem] font-medium transition-colors cursor-pointer",
                  settings.locale === option.value
                    ? "border-accent-2/70 bg-accent-2/15 text-ink"
                    : "border-hairline text-mist hover:border-hairline-strong hover:text-ink"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Model info */}
        <section className="mt-6">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist-dim">
            {t("modelSection")}
          </h3>
          <div className="mt-2.5 rounded-xl border border-hairline px-4 py-3">
            {modelsInfo ? (
              modelsInfo.configured ? (
                <div className="space-y-1.5">
                  <p className="text-sm text-ink">
                    {t("modelLabel")}:{" "}
                    <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.78rem]">
                      {modelsInfo.defaultModel}
                    </code>
                  </p>
                  <p className="text-xs text-mist">
                    Provider:{" "}
                    <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
                      {modelsInfo.provider}
                    </code>
                  </p>
                  {modelsInfo.models.length > 1 && (
                    <p className="text-xs text-mist">
                      {modelsInfo.models.length} models configured
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-danger">{t("modelNotConfigured")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-mist">
                    {t("modelNotConfiguredHint")}
                  </p>
                </div>
              )
            ) : (
              <p className="text-sm text-mist">{t("loading")}</p>
            )}
          </div>
        </section>

        {/* Data */}
        <section className="mt-6">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist-dim">
            {t("privacyTitle")}
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Button variant="danger" size="sm" onClick={onClearHistory}>
              {t("clearHistory")}
            </Button>
            <a
              href="/privacy"
              className="inline-flex h-8 items-center rounded-lg border border-hairline-strong px-3 text-[0.8rem] font-medium text-ink hover:border-accent-2 transition-colors"
            >
              {t("privacyLink")}
            </a>
            <a
              href="/usage"
              className="inline-flex h-8 items-center rounded-lg border border-hairline-strong px-3 text-[0.8rem] font-medium text-ink hover:border-accent-2 transition-colors"
            >
              {t("usageLink")}
            </a>
          </div>
        </section>

        {/* About */}
        <section className="mt-6 border-t border-hairline pt-5">
          <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-mist-dim">
            {t("about")}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-mist">{t("aboutText")}</p>
        </section>
      </div>
    </div>
  );
}
