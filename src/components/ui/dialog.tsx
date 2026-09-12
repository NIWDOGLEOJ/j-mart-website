import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  maxWidth = "md",
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,8,0.65)] backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "relative w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] text-[var(--ink)] overflow-hidden flex flex-col max-h-[90vh]",
          maxWidthClasses,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Eyebrow and Close */}
        {(title || eyebrow) && (
          <div className="px-5 py-4 border-b border-[var(--rule)] flex items-start justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-0.5">
              {eyebrow && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink3)]">
                  {eyebrow}
                </span>
              )}
              {title && typeof title === "string" ? (
                <h3 className="text-base font-bold text-[var(--ink)] leading-snug">{title}</h3>
              ) : (
                title
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink3)] hover:text-[var(--ink)] hover:bg-[var(--sub)] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-5 py-3.5 bg-[var(--sub)] border-t border-[var(--rule2)] flex items-center justify-between gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
