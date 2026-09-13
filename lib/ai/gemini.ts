import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysis, Severity } from "@/types";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt, buildAreaSummaryPrompt } from "./prompts";
import { AI_ANALYSIS_JSON_SCHEMA, validateAIAnalysis } from "./schemas";

// The exact model name lives in env config so it can be swapped the moment
// Google changes which model carries the free tier, with no code changes.
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function getClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export class GeminiUnavailableError extends Error {}

export async function analyzeComplaintWithGemini(input: {
  description: string;
  areaName: string;
  userSeverity?: Severity;
}): Promise<AIAnalysis> {
  const client = getClient();
  if (!client) throw new GeminiUnavailableError("GEMINI_API_KEY is not configured");

  const model = client.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: AI_ANALYSIS_JSON_SCHEMA as never,
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(buildAnalysisPrompt(input));
  const text = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiUnavailableError("Gemini returned malformed JSON");
  }

  return validateAIAnalysis(parsed, "gemini");
}

export async function summarizeAreaWithGemini(input: {
  areaName: string;
  riskScore: number;
  riskLevel: string;
  dominantCategories: string[];
  complaintCount: number;
  trend: string;
  rainExpected: boolean;
}): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { temperature: 0.4, maxOutputTokens: 200 },
    });
    const result = await model.generateContent(buildAreaSummaryPrompt(input));
    const text = result.response.text().trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
