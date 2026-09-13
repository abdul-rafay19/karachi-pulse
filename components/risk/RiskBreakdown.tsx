import { RiskBreakdown as RiskBreakdownType } from "@/types";

const ROWS: Array<{ key: keyof RiskBreakdownType; label: string }> = [
  { key: "volume", label: "Complaint volume" },
  { key: "severity", label: "Severity" },
  { key: "urgency", label: "Urgency" },
  { key: "recency", label: "Recent activity" },
  { key: "categoryHazard", label: "Category hazard" },
  { key: "weatherAmplification", label: "Weather amplification" },
];

export function RiskBreakdown({ breakdown }: { breakdown: RiskBreakdownType }) {
  return (
    <div className="flex flex-col gap-3">
      {ROWS.map(({ key, label }) => {
        const value = Math.round(breakdown[key]);
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--muted)]">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--panel-2)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--teal)] transition-all duration-500"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
