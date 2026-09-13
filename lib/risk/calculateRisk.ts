import {
  Complaint,
  ComplaintCategory,
  RiskBreakdown,
  RiskFactor,
  RiskLevel,
  RiskScore,
  WeatherSnapshot,
} from "@/types";
import { calculateTrend } from "./calculateTrend";
import { calculateWeatherAmplification } from "./calculateWeatherAmplification";
import { CATEGORY_HAZARD_BASE, RISK_WEIGHTS, clamp } from "./riskTypes";

const RECENCY_DECAY_HOURS = 36;
const VOLUME_DECAY = 3;

function recencyWeight(createdAt: string, now: number): number {
  const ageHours = Math.max(0, (now - new Date(createdAt).getTime()) / 36e5);
  return Math.exp(-ageHours / RECENCY_DECAY_HOURS);
}

function volumeScore(count: number): number {
  if (count === 0) return 0;
  return clamp(100 * (1 - Math.exp(-count / VOLUME_DECAY)));
}

function severityScore(complaints: Complaint[]): number {
  if (complaints.length === 0) return 0;
  const values = complaints.map((c) => clamp(c.severity));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  return clamp(mean * 0.55 + max * 0.45);
}

function urgencyScore(complaints: Complaint[]): number {
  if (complaints.length === 0) return 0;
  const values = complaints.map((c) => clamp(c.urgency));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  return clamp(mean * 0.6 + max * 0.4);
}

function recencyScore(complaints: Complaint[], now: number): number {
  if (complaints.length === 0) return 0;
  const weights = complaints.map((c) => recencyWeight(c.createdAt, now));
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
  const max = Math.max(...weights);
  return clamp((mean * 0.5 + max * 0.5) * 100);
}

function categoryHazardScore(complaints: Complaint[]): {
  score: number;
  dominant: ComplaintCategory[];
} {
  if (complaints.length === 0) return { score: 0, dominant: [] };
  const counts = new Map<ComplaintCategory, number>();
  for (const c of complaints) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);

  let weightedSum = 0;
  let totalWeight = 0;
  for (const [category, count] of counts) {
    weightedSum += CATEGORY_HAZARD_BASE[category] * count;
    totalWeight += count;
  }
  const score = clamp(weightedSum / Math.max(1, totalWeight));

  const dominant = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  return { score, dominant };
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 40) return "moderate";
  return "low";
}

function buildFactors(
  complaints: Complaint[],
  breakdown: RiskBreakdown,
  trendResult: ReturnType<typeof calculateTrend>,
  dominant: ComplaintCategory[],
  weather: WeatherSnapshot | null,
  weatherRelevanceShare: number
): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const total = complaints.length;

  factors.push({
    label: `${total} report${total === 1 ? "" : "s"} on record`,
    detail:
      total === 0
        ? "No reports have been logged for this area yet."
        : `${trendResult.last24h} in the last 24 hours, ${trendResult.previous24h} in the 24 hours before that.`,
  });

  if (dominant.length > 0) {
    const label = dominant.map((d) => CATEGORY_LABEL[d]).join(", ");
    factors.push({
      label: `${CATEGORY_LABEL[dominant[0]]} is the dominant issue`,
      detail: `Most reports in this area fall under: ${label}.`,
    });
  }

  if (trendResult.trend === "increasing") {
    factors.push({
      label: `Activity increased ${Math.abs(trendResult.deltaPct)}%`,
      detail: "Report volume is rising compared to the previous 24 hours.",
    });
  } else if (trendResult.trend === "improving") {
    factors.push({
      label: `Activity down ${Math.abs(trendResult.deltaPct)}%`,
      detail: "Report volume is falling compared to the previous 24 hours.",
    });
  }

  if (weather && breakdown.weatherAmplification > 5) {
    factors.push({
      label:
        weather.precipitationMm > 0
          ? `Rain expected (${weather.precipitationProbability}% chance)`
          : "Weather conditions monitored",
      detail:
        weatherRelevanceShare > 0.3
          ? "Forecast rainfall is likely to compound existing drainage/infrastructure issues here."
          : "Rainfall has a limited effect on this area's current issue mix.",
    });
  }

  if (breakdown.severity >= 70) {
    factors.push({
      label: "Reports skew high-severity",
      detail: "Multiple reports are marked high or critical severity.",
    });
  }

  return factors;
}

export const CATEGORY_LABEL: Record<ComplaintCategory, string> = {
  electricity: "Electricity",
  water: "Water",
  flooding: "Drainage / Flooding",
  roads: "Roads",
  waste: "Waste / Sanitation",
  sewage: "Sewage",
  other: "Other",
};

/**
 * Computes the full deterministic risk score for one area's complaint set.
 * AI never sets this number directly — it only supplies per-complaint
 * signals (category/severity/urgency) that feed into this formula.
 */
export function calculateAreaRisk(
  complaints: Complaint[],
  weather: WeatherSnapshot | null,
  now: number = Date.now()
): RiskScore {
  const volume = volumeScore(complaints.length);
  const severity = severityScore(complaints);
  const urgency = urgencyScore(complaints);
  const recency = recencyScore(complaints, now);
  const { score: categoryHazard, dominant } = categoryHazardScore(complaints);
  const { score: weatherAmplification, relevanceShare } = calculateWeatherAmplification(
    complaints,
    weather
  );

  const breakdown: RiskBreakdown = {
    volume,
    severity,
    urgency,
    recency,
    categoryHazard,
    weatherAmplification,
  };

  const rawScore =
    volume * RISK_WEIGHTS.volume +
    severity * RISK_WEIGHTS.severity +
    urgency * RISK_WEIGHTS.urgency +
    recency * RISK_WEIGHTS.recency +
    categoryHazard * RISK_WEIGHTS.categoryHazard +
    weatherAmplification * RISK_WEIGHTS.weatherAmplification;

  const score = Math.round(clamp(rawScore));
  const level = levelFromScore(score);
  const trendResult = calculateTrend(complaints, now);

  const factors = buildFactors(
    complaints,
    breakdown,
    trendResult,
    dominant,
    weather,
    relevanceShare
  );

  return {
    score,
    level,
    breakdown,
    trend: trendResult.trend,
    trendDeltaPct: trendResult.deltaPct,
    factors,
    weatherAmplificationPoints: Math.round(
      weatherAmplification * RISK_WEIGHTS.weatherAmplification
    ),
  };
}
