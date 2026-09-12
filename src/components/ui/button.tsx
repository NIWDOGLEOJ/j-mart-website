import * as React from "react";
import { cn } from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link"
    | "accent"
    | "primary-ink";
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "icon-sm";
  shortcut?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", shortcut, children, disabled, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1";

    const variantClasses = {
      default: "glass-btn glass-btn-accent font-semibold",
      accent: "glass-btn glass-btn-accent font-semibold",
      secondary: "glass-btn text-[var(--ink)] font-medium",
      outline: "border border-[var(--border2)] bg-transparent hover:bg-[var(--sub)] text-[var(--ink)]",
      destructive: "glass-btn glass-btn-danger font-medium",
      ghost: "hover:bg-[var(--sub)] text-[var(--ink)] border-transparent",
      link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto",
      "primary-ink": "bg-[var(--ink)] text-[var(--panel)] hover:opacity-90 border border-transparent font-bold",
    }[variant];

    const sizeClasses = {
      default: "h-9 px-4 py-2 text-sm rounded-lg",
      sm: "h-8 px-3 py-1.5 text-xs rounded-md",
      lg: "h-10 px-5 text-sm font-semibold rounded-lg",
      xl: "h-[46px] px-6 text-sm font-bold rounded-lg",
      icon: "w-9 h-9 p-0 rounded-lg shrink-0",
      "icon-sm": "w-8 h-8 p-0 rounded-md shrink-0",
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        {...props}
      >
        {children}
        {shortcut && (
          <kbd className="hidden sm:inline-block font-mono text-[10px] uppercase font-bold opacity-80 ml-1 px-1.5 py-0.5 rounded border border-[var(--border2)] border-b-2 bg-[var(--sub)] text-current">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
