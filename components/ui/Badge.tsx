import { ReactNode } from "react";

export function Badge({
  children,
  color,
  soft,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  soft?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{
        color: color ?? "var(--text)",
        background: soft ?? "var(--panel-2)",
      }}
    >
      {children}
    </span>
  );
}
