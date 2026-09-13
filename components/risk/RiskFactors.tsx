import { RiskFactor } from "@/types";

export function RiskFactors({ factors }: { factors: RiskFactor[] }) {
  if (factors.length === 0) {
    return <p className="text-sm text-[var(--muted)]">Not enough data yet to explain this score.</p>;
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {factors.map((f, i) => (
        <li key={i} className="flex gap-2.5 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--sand)] flex-shrink-0" />
          <div>
            <p className="font-medium">{f.label}</p>
            <p className="text-[var(--muted)] text-xs mt-0.5">{f.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
