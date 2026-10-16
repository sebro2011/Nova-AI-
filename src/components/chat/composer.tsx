"use client";

/**
 * Message composer: auto-growing textarea, Enter to send,
 * Shift+Enter for newline, IME-safe, send/stop states.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { IconSend, IconStop } from "@/components/icons";
import { cn } from "@/lib/utils";
import { MAX_MESSAGE_CHARS } from "@/lib/validation/chat";

export interface ComposerProps {
  disabled: boolean;
  isBusy: boolean;
  placeholder: string;
  sendLabel: string;
  stopLabel: string;
  charUnit: string;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({
  disabled,
  isBusy,
  placeholder,
  sendLabel,
  stopLabel,
  charUnit,
  onSend,
  onStop,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to ~200px, then scroll internally.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || disabled || isBusy) return;
    onSend(text);
    setValue("");
  }, [value, disabled, isBusy, onSend]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Do not send while an IME composition (Sinhala/Tamil input) is active.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= MAX_MESSAGE_CHARS) {
      setValue(event.target.value);
    }
  };

  const remaining = MAX_MESSAGE_CHARS - value.length;
  const showCounter = remaining <= MAX_MESSAGE_CHARS * 0.2;
  const canSend = value.trim().length > 0 && !disabled && !isBusy;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6 sm:pb-6">
      <div
        className={cn(
          "glass rounded-2xl px-3 py-2.5 transition-colors",
          isBusy && "opacity-90"
        )}
      >
        <label htmlFor="nova-composer" className="sr-only">
          {placeholder}
        </label>
        <textarea
          id="nova-composer"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="thin-scrollbar w-full resize-none bg-transparent px-1.5 py-1.5 text-[0.95rem] leading-relaxed text-ink placeholder:text-mist-dim outline-none disabled:opacity-50"
          aria-describedby="nova-composer-hint"
        />
        <div className="flex items-center justify-between gap-3 px-1 pt-1">
          <p id="nova-composer-hint" className="text-[0.68rem] text-mist-dim">
            Enter ↵ · Shift+Enter ↵↵
            {showCounter && (
              <span className={cn("ml-2", remaining < 0 && "text-danger")}>
                {remaining} {charUnit}
              </span>
            )}
          </p>
          {isBusy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label={stopLabel}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-hairline-strong px-3.5 text-[0.8rem] font-medium text-ink hover:border-danger/60 hover:text-danger transition-colors cursor-pointer"
            >
              <IconStop size={14} />
              {stopLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label={sendLabel}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[0.8rem] font-medium transition-colors cursor-pointer",
                canSend
                  ? "bg-accent-2 text-white hover:bg-accent shadow-[0_4px_18px_-6px_rgba(99,102,241,0.6)]"
                  : "bg-surface-2 text-mist-dim opacity-60 cursor-not-allowed"
              )}
            >
              <IconSend size={14} />
              {sendLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
