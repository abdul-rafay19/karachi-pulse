import { AIAnalysis, ComplaintCategory, Severity } from "@/types";
import { CATEGORY_LABEL } from "@/lib/risk/calculateRisk";
import { WEATHER_SENSITIVE_CATEGORIES } from "@/lib/risk/riskTypes";
import { validateAIAnalysis } from "./schemas";

const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  electricity: ["electric", "power", "outage", "transformer", "voltage", "wire", "wiring", "breaker", "tripped", "shock"],
  water: ["water supply", "tap water", "no water", "pipeline", "contaminat", "dirty water", "low pressure"],
  flooding: ["waterlog", "flood", "standing water", "blocked drain", "accumulat", "submerg", "overflow onto road"],
  sewage: ["sewage", "manhole", "gutter", "sewer", "drain overflow", "foul smell"],
  roads: ["pothole", "road", "street", "obstruction", "debris", "crack", "collapsed road"],
  waste: ["garbage", "trash", "waste", "dump", "litter", "rubbish"],
  other: [],
};

const URGENCY_KEYWORDS = ["urgent", "immediately", "danger", "children", "elderly", "injury", "collapse", "emergency", "accident"];

const SEVERITY_BASE: Record<Severity, number> = {
  low: 20,
  moderate: 45,
  high: 70,
  critical: 95,
};

function detectCategory(description: string): ComplaintCategory {
  const lower = description.toLowerCase();
  let best: ComplaintCategory = "other";
  let bestHits = 0;
  for (const category of Object.keys(CATEGORY_KEYWORDS) as ComplaintCategory[]) {
    const hits = CATEGORY_KEYWORDS[category].filter((kw) => lower.includes(kw)).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = category;
    }
  }
  return best;
}

function extractKeywords(description: string, category: ComplaintCategory): string[] {
  const lower = description.toLowerCase();
  const found = CATEGORY_KEYWORDS[category].filter((kw) => lower.includes(kw));
  return found.slice(0, 6);
}

/**
 * Rule-based stand-in for Gemini. Deliberately simple and transparent —
 * this keeps the product working end-to-end even with zero AI API calls.
 */
export function analyzeComplaintFallback(input: {
  description: string;
  userSeverity?: Severity;
}): AIAnalysis {
  const description = input.description || "";
  const category = detectCategory(description);
  const keywords = extractKeywords(description, category);

  const baseSeverity = input.userSeverity ? SEVERITY_BASE[input.userSeverity] : 45;
  const urgencyHits = URGENCY_KEYWORDS.filter((kw) => description.toLowerCase().includes(kw)).length;
  const lengthSignal = Math.min(15, Math.floor(description.length / 40));

  const severity = Math.min(100, baseSeverity + urgencyHits * 8 + lengthSignal);
  const urgency = Math.min(100, baseSeverity * 0.6 + urgencyHits * 15 + lengthSignal);

  const weatherSensitive = WEATHER_SENSITIVE_CATEGORIES.includes(category);
  const label = CATEGORY_LABEL[category];

  return validateAIAnalysis(
    {
      category,
      severity,
      urgency,
      weatherSensitive,
      keywords: keywords.length ? keywords : [category],
      summary: `This looks like a ${label.toLowerCase()} issue. It has been logged and factored into the area's risk calculation.`,
      possibleImpacts: DEFAULT_IMPACTS[category],
      recommendedActions: DEFAULT_ACTIONS[category],
      safetyPrecautions: DEFAULT_PRECAUTIONS[category],
    },
    "fallback"
  );
}

const DEFAULT_IMPACTS: Record<ComplaintCategory, string[]> = {
  electricity: ["power disruption", "risk to appliances", "possible safety hazard"],
  water: ["water shortage", "hygiene concerns"],
  flooding: ["road flooding", "traffic disruption", "property access problems"],
  sewage: ["health hazard", "foul odor", "contamination risk"],
  roads: ["traffic disruption", "vehicle damage risk"],
  waste: ["health hazard", "unpleasant environment", "pest attraction"],
  other: ["local disruption"],
};

const DEFAULT_ACTIONS: Record<ComplaintCategory, string[]> = {
  electricity: ["Avoid touching exposed wiring", "Report to K-Electric", "Unplug sensitive appliances if voltage is unstable"],
  water: ["Store safe drinking water if supply is disrupted", "Report to KWSC"],
  flooding: ["Avoid the affected road if possible", "Report additional waterlogging", "Keep vehicles away from standing water"],
  sewage: ["Avoid contact with overflow", "Report to KWSC", "Keep children away from the area"],
  roads: ["Use alternate routes where available", "Drive carefully near the reported spot"],
  waste: ["Avoid dumping further waste nearby", "Report to the sanitation board"],
  other: ["Report additional details if the situation changes"],
};

const DEFAULT_PRECAUTIONS: Record<ComplaintCategory, string[]> = {
  electricity: ["Do not touch fallen wires or exposed wiring", "Keep children away from the area"],
  water: ["Boil or filter water if contamination is suspected"],
  flooding: ["Do not drive through deep standing water", "Avoid exposed electrical infrastructure near water"],
  sewage: ["Avoid direct contact with sewage water", "Wash hands thoroughly if exposed"],
  roads: ["Slow down near the affected stretch", "Watch for pedestrians avoiding the hazard"],
  waste: ["Avoid prolonged exposure to the site", "Keep the area away from food storage"],
  other: ["Follow general safety awareness in the area"],
};
