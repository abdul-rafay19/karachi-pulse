"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AREAS, KARACHI_CENTER } from "@/data/areas";
import { buildAreaSummary } from "@/lib/risk/areaSummary";
import { CATEGORY_LABEL, calculateAreaRisk } from "@/lib/risk/calculateRisk";
import { ComplaintRepository } from "@/lib/storage/complaintRepository";
import { getCachedWeather, setCachedWeather } from "@/lib/storage/weatherCache";
import {
  AIAnalysis,
  AreaState,
  CategoryFilter,
  Complaint,
  DashboardMetrics,
  RiskFilter,
  Severity,
  WeatherSnapshot,
} from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SubmitComplaintInput {
  areaId: string;
  category: Complaint["category"];
  description: string;
  userSeverity: Severity;
  latitude: number;
  longitude: number;
  imageDataUrl?: string;
}

export interface SubmitComplaintOutcome {
  complaint: Complaint;
  degraded: boolean;
  message?: string;
}

function buildAreaStates(complaints: Complaint[], weather: WeatherSnapshot | null): AreaState[] {
  const now = Date.now();
  return AREAS.map((area) => {
    const areaComplaints = complaints.filter((c) => c.areaId === area.id);
    const risk = calculateAreaRisk(areaComplaints, weather, now);
    const recentComplaintCount = areaComplaints.filter(
      (c) => now - new Date(c.createdAt).getTime() <= DAY_MS
    ).length;

    const counts = new Map<string, number>();
    for (const c of areaComplaints) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    const dominantCategories = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat) as AreaState["dominantCategories"];

    const rainExpected = Boolean(weather && weather.precipitationMm > 0.5);

    const aiSummary = buildAreaSummary({
      areaName: area.name,
      riskLevel: risk.level,
      dominantCategories: dominantCategories.map((c) => CATEGORY_LABEL[c]),
      complaintCount: areaComplaints.length,
      trend: risk.trend,
      rainExpected,
    });

    return {
      ...area,
      complaintCount: areaComplaints.length,
      recentComplaintCount,
      dominantCategories,
      risk,
      weather,
      aiSummary,
      lastUpdated: new Date(now).toISOString(),
    };
  });
}

function buildMetrics(areaStates: AreaState[], complaints: Complaint[]): DashboardMetrics {
  const now = Date.now();
  const reportsToday = complaints.filter(
    (c) => now - new Date(c.createdAt).getTime() <= DAY_MS
  ).length;

  return {
    totalReports: complaints.length,
    highRiskAreas: areaStates.filter((a) => a.risk.level === "critical").length,
    moderateRiskAreas: areaStates.filter((a) => a.risk.level === "moderate").length,
    lowRiskAreas: areaStates.filter((a) => a.risk.level === "low").length,
    rainAffectedAreas: areaStates.filter((a) => a.risk.weatherAmplificationPoints > 3).length,
    reportsToday,
  };
}

export function useKarachiPulse() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [weatherDegraded, setWeatherDegraded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // Initial load: seed + citizen reports from localStorage. This reads an
  // external system (localStorage) on mount, so deferring the resulting
  // setState outside the synchronous effect body avoids cascading renders.
  useEffect(() => {
    queueMicrotask(() => {
      setComplaints(ComplaintRepository.getComplaints());
      setLoaded(true);
    });
  }, []);

  // Weather: fetch once, cache locally, fall back gracefully.
  useEffect(() => {
    const cached = getCachedWeather();
    if (cached) {
      queueMicrotask(() => setWeather(cached));
    }

    let cancelled = false;
    fetch(`/api/weather?lat=${KARACHI_CENTER.latitude}&lng=${KARACHI_CENTER.longitude}`)
      .then((res) => res.json())
      .then((data: { weather: WeatherSnapshot; degraded: boolean }) => {
        if (cancelled) return;
        setWeather(data.weather);
        setWeatherDegraded(data.degraded);
        if (!data.degraded) setCachedWeather(data.weather);
      })
      .catch(() => {
        if (cancelled) return;
        if (!cached) setWeatherDegraded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const areaStates = useMemo(() => buildAreaStates(complaints, weather), [complaints, weather]);
  const metrics = useMemo(() => buildMetrics(areaStates, complaints), [areaStates, complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (riskFilter !== "all") {
        const area = areaStates.find((a) => a.id === c.areaId);
        if (!area || area.risk.level !== riskFilter) return false;
      }
      return true;
    });
  }, [complaints, categoryFilter, riskFilter, areaStates]);

  const filteredAreaStates = useMemo(() => {
    return areaStates.filter((a) => {
      if (riskFilter !== "all" && a.risk.level !== riskFilter) return false;
      if (categoryFilter !== "all" && !a.dominantCategories.includes(categoryFilter)) return false;
      return true;
    });
  }, [areaStates, categoryFilter, riskFilter]);

  const submitComplaint = useCallback(
    async (input: SubmitComplaintInput): Promise<SubmitComplaintOutcome> => {
      const area = AREAS.find((a) => a.id === input.areaId);

      let analysis: AIAnalysis | undefined;
      let degraded = false;
      let message: string | undefined;

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: input.description,
            areaName: area?.name ?? "Karachi",
            userSeverity: input.userSeverity,
          }),
        });
        const data = await res.json();
        analysis = data.analysis;
        degraded = Boolean(data.degraded);
        message = data.message;
      } catch {
        degraded = true;
        message =
          "AI analysis is temporarily unavailable. Risk calculations are continuing using the platform's local analysis engine.";
      }

      const severityBase: Record<Severity, number> = { low: 20, moderate: 45, high: 70, critical: 95 };
      const resolvedSeverity = analysis
        ? Math.round((severityBase[input.userSeverity] + analysis.severity) / 2)
        : severityBase[input.userSeverity];

      const complaint: Complaint = {
        id: `citizen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        category: analysis?.category ?? input.category,
        description: input.description,
        areaId: input.areaId,
        latitude: input.latitude,
        longitude: input.longitude,
        severity: resolvedSeverity,
        userSeverity: input.userSeverity,
        urgency: analysis?.urgency ?? severityBase[input.userSeverity],
        createdAt: new Date().toISOString(),
        aiAnalysis: analysis,
        source: "citizen",
        imageDataUrl: input.imageDataUrl,
      };

      const next = ComplaintRepository.addComplaint(complaint);
      setComplaints(next);

      return { complaint, degraded, message };
    },
    []
  );

  const resetDemo = useCallback(() => {
    const fresh = ComplaintRepository.clearComplaints();
    setComplaints(fresh);
    setSelectedAreaId(null);
  }, []);

  return {
    loaded,
    complaints: filteredComplaints,
    allComplaints: complaints,
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
  };
}
