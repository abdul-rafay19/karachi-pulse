"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[900] bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-[901] bg-[var(--panel)] border-[var(--border-soft)] kp-scrollbar overflow-y-auto
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-[20px] border-t
          sm:inset-y-0 sm:bottom-auto sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-t-none sm:border-t-0 sm:border-l
          transition-transform duration-300 ease-out
          ${open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}
        `}
      >
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="absolute right-4 top-4 z-10 text-[var(--muted)] hover:text-[var(--text)] p-1.5 rounded-full hover:bg-[var(--panel-2)]"
        >
          <X size={20} />
        </button>
        <div className="sm:hidden flex justify-center pt-2.5">
          <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
        </div>
        {children}
      </div>
    </>
  );
}
