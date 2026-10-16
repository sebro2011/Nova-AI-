"use client";

/**
 * Polished empty state with prompt suggestions.
 */
import { IconSparkle } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { useT } from "@/hooks/use-settings";

export interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  const t = useT();
  const suggestions = [
    t("suggestion1"),
    t("suggestion2"),
    t("suggestion3"),
    t("suggestion4"),
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10 sm:py-16 animate-fade-in-up">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)" }}
            aria-hidden="true"
          />
          <LogoMark size={64} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("emptyTitle")}
        </h1>
        <p className="max-w-md text-sm text-mist">{t("emptySubtitle")}</p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestion(text)}
            className="glass group flex items-start gap-2.5 rounded-xl px-4 py-3.5 text-left text-sm leading-relaxed text-mist hover:text-ink hover:border-accent-2/50 hover:bg-surface-2/50 transition-colors cursor-pointer"
          >
            <IconSparkle
              size={16}
              className="mt-0.5 shrink-0 text-accent-2 group-hover:text-accent transition-colors"
            />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
