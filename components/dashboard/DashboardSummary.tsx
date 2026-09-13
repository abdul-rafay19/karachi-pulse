import { AlertTriangle, CloudRain, FileText, Gauge, TrendingUp } from "lucide-react";
import { DashboardMetrics } from "@/types";
import { MetricCard } from "./MetricCard";

export function DashboardSummary({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <MetricCard label="Total reports" value={metrics.totalReports} icon={FileText} accent="var(--teal)" />
      <MetricCard
        label="Critical areas"
        value={metrics.highRiskAreas}
        icon={AlertTriangle}
        accent="var(--risk-critical)"
      />
      <MetricCard
        label="Moderate areas"
        value={metrics.moderateRiskAreas}
        icon={Gauge}
        accent="var(--risk-moderate)"
      />
      <MetricCard
        label="Rain-affected areas"
        value={metrics.rainAffectedAreas}
        icon={CloudRain}
        accent="var(--teal)"
      />
      <MetricCard label="Reports today" value={metrics.reportsToday} icon={TrendingUp} accent="var(--sand)" />
    </div>
  );
}
