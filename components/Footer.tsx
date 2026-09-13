"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

export function Footer({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <footer className="border-t border-[var(--border-soft)] mt-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 flex flex-col gap-4 text-xs text-[var(--muted)]">
        <p>
          Karachi Pulse is a hackathon MVP. Demo data is synthetic and generated for illustration — it does not
          represent verified government incident records. In production, the same pipeline can consume verified
          citizen and authority reports.
        </p>
        <p>
          Risk estimates are informational and based on available reports and weather data. They should not replace
          official emergency guidance.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-soft)]">
          <p>
            Map data &copy; OpenStreetMap contributors, tiles by CARTO. Weather data by Open-Meteo / open data
            providers.
          </p>
          <button
            onClick={() => {
              if (!confirming) {
                setConfirming(true);
                setTimeout(() => setConfirming(false), 3000);
                return;
              }
              setConfirming(false);
              onReset();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 hover:text-[var(--text)] flex-shrink-0"
          >
            <RotateCcw size={12} />
            {confirming ? "Click again to confirm reset" : "Reset demo data"}
          </button>
        </div>
      </div>
    </footer>
  );
}
