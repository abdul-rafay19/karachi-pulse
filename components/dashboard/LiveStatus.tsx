import { DashboardMetrics } from "@/types";

export function LiveStatus({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--risk-low)] opacity-75 kp-pulse-ring" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--risk-low)]" />
        </span>
        <span className="font-medium">Live Karachi risk map</span>
      </span>
      <span className="text-[var(--muted)]">·</span>
      <StatusDot color="var(--risk-critical)" label={`${metrics.highRiskAreas} critical`} />
      <StatusDot color="var(--risk-moderate)" label={`${metrics.moderateRiskAreas} moderate`} />
      <StatusDot color="var(--risk-low)" label={`${metrics.lowRiskAreas} low risk`} />
      <span className="text-[var(--muted)] text-xs ml-auto">Updated just now</span>
    </div>
  );
}

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
