import { RiskLevel } from "@/types";

export const RISK_LEVEL_META: Record<
  RiskLevel,
  { label: string; color: string; soft: string; range: string }
> = {
  low: { label: "Low", color: "var(--risk-low)", soft: "var(--risk-low-soft)", range: "0–39" },
  moderate: {
    label: "Moderate",
    color: "var(--risk-moderate)",
    soft: "var(--risk-moderate-soft)",
    range: "40–74",
  },
  critical: {
    label: "Critical",
    color: "var(--risk-critical)",
    soft: "var(--risk-critical-soft)",
    range: "75–100",
  },
};
