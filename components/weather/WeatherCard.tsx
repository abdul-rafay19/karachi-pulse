import { CloudRain, Sun, CloudDrizzle } from "lucide-react";
import { WeatherSnapshot } from "@/types";

export function WeatherCard({
  weather,
  weatherAmplificationPoints,
}: {
  weather: WeatherSnapshot | null;
  weatherAmplificationPoints: number;
}) {
  if (!weather) {
    return (
      <div className="kp-panel-2 rounded-[14px] p-4 text-sm text-[var(--muted)]">
        Weather data is loading…
      </div>
    );
  }

  const Icon = weather.precipitationMm > 5 ? CloudRain : weather.precipitationMm > 0 ? CloudDrizzle : Sun;

  return (
    <div className="kp-panel-2 rounded-[14px] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Weather risk</p>
        {weather.isFallback && (
          <span className="text-[10px] text-[var(--muted)] bg-[var(--panel)] px-2 py-0.5 rounded-full">
            demo estimate
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Icon size={28} className="text-[var(--teal)]" />
        <div>
          <p className="font-medium text-sm">{weather.description}</p>
          <p className="text-xs text-[var(--muted)]">{weather.temperature}°C · wind {weather.windSpeed} km/h</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[var(--muted)] text-xs">Probability</p>
          <p className="font-medium">{weather.precipitationProbability}%</p>
        </div>
        <div>
          <p className="text-[var(--muted)] text-xs">Expected precipitation</p>
          <p className="font-medium">{weather.precipitationMm} mm</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--border-soft)] flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">Weather amplification</span>
        <span className="font-medium text-[var(--teal)]">+{weatherAmplificationPoints} risk points</span>
      </div>
    </div>
  );
}
