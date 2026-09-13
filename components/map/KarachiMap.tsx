"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { KARACHI_CENTER, getAreaById } from "@/data/areas";
import { AreaState, Complaint } from "@/types";
import { RiskZone } from "./RiskZone";
import { ComplaintMarker } from "./ComplaintMarker";

function FlyToController({ target }: { target: { lat: number; lng: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom ?? 13, { duration: 0.9 });
  }, [target, map]);
  return null;
}

export function KarachiMap({
  areaStates,
  complaints,
  selectedAreaId,
  onSelectArea,
  flyTo,
  showComplaints = true,
}: {
  areaStates: AreaState[];
  complaints: Complaint[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
  flyTo: { lat: number; lng: number; zoom?: number } | null;
  showComplaints?: boolean;
}) {
  return (
    <MapContainer
      center={[KARACHI_CENTER.latitude, KARACHI_CENTER.longitude]}
      zoom={11}
      className="h-full w-full"
      scrollWheelZoom
      zoomControl
      attributionControl
    >
      {/*
        Standard OpenStreetMap raster tiles — no API key, ever. CARTO's
        "dark_all" free tier now gates behind a key (the "API key required"
        watermark), so we use keyless OSM tiles and recreate the dark
        aesthetic with a CSS filter on the tile pane (see .kp-tile-dark in
        globals.css). Zero external dependency beyond OSM's public tile CDN.
      */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
        className="kp-tile-dark"
      />
      <FlyToController target={flyTo} />

      {areaStates.map((area) => (
        <RiskZone
          key={area.id}
          area={area}
          isSelected={area.id === selectedAreaId}
          onSelect={onSelectArea}
        />
      ))}

      {showComplaints &&
        complaints.map((c) => (
          <ComplaintMarker key={c.id} complaint={c} areaName={getAreaById(c.areaId)?.name ?? "Karachi"} />
        ))}
    </MapContainer>
  );
}
