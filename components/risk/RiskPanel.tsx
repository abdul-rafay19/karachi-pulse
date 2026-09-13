import { AreaState, Complaint } from "@/types";
import { RiskScoreDisplay } from "./RiskScoreDisplay";
import { RiskBreakdown } from "./RiskBreakdown";
import { RiskTrendChart } from "./RiskTrendChart";
import { RiskFactors } from "./RiskFactors";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { AuthorityCard } from "@/components/authority/AuthorityCard";
import { CATEGORY_META } from "@/lib/ui/categoryMeta";
import { getAuthorityFor } from "@/data/authorities";
import { ShieldAlert, ListChecks } from "lucide-react";

export function RiskPanel({
  area,
  complaints,
}: {
  area: AreaState;
  complaints: Complaint[];
}) {
  const areaComplaints = complaints
    .filter((c) => c.areaId === area.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const topCategory = area.dominantCategories[0];
  const authority = getAuthorityFor(topCategory ?? "other");

  // Pool recommendations/precautions across the most recent reports so the
  // panel reflects what's actually happening in the area right now.
  const recentAnalyses = areaComplaints.slice(0, 5).map((c) => c.aiAnalysis).filter(Boolean);
  const recommendedActions = dedupe(recentAnalyses.flatMap((a) => a?.recommendedActions ?? [])).slice(0, 5);
  const safetyPrecautions = dedupe(recentAnalyses.flatMap((a) => a?.safetyPrecautions ?? [])).slice(0, 4);

  return (
    <div className="px-5 pb-8 pt-8 flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-1">Area risk</p>
        <h2 className="font-display text-2xl">{area.name}</h2>
      </div>

      <RiskScoreDisplay risk={area.risk} />

      {area.dominantCategories.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Main issues</p>
          <div className="flex flex-wrap gap-2">
            {area.dominantCategories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel-2)] px-3 py-1 text-xs"
                >
                  <Icon size={13} style={{ color: meta.color }} />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Activity, last 7 days</p>
        <RiskTrendChart complaints={areaComplaints} />
      </div>

      <WeatherCard weather={area.weather} weatherAmplificationPoints={area.risk.weatherAmplificationPoints} />

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Why this risk?</p>
        <RiskFactors factors={area.risk.factors} />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Risk breakdown</p>
        <RiskBreakdown breakdown={area.risk.breakdown} />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">Summary</p>
        <p className="text-sm leading-relaxed">{area.aiSummary}</p>
      </div>

      {recommendedActions.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2 flex items-center gap-1.5">
            <ListChecks size={14} /> Recommended actions
          </p>
          <ul className="flex flex-col gap-1.5">
            {recommendedActions.map((a, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-[var(--teal)]">–</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {safetyPrecautions.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2 flex items-center gap-1.5">
            <ShieldAlert size={14} /> Safety precautions
          </p>
          <ul className="flex flex-col gap-1.5">
            {safetyPrecautions.map((a, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-[var(--risk-moderate)]">–</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AuthorityCard authority={authority} />

      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-2">
          Recent reports ({areaComplaints.length})
        </p>
        <div className="flex flex-col gap-2">
          {areaComplaints.length === 0 && (
            <p className="text-sm text-[var(--muted)]">No reports in this area yet.</p>
          )}
          {areaComplaints.slice(0, 6).map((c) => {
            const meta = CATEGORY_META[c.category];
            const Icon = meta.icon;
            return (
              <div key={c.id} className="kp-panel-2 rounded-[12px] p-3 text-sm">
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-1">
                  <Icon size={13} style={{ color: meta.color }} />
                  {meta.label}
                  <span>· {timeAgo(c.createdAt)}</span>
                  {c.source === "demo" && <span className="ml-auto italic">demo</span>}
                </div>
                <p className="leading-snug">{c.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-[var(--muted)] leading-relaxed border-t border-[var(--border-soft)] pt-4">
        Risk estimates are informational and based on available reports and weather data. They should not replace
        official emergency guidance.
      </p>
    </div>
  );
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 36e5);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
