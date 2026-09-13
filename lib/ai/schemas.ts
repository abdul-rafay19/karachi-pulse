import { AIAnalysis, ComplaintCategory } from "@/types";

export const VALID_CATEGORIES: ComplaintCategory[] = [
  "electricity",
  "water",
  "flooding",
  "roads",
  "waste",
  "sewage",
  "other",
];

// JSON schema handed to Gemini's structured-output mode. Keeping it here
// (rather than inline in the prompt) means the AI call site and the
// validator below can never drift apart.
export const AI_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", enum: VALID_CATEGORIES },
    severity: { type: "number" },
    urgency: { type: "number" },
    weatherSensitive: { type: "boolean" },
    keywords: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    possibleImpacts: { type: "array", items: { type: "string" } },
    recommendedActions: { type: "array", items: { type: "string" } },
    safetyPrecautions: { type: "array", items: { type: "string" } },
  },
  required: [
    "category",
    "severity",
    "urgency",
    "weatherSensitive",
    "keywords",
    "summary",
    "possibleImpacts",
    "recommendedActions",
    "safetyPrecautions",
  ],
} as const;

function clampNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

function toStringArray(value: unknown, max = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, max);
}

/**
 * Validates and coerces a raw (possibly malformed) AI JSON response into a
 * safe AIAnalysis object. Never throws — callers should trust the shape of
 * whatever this returns, even if every field had to be defaulted.
 */
export function validateAIAnalysis(
  raw: unknown,
  source: "gemini" | "fallback"
): AIAnalysis {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  const category = VALID_CATEGORIES.includes(obj.category as ComplaintCategory)
    ? (obj.category as ComplaintCategory)
    : "other";

  return {
    category,
    severity: clampNumber(obj.severity, 45),
    urgency: clampNumber(obj.urgency, 40),
    weatherSensitive: typeof obj.weatherSensitive === "boolean" ? obj.weatherSensitive : false,
    keywords: toStringArray(obj.keywords),
    summary:
      typeof obj.summary === "string" && obj.summary.trim().length > 0
        ? obj.summary.trim().slice(0, 400)
        : "This report is being tracked as part of the area's overall risk picture.",
    possibleImpacts: toStringArray(obj.possibleImpacts, 5),
    recommendedActions: toStringArray(obj.recommendedActions, 5),
    safetyPrecautions: toStringArray(obj.safetyPrecautions, 5),
    source,
  };
}
