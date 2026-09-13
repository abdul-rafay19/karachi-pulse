"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AIAnalysis } from "@/types";
import { CATEGORY_META } from "@/lib/ui/categoryMeta";

const STEPS = [
  "Identifying issue",
  "Estimating severity",
  "Checking area activity",
  "Evaluating weather conditions",
  "Updating area risk",
];

export function ComplaintProcessing({
  onDone,
}: {
  onDone: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= STEPS.length) {
      const t = setTimeout(onDone, 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), 420);
    return () => clearTimeout(t);
  }, [stepIndex, onDone]);

  return (
    <div className="py-4">
      <p className="font-display text-lg mb-4">Analyzing report…</p>
      <ul className="flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-[var(--risk-low-soft)]" : "bg-[var(--panel-2)]"
                }`}
              >
                {done ? (
                  <Check size={13} className="text-[var(--risk-low)]" />
                ) : active ? (
                  <Loader2 size={13} className="animate-spin text-[var(--teal)]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
                )}
              </span>
              <span className={done || active ? "text-[var(--text)]" : "text-[var(--muted)]"}>{step}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ComplaintSuccess({
  analysis,
  degraded,
  message,
  onClose,
}: {
  analysis?: AIAnalysis;
  degraded: boolean;
  message?: string;
  onClose: () => void;
}) {
  return (
    <div className="py-2 kp-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-8 w-8 rounded-full bg-[var(--risk-low-soft)] flex items-center justify-center">
          <Check size={16} className="text-[var(--risk-low)]" />
        </span>
        <p className="font-display text-lg">Report analyzed successfully</p>
      </div>

      {degraded && message && (
        <p className="text-xs text-[var(--risk-moderate)] bg-[var(--risk-moderate-soft)] rounded-[10px] px-3 py-2 mb-4">
          {message}
        </p>
      )}

      {analysis && (
        <div className="kp-panel-2 rounded-[14px] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Category</span>
            <span className="font-medium">{CATEGORY_META[analysis.category].label}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Severity</span>
            <span className="font-medium">{Math.round(analysis.severity)}/100</span>
          </div>
          <p className="text-sm pt-2 border-t border-[var(--border-soft)]">{analysis.summary}</p>
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-5 w-full rounded-full bg-[var(--sand)] text-[#1a1206] py-2.5 text-sm font-medium hover:brightness-110"
      >
        View updated map
      </button>
    </div>
  );
}
