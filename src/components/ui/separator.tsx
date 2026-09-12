import * as React from "react";
import { cn } from "./utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  prominent?: boolean;
}

export function Separator({
  className,
  orientation = "horizontal",
  prominent = false,
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        prominent ? "bg-[var(--rule2)]" : "bg-[var(--rule)]",
        orientation === "horizontal" ? "h-px w-full my-2" : "w-px h-full mx-2 self-stretch",
        className
      )}
      {...props}
    />
  );
}
