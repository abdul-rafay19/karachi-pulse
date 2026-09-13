import { WeatherSnapshot } from "@/types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

// WMO weather codes -> short human description (subset relevant to Karachi's climate).
const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export interface OpenMeteoParams {
  latitude: number;
  longitude: number;
}

/**
 * Fetches a compact current + near-term forecast snapshot from Open-Meteo.
 * No API key is required for the free non-commercial tier.
 */
export async function fetchOpenMeteo({
  latitude,
  longitude,
}: OpenMeteoParams): Promise<WeatherSnapshot> {
  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set("current", "precipitation,rain,weather_code,wind_speed_10m,temperature_2m");
  url.searchParams.set("hourly", "precipitation_probability,precipitation");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "Asia/Karachi");

  const res = await fetch(url.toString(), {
    // Open-Meteo responses change hourly at most — avoid hammering it.
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo request failed with status ${res.status}`);
  }

  const data = await res.json();

  const currentPrecip: number = data?.current?.precipitation ?? data?.current?.rain ?? 0;
  const weatherCode: number = data?.current?.weather_code ?? 0;
  const windSpeed: number = data?.current?.wind_speed_10m ?? 0;
  const temperature: number = data?.current?.temperature_2m ?? 0;

  // Look at the next 6 hours of hourly data for a near-term rain outlook.
  const hourlyTimes: string[] = data?.hourly?.time ?? [];
  const hourlyProb: number[] = data?.hourly?.precipitation_probability ?? [];
  const hourlyPrecip: number[] = data?.hourly?.precipitation ?? [];

  const nowIso = new Date().toISOString().slice(0, 13);
  let startIdx = hourlyTimes.findIndex((t) => t.slice(0, 13) >= nowIso);
  if (startIdx < 0) startIdx = 0;
  const window = 6;
  const probSlice = hourlyProb.slice(startIdx, startIdx + window);
  const precipSlice = hourlyPrecip.slice(startIdx, startIdx + window);

  const maxProb = probSlice.length ? Math.max(...probSlice) : 0;
  const totalPrecip = precipSlice.length
    ? precipSlice.reduce((a, b) => a + b, 0)
    : currentPrecip;

  return {
    fetchedAt: new Date().toISOString(),
    precipitationProbability: Math.round(maxProb),
    precipitationMm: Math.round(Math.max(totalPrecip, currentPrecip) * 10) / 10,
    weatherCode,
    windSpeed: Math.round(windSpeed * 10) / 10,
    temperature: Math.round(temperature * 10) / 10,
    description: WEATHER_CODE_LABELS[weatherCode] ?? "Conditions unavailable",
    isFallback: false,
  };
}

/** Deterministic "demo weather" used only when Open-Meteo is unreachable. */
export function fallbackWeather(): WeatherSnapshot {
  return {
    fetchedAt: new Date().toISOString(),
    precipitationProbability: 55,
    precipitationMm: 8,
    weatherCode: 61,
    windSpeed: 14,
    temperature: 31,
    description: "Light rain (demo estimate)",
    isFallback: true,
  };
}
