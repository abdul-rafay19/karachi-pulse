import { ComplaintCategory } from "@/types";

/** Intrinsic hazard baseline per category, independent of any single report.
 * Flooding/sewage carry more inherent public-safety weight than, say, waste. */
export const CATEGORY_HAZARD_BASE: Record<ComplaintCategory, number> = {
  flooding: 90,
  sewage: 85,
  electricity: 70,
  roads: 55,
  water: 60,
  waste: 50,
  other: 40,
};

/** Categories where rainfall meaningfully compounds the underlying problem. */
export const WEATHER_SENSITIVE_CATEGORIES: ComplaintCategory[] = [
  "flooding",
  "sewage",
  "roads",
  "electricity",
  "water",
];

export const RISK_WEIGHTS = {
  volume: 0.25,
  severity: 0.25,
  urgency: 0.15,
  recency: 0.15,
  categoryHazard: 0.1,
  weatherAmplification: 0.1,
} as const;

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}
