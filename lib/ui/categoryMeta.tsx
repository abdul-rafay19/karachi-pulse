import {
  Zap,
  Droplet,
  Waves,
  Construction,
  Trash2,
  Biohazard,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import { ComplaintCategory } from "@/types";

export const CATEGORY_META: Record<
  ComplaintCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  electricity: { label: "Electricity", icon: Zap, color: "#f0c94a" },
  water: { label: "Water", icon: Droplet, color: "#4ac0f0" },
  flooding: { label: "Drainage / Flooding", icon: Waves, color: "#4a90f0" },
  roads: { label: "Roads", icon: Construction, color: "#f0a83c" },
  waste: { label: "Waste / Sanitation", icon: Trash2, color: "#8fd15c" },
  sewage: { label: "Sewage", icon: Biohazard, color: "#c77dd6" },
  other: { label: "Other", icon: CircleHelp, color: "#9aa8c0" },
};

export const CATEGORY_OPTIONS: ComplaintCategory[] = [
  "electricity",
  "water",
  "flooding",
  "roads",
  "waste",
  "sewage",
  "other",
];
