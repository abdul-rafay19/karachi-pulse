"use client";

import { AreaState } from "@/types";
import { RISK_LEVEL_META } from "@/lib/ui/riskColors";
import { CATEGORY_META } from "@/lib/ui/categoryMeta";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function RiskInsightsList({
  areaStates,
  onSelect,
}: {
  areaStates: AreaState[];
  onSelect: (areaId: string) => void;
}) {
  const ranked = [...areaStates].sort((a, b) => b.risk.score - a.risk.score);

  if (ranked.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No areas match the current filters.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ranked.map((area) => {
        const meta = RISK_LEVEL_META[area.risk.level];
        const TrendIcon =
          area.risk.trend === "increasing" ? TrendingUp : area.risk.trend === "improving" ? TrendingDown : Minus;
        const topCategory = area.dominantCategories[0];

        return (
          <button
            key={area.id}
            onClick={() => onSelect(area.id)}
            className="kp-card text-left px-4 py-4 hover:border-[var(--muted)] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{area.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {area.complaintCount} report{area.complaintCount === 1 ? "" : "s"}
                  {topCategory && <> · {CATEGORY_META[topCategory].label}</>}
                </p>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0"
                style={{ background: meta.soft, color: meta.color }}
              >
                {area.risk.score}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span style={{ color: meta.color }}>{meta.label}</span>
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <TrendIcon size={12} />
                {area.risk.trend}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
