export interface AreaSummaryInput {
  areaName: string;
  riskLevel: string;
  dominantCategories: string[];
  complaintCount: number;
  trend: string;
  rainExpected: boolean;
}

/**
 * Generates the citizen-facing area summary directly from structured data.
 * Deliberately not an AI call: recomputing 24 areas' summaries on every
 * complaint update would burn API quota for little benefit when the
 * underlying facts (category mix, trend, rain) already tell the story.
 */
export function buildAreaSummary(input: AreaSummaryInput): string {
  if (input.complaintCount === 0) {
    return `${input.areaName} has no active reports right now. Risk levels are being monitored as new reports come in.`;
  }

  const issue = input.dominantCategories[0]?.toLowerCase() ?? "general";
  const trendPhrase =
    input.trend === "increasing"
      ? "report activity has been rising"
      : input.trend === "improving"
      ? "report activity has been easing"
      : "report activity has stayed steady";

  const rainPhrase = input.rainExpected
    ? " Expected rainfall could add further strain to this area."
    : "";

  return `${input.areaName} is currently showing ${input.riskLevel} risk, driven mainly by ${issue} reports. Recently, ${trendPhrase}.${rainPhrase}`;
}
