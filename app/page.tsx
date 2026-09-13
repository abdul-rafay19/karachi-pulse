"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { MapLegend } from "@/components/map/MapLegend";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { RiskInsightsList } from "@/components/dashboard/RiskInsightsList";
import { AuthorityDirectory } from "@/components/authority/AuthorityDirectory";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { ComplaintForm } from "@/components/complaint/ComplaintForm";
import { RiskPanel } from "@/components/risk/RiskPanel";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useKarachiPulse } from "@/lib/state/useKarachiPulse";
import { getAreaById } from "@/data/areas";

const KarachiMap = dynamic(() => import("@/components/map/KarachiMap").then((m) => m.KarachiMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-[var(--muted)] bg-[var(--ink-soft)]">
      Loading Karachi map…
    </div>
  ),
});

export default function Home() {
  const {
    loaded,
    complaints,
    areaStates,
    filteredAreaStates,
    metrics,
    weather,
    weatherDegraded,
    categoryFilter,
    setCategoryFilter,
    riskFilter,
    setRiskFilter,
    selectedAreaId,
    setSelectedAreaId,
    submitComplaint,
    resetDemo,
  } = useKarachiPulse();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportDefaultAreaId, setReportDefaultAreaId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  const selectedArea = useMemo(
    () => areaStates.find((a) => a.id === selectedAreaId) ?? null,
    [areaStates, selectedAreaId]
  );

  function handleSelectArea(areaId: string) {
    setSelectedAreaId(areaId);
    const area = getAreaById(areaId);
    if (area) setFlyTo({ lat: area.latitude, lng: area.longitude, zoom: 13 });
  }

  function scrollToMap() {
    document.getElementById("live-map")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleOpenReportForm(areaId?: string) {
    setReportDefaultAreaId(areaId ?? selectedAreaId ?? null);
    setReportOpen(true);
  }

  function handleOpenAuthorities() {
    document.getElementById("authorities")?.scrollIntoView({ behavior: "smooth" });
  }

  const mapNode = (
    <div className="relative h-full w-full">
      <KarachiMap
        areaStates={filteredAreaStates}
        complaints={complaints}
        selectedAreaId={selectedAreaId}
        onSelectArea={handleSelectArea}
        flyTo={flyTo}
      />
      <div className="absolute left-3 bottom-3 z-[400] hidden sm:block">
        <MapLegend />
      </div>
      {weatherDegraded && (
        <div className="absolute right-3 top-3 z-[400] kp-card px-3 py-1.5 text-xs text-[var(--risk-moderate)]">
          Weather running on demo estimate
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header onReport={() => handleOpenReportForm()} onOpenAssistant={() => setChatOpen(true)} />

      <Hero metrics={metrics} onReport={() => handleOpenReportForm()} onExplore={scrollToMap} map={mapNode} />

      <main className="flex-1">
        <section id="live-map" className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl mb-1">Live Karachi Risk Map</h2>
              <p className="text-[var(--muted)] text-sm max-w-xl">
                {loaded ? (
                  <>
                    Tracking {metrics.totalReports} report{metrics.totalReports === 1 ? "" : "s"} across{" "}
                    {areaStates.length} areas.
                  </>
                ) : (
                  "Loading Karachi Pulse…"
                )}
              </p>
            </div>
            <FiltersBar
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              riskFilter={riskFilter}
              onRiskChange={setRiskFilter}
              onSearchSelect={handleSelectArea}
            />
          </div>

          <DashboardSummary metrics={metrics} />
        </section>

        <section id="risk-insights" className="border-t border-[var(--border-soft)]">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl mb-1">Risk Insights</h2>
              <p className="text-[var(--muted)] text-sm max-w-xl">
                Areas ranked by current risk score. Click any card for the full breakdown, weather context, and
                recommended actions.
              </p>
            </div>
            <RiskInsightsList areaStates={filteredAreaStates} onSelect={handleSelectArea} />
          </div>
        </section>

        <section id="authorities" className="border-t border-[var(--border-soft)]">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl mb-1">Authorities</h2>
              <p className="text-[var(--muted)] text-sm max-w-xl">
                Karachi Pulse points citizens to the relevant official channel for each issue type. It does not
                submit reports on anyone&apos;s behalf.
              </p>
            </div>
            <AuthorityDirectory />
          </div>
        </section>
      </main>

      <Footer onReset={resetDemo} />

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report an Issue">
        <ComplaintForm
          defaultAreaId={reportDefaultAreaId}
          onSubmit={submitComplaint}
          onFinished={() => setReportOpen(false)}
        />
      </Modal>

      <Drawer open={Boolean(selectedArea)} onClose={() => setSelectedAreaId(null)}>
        {selectedArea && <RiskPanel area={selectedArea} complaints={complaints} />}
      </Drawer>

      <ChatWidget
        areaStates={areaStates}
        metrics={metrics}
        weather={weather}
        open={chatOpen}
        onOpenChange={setChatOpen}
        onFlyToArea={handleSelectArea}
        onOpenReportForm={handleOpenReportForm}
        onOpenAuthorities={handleOpenAuthorities}
      />
    </div>
  );
}
