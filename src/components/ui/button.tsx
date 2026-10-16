"use client";

/**
 * Button primitives with consistent states (hover / focus / disabled).
 */
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent-2 text-white hover:bg-accent disabled:opacity-50 shadow-[0_4px_20px_-6px_rgba(99,102,241,0.55)]",
  ghost: "text-mist hover:text-ink hover:bg-surface-2/70 disabled:opacity-40",
  outline:
    "border border-hairline-strong text-ink hover:border-accent-2 hover:bg-surface-2/60 disabled:opacity-40",
  danger:
    "border border-danger/50 text-danger hover:bg-danger/12 disabled:opacity-40",
  subtle:
    "bg-surface-2/70 text-ink hover:bg-surface-2 disabled:opacity-40 border border-hairline",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.8rem] rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  icon: "h-9 w-9 rounded-lg justify-center",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center font-medium transition-colors duration-150 cursor-pointer",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
