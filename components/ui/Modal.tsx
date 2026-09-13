"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm kp-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="kp-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto kp-scrollbar rounded-b-none sm:rounded-[18px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)] sticky top-0 bg-[var(--panel)] z-10">
          <h2 className="font-display text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-full hover:bg-[var(--panel-2)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
