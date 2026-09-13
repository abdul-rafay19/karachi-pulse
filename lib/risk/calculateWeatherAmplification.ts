import { Complaint, WeatherSnapshot } from "@/types";
import { WEATHER_SENSITIVE_CATEGORIES, clamp } from "./riskTypes";

/**
 * Converts raw precipitation into a 0-100 "weather risk" baseline.
 * Bands roughly follow the product brief:
 *   no rain -> 0
 *   light   -> 10-20
 *   moderate-> 25-40
 *   heavy   -> 50-70
 *   extreme -> 70-100
 */
export function baseWeatherRisk(precipitationMm: number, probabilityPct: number): number {
  const p = clamp(probabilityPct, 0, 100) / 100;
  let band: number;
  if (precipitationMm <= 0) band = 0;
  else if (precipitationMm < 2.5) band = 10 + (precipitationMm / 2.5) * 10; // 10-20
  else if (precipitationMm < 7.5) band = 25 + ((precipitationMm - 2.5) / 5) * 15; // 25-40
  else if (precipitationMm < 15) band = 50 + ((precipitationMm - 7.5) / 7.5) * 20; // 50-70
  else band = 70 + Math.min(30, ((precipitationMm - 15) / 15) * 30); // 70-100

  // Probability tempers how much we trust the forecast will materialize.
  return clamp(band * (0.35 + 0.65 * p));
}

/**
 * Final weather amplification score for an area: the meteorological
 * baseline, scaled by how much of the area's complaint mix is actually
 * weather-sensitive (drainage/sewage/roads/electricity/water). A dry area
 * with only waste complaints should barely move on a rainy forecast.
 */
export function calculateWeatherAmplification(
  complaints: Complaint[],
  weather: WeatherSnapshot | null
): { score: number; relevanceShare: number } {
  if (!weather || complaints.length === 0) {
    return { score: 0, relevanceShare: 0 };
  }

  const sensitiveCount = complaints.filter((c) =>
    WEATHER_SENSITIVE_CATEGORIES.includes(c.category)
  ).length;
  const relevanceShare = sensitiveCount / complaints.length;

  // Even a "low relevance" area gets a small floor — storms affect general
  // mobility/infrastructure a little regardless of category mix.
  const relevanceFactor = 0.15 + 0.85 * relevanceShare;

  const base = baseWeatherRisk(weather.precipitationMm, weather.precipitationProbability);
  return { score: clamp(base * relevanceFactor), relevanceShare };
}
