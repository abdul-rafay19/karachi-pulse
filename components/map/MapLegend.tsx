import { RISK_LEVEL_META } from "@/lib/ui/riskColors";

export function MapLegend() {
  return (
    <div className="kp-card px-3.5 py-3 text-xs shadow-lg">
      <p className="text-[var(--muted)] mb-2 font-medium">Area risk</p>
      <div className="flex flex-col gap-1.5">
        {(["low", "moderate", "critical"] as const).map((level) => {
          const meta = RISK_LEVEL_META[level];
          return (
            <div key={level} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: meta.color }}
              />
              <span>{meta.label}</span>
              <span className="text-[var(--muted)]">{meta.range}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
