import { AIAnalysis, Severity } from "@/types";
import { buildAreaSummary } from "@/lib/risk/areaSummary";
import { analyzeComplaintFallback } from "./fallback";
import { analyzeComplaintWithGemini, isGeminiConfigured, summarizeAreaWithGemini } from "./gemini";

export interface AnalyzeComplaintInput {
  description: string;
  areaName: string;
  userSeverity?: Severity;
}

export interface AnalyzeComplaintResult {
  analysis: AIAnalysis;
  degraded: boolean;
  message?: string;
}

/**
 * Citizen complaint -> AI understanding -> structured signals.
 * Gemini first, deterministic fallback second. The caller should never see
 * a bare API error — the pipeline always resolves to a usable AIAnalysis.
 */
export async function analyzeComplaint(
  input: AnalyzeComplaintInput
): Promise<AnalyzeComplaintResult> {
  if (!isGeminiConfigured()) {
    return {
      analysis: analyzeComplaintFallback(input),
      degraded: true,
      message:
        "AI analysis is running on the platform's local analysis engine (no Gemini API key configured).",
    };
  }

  try {
    const analysis = await analyzeComplaintWithGemini(input);
    return { analysis, degraded: false };
  } catch {
    return {
      analysis: analyzeComplaintFallback(input),
      degraded: true,
      message:
        "AI analysis is temporarily unavailable. Risk calculations are continuing using the platform's local analysis engine.",
    };
  }
}

export async function generateAreaSummary(input: {
  areaName: string;
  riskScore: number;
  riskLevel: string;
  dominantCategories: string[];
  complaintCount: number;
  trend: string;
  rainExpected: boolean;
}): Promise<string> {
  const templateSummary = buildAreaSummary(input);
  if (!isGeminiConfigured()) return templateSummary;

  try {
    const aiSummary = await summarizeAreaWithGemini(input);
    return aiSummary ?? templateSummary;
  } catch {
    return templateSummary;
  }
}
