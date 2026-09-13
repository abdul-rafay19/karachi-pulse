import { Circle, Tooltip } from "react-leaflet";
import { AreaState } from "@/types";
import { RISK_LEVEL_META } from "@/lib/ui/riskColors";

export function RiskZone({
  area,
  isSelected,
  onSelect,
}: {
  area: AreaState;
  isSelected: boolean;
  onSelect: (areaId: string) => void;
}) {
  const meta = RISK_LEVEL_META[area.risk.level];

  return (
    <Circle
      center={[area.latitude, area.longitude]}
      radius={area.radiusMeters}
      pathOptions={{
        color: meta.color,
        fillColor: meta.color,
        fillOpacity: isSelected ? 0.38 : 0.22,
        weight: isSelected ? 3 : 1.5,
      }}
      eventHandlers={{
        click: () => onSelect(area.id),
      }}
    >
      <Tooltip direction="top" opacity={0.95} sticky>
        <div style={{ fontFamily: "var(--font-body), sans-serif" }}>
          <strong>{area.name}</strong>
          <br />
          {area.risk.score}/100 · {meta.label}
        </div>
      </Tooltip>
    </Circle>
  );
}
