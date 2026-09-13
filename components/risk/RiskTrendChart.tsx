import { useState } from "react";
import { Complaint } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = 7;

function bucketByDay(complaints: Complaint[], now: number): number[] {
  const buckets = new Array(DAYS).fill(0);
  for (const c of complaints) {
    const ageMs = now - new Date(c.createdAt).getTime();
    if (ageMs < 0) continue;
    const dayIndex = Math.floor(ageMs / DAY_MS);
    if (dayIndex < DAYS) buckets[DAYS - 1 - dayIndex] += 1;
  }
  return buckets;
}

export function RiskTrendChart({ complaints }: { complaints: Complaint[] }) {
  // Lazy init keeps "now" a one-time snapshot rather than an impure call
  // re-evaluated on every render.
  const [now] = useState(() => Date.now());
  const buckets = bucketByDay(complaints, now);
  const max = Math.max(1, ...buckets);

  const width = 280;
  const height = 64;
  const stepX = width / (DAYS - 1);

  const points = buckets.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * (height - 10) - 4;
    return [x, y] as const;
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
        <path d={areaPath} fill="var(--teal-soft)" stroke="none" />
        <path d={path} fill="none" stroke="var(--teal)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="var(--teal)" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
