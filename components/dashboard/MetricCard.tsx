import { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="kp-card px-4 py-3.5 flex items-center gap-3">
      <div
        className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? `${accent}22` : "var(--panel-2)" }}
      >
        <Icon size={17} style={{ color: accent ?? "var(--muted)" }} />
      </div>
      <div>
        <p className="font-display text-xl leading-none">{value}</p>
        <p className="text-xs text-[var(--muted)] mt-1">{label}</p>
      </div>
    </div>
  );
}
