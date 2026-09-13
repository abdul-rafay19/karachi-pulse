import { RiskScore } from "@/types";
import { RISK_LEVEL_META } from "@/lib/ui/riskColors";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function RiskScoreDisplay({ risk }: { risk: RiskScore }) {
  const meta = RISK_LEVEL_META[risk.level];

  const TrendIcon =
    risk.trend === "increasing" ? TrendingUp : risk.trend === "improving" ? TrendingDown : Minus;
  const trendLabel =
    risk.trend === "increasing" ? "Increasing" : risk.trend === "improving" ? "Improving" : "Stable";
  const trendColor =
    risk.trend === "increasing"
      ? "var(--risk-critical)"
      : risk.trend === "improving"
      ? "var(--risk-low)"
      : "var(--muted)";

  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-6xl leading-none" style={{ color: meta.color }}>
            {risk.score}
          </span>
          <span className="text-[var(--muted)] text-lg">/100</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
            style={{ background: meta.soft, color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-[var(--muted)] text-xs">Based on reports, severity, activity, trend &amp; weather</span>
        </div>
      </div>
      <div className="flex flex-col items-end text-sm" style={{ color: trendColor }}>
        <div className="flex items-center gap-1">
          <TrendIcon size={16} />
          <span>{trendLabel}</span>
        </div>
        {risk.trend !== "stable" && (
          <span className="text-xs text-[var(--muted)]">{Math.abs(risk.trendDeltaPct)}% vs prior 24h</span>
        )}
      </div>
    </div>
  );
}
