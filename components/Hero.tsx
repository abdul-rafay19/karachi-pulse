import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardMetrics } from "@/types";
import { LiveStatus } from "@/components/dashboard/LiveStatus";

export function Hero({
  metrics,
  onReport,
  onExplore,
  map,
}: {
  metrics: DashboardMetrics;
  onReport: () => void;
  onExplore: () => void;
  map: ReactNode;
}) {
  return (
    <section id="top" className="border-b border-[var(--border-soft)]">
      <div className="mx-auto max-w-[1400px] grid lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="px-4 sm:px-6 py-10 lg:py-14 flex flex-col justify-center gap-6 border-b lg:border-b-0 lg:border-r border-[var(--border-soft)]">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--sand-soft)] text-[var(--sand)] px-3 py-1 text-xs font-medium">
            Demo mode · synthetic Karachi incident data
          </span>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05]">
            See the risk.
            <br />
            Understand the problem.
            <br />
            <span className="italic">Act early.</span>
          </h1>
          <p className="text-[var(--muted)] leading-relaxed max-w-md">
            Karachi Pulse turns citizen reports and weather signals into a live area-risk map —
            helping communities understand emerging problems before they escalate.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onReport}>Report an Issue</Button>
            <Button variant="outline" onClick={onExplore}>
              Explore Risk Map <ArrowRight size={15} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="px-4 sm:px-6 py-3 border-b border-[var(--border-soft)]">
            <LiveStatus metrics={metrics} />
          </div>
          <div className="relative h-[420px] lg:h-auto lg:min-h-[560px]">{map}</div>
        </div>
      </div>
    </section>
  );
}
