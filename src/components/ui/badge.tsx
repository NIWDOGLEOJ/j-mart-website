import * as React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "accent"
    | "ok"
    | "warn"
    | "danger"
    | "in-stock"
    | "low-stock"
    | "out-of-stock";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-[var(--sub)] text-[var(--ink)] border-[var(--border2)]",
    secondary: "bg-[var(--rule)] text-[var(--ink2)] border-[var(--rule2)]",
    outline: "bg-transparent text-[var(--ink2)] border-[var(--border)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-hi)] border-[var(--accent-line)]",
    ok: "bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok-line)]",
    "in-stock": "bg-[var(--rule)] text-[var(--ink2)] border-[var(--border)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]",
    "low-stock": "bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn-line)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-line)]",
    "out-of-stock": "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-line)]",
  }[variant];

  const dotClasses = {
    default: "bg-[var(--ink3)]",
    secondary: "bg-[var(--ink4)]",
    outline: "bg-[var(--ink3)]",
    accent: "bg-[var(--accent)]",
    ok: "bg-[var(--ok)]",
    "in-stock": "bg-[var(--ink3)]",
    warn: "bg-[var(--warn)]",
    "low-stock": "bg-[var(--warn)]",
    danger: "bg-[var(--danger)]",
    "out-of-stock": "bg-[var(--danger)]",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors select-none",
        variantClasses,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClasses)} />}
      {children}
    </span>
  );
}
