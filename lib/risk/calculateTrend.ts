import { Complaint, Trend } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface TrendResult {
  trend: Trend;
  deltaPct: number;
  last24h: number;
  previous24h: number;
}

/**
 * Compares complaint volume in the last 24h against the 24h window before
 * that. This is a deliberately simple, explainable signal — not a
 * statistical forecast.
 */
export function calculateTrend(
  complaints: Complaint[],
  now: number = Date.now()
): TrendResult {
  let last24h = 0;
  let previous24h = 0;

  for (const c of complaints) {
    const ageMs = now - new Date(c.createdAt).getTime();
    if (ageMs < 0) continue;
    if (ageMs <= DAY_MS) last24h += 1;
    else if (ageMs <= DAY_MS * 2) previous24h += 1;
  }

  const deltaPct =
    previous24h === 0
      ? last24h === 0
        ? 0
        : 100
      : ((last24h - previous24h) / previous24h) * 100;

  let trend: Trend = "stable";
  if (last24h > previous24h && deltaPct >= 15) trend = "increasing";
  else if (last24h < previous24h && deltaPct <= -15) trend = "improving";

  return { trend, deltaPct: Math.round(deltaPct), last24h, previous24h };
}
