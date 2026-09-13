import { Severity } from "@/types";

export const ANALYSIS_SYSTEM_PROMPT = `You are the analysis layer inside Karachi Pulse, a citizen complaint and area-risk monitoring tool for Karachi, Pakistan.

Given one citizen complaint, extract structured signals only. You do NOT decide the area's final risk score — a separate deterministic engine does that using the signals you provide.

Rules:
- Respond with strict JSON matching the given schema, nothing else.
- severity and urgency are integers from 0-100.
- Be conservative and calm. Never claim certainty about disasters.
- keywords: short lowercase phrases pulled from the description (max 6).
- summary: 1-2 plain-English sentences, citizen-friendly, no jargon.
- recommendedActions and safetyPrecautions: practical, non-alarmist, max 4 each.
- possibleImpacts: short phrases, max 4.
- weatherSensitive: true only if rain/weather would plausibly worsen this specific issue (drainage, sewage, roads, electricity, water supply).`;

export function buildAnalysisPrompt(input: {
  description: string;
  areaName: string;
  userSeverity?: Severity;
}): string {
  return `Complaint description: "${input.description}"
Reported area: ${input.areaName}
Citizen-selected severity (may be inaccurate, use as a hint only): ${input.userSeverity ?? "not provided"}

Return only the JSON object.`;
}

export function buildAreaSummaryPrompt(input: {
  areaName: string;
  riskScore: number;
  riskLevel: string;
  dominantCategories: string[];
  complaintCount: number;
  trend: string;
  rainExpected: boolean;
}): string {
  return `Write a 1-3 sentence, plain-English summary for citizens about ${input.areaName}'s current situation.

Risk score: ${input.riskScore}/100 (${input.riskLevel})
Dominant issues: ${input.dominantCategories.join(", ") || "none reported"}
Total reports: ${input.complaintCount}
Trend: ${input.trend}
Rain expected: ${input.rainExpected ? "yes" : "no"}

Do not mention scores or engine internals. Do not claim certainty. Return plain text only, no markdown, no quotes.`;
}
