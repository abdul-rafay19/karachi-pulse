import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "md" | "sm";
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-[var(--sand)] text-[#1a1206] hover:brightness-110 active:brightness-95 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]",
  secondary:
    "bg-[var(--panel-2)] text-[var(--text)] hover:bg-[var(--border-soft)] border border-[var(--border)]",
  outline:
    "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--panel-2)]",
  ghost: "bg-transparent text-[var(--muted)] hover:text-[var(--text)]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)] ${
        size === "sm" ? "px-3.5 py-1.5 text-sm" : "px-5 py-2.5 text-sm"
      } ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
