import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, mono, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border border-[var(--border2)] bg-[var(--sub)] px-3.5 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none transition-all duration-150",
          "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30",
          mono && "font-mono tabular-nums",
          error && "border-[var(--danger-strong)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
