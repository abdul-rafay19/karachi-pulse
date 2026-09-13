import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { Complaint } from "@/types";
import { CATEGORY_META } from "@/lib/ui/categoryMeta";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 36e5);
  if (hours < 1) return "Reported recently";
  if (hours < 24) return `Reported ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Reported ${days}d ago`;
}

function severityLabel(severity: number): string {
  if (severity >= 85) return "Critical";
  if (severity >= 65) return "High";
  if (severity >= 35) return "Moderate";
  return "Low";
}

function buildIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};
      border:2px solid rgba(10,15,26,0.85);
      box-shadow:0 0 0 2px ${color}55;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function ComplaintMarker({ complaint, areaName }: { complaint: Complaint; areaName: string }) {
  const meta = CATEGORY_META[complaint.category];
  const icon = buildIcon(meta.color);

  return (
    <Marker position={[complaint.latitude, complaint.longitude]} icon={icon}>
      <Popup>
        <div style={{ fontFamily: "var(--font-body), sans-serif", fontSize: 13, lineHeight: 1.45 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{meta.label}</div>
          <div style={{ color: "var(--muted)", marginBottom: 6 }}>
            Severity: {severityLabel(complaint.severity)} · {timeAgo(complaint.createdAt)}
          </div>
          <div style={{ marginBottom: 6 }}>Area: {areaName}</div>
          <div style={{ fontStyle: "italic" }}>
            &ldquo;{complaint.description.slice(0, 110)}
            {complaint.description.length > 110 ? "…" : ""}&rdquo;
          </div>
          {complaint.source === "demo" && (
            <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>Demo / synthetic report</div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
