"use client";

import { Activity, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Live Map", href: "#live-map" },
  { label: "Risk Insights", href: "#risk-insights" },
  { label: "Authorities", href: "#authorities" },
];

export function Header({ onReport, onOpenAssistant }: { onReport: () => void; onOpenAssistant: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[var(--ink)]/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-[var(--sand)] flex items-center justify-center flex-shrink-0">
            <Activity size={16} className="text-[#1a1206]" />
          </span>
          <span className="font-display text-lg tracking-tight">Karachi Pulse</span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm text-[var(--muted)]">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[var(--text)] transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button onClick={onOpenAssistant} variant="outline" size="sm">
            <Sparkles size={14} className="text-[var(--teal)]" />
            AI Agent
          </Button>
          <Button onClick={onReport} size="sm">
            Report an Issue
          </Button>
        </div>

        <button

          className="md:hidden text-[var(--text)]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border-soft)] px-4 py-4 flex flex-col gap-4 bg-[var(--ink)]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[var(--muted)]"
            >
              {link.label}
            </a>
          ))}
          <Button
            onClick={() => {
              setOpen(false);
              onOpenAssistant();
            }}
            variant="outline"
            className="w-full"
          >
            <Sparkles size={14} className="text-[var(--teal)]" />
            AI Agent
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              onReport();
            }}
            className="w-full"
          >
            Report an Issue
          </Button>
        </div>
      )}
    </header>
  );
}
