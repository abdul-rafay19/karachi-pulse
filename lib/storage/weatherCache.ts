import { WeatherSnapshot } from "@/types";

const CACHE_KEY = "karachi-pulse:weather-cache:v1";
const CACHE_MAX_AGE_MS = 1000 * 60 * 30;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCachedWeather(): WeatherSnapshot | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as WeatherSnapshot;
    const age = Date.now() - new Date(snapshot.fetchedAt).getTime();
    if (age > CACHE_MAX_AGE_MS) return snapshot; // stale but still better than nothing
    return snapshot;
  } catch {
    return null;
  }
}

export function setCachedWeather(snapshot: WeatherSnapshot): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage unavailable — weather simply won't be cached, non-fatal.
  }
}
