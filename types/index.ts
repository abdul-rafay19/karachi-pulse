// Karachi Pulse — core data model
// Kept deliberately small and explicit so the risk engine, AI layer and UI
// all share one source of truth for shapes.

export type ComplaintCategory =
  | "electricity"
  | "water"
  | "flooding"
  | "roads"
  | "waste"
  | "sewage"
  | "other";

export type Severity = "low" | "moderate" | "high" | "critical";

export type RiskLevel = "low" | "moderate" | "critical";

export type Trend = "increasing" | "stable" | "improving";

export interface AIAnalysis {
  category: ComplaintCategory;
  severity: number; // 0-100
  urgency: number; // 0-100
  weatherSensitive: boolean;
  keywords: string[];
  summary: string;
  possibleImpacts: string[];
  recommendedActions: string[];
  safetyPrecautions: string[];
  source: "gemini" | "fallback";
}

export interface Complaint {
  id: string;
  category: ComplaintCategory;
  description: string;
  areaId: string;
  latitude: number;
  longitude: number;
  severity: number; // 0-100, resolved severity (blends user + AI)
  userSeverity?: Severity;
  urgency: number; // 0-100
  createdAt: string; // ISO timestamp
  aiAnalysis?: AIAnalysis;
  source: "demo" | "citizen";
  imageDataUrl?: string; // local preview only, never persisted to a server
}

export interface RiskBreakdown {
  volume: number; // 0-100
  severity: number; // 0-100
  urgency: number; // 0-100
  recency: number; // 0-100
  categoryHazard: number; // 0-100
  weatherAmplification: number; // 0-100
}

export interface RiskFactor {
  label: string;
  detail: string;
}

export interface WeatherSnapshot {
  fetchedAt: string;
  precipitationProbability: number; // %
  precipitationMm: number; // mm, next hours
  weatherCode: number;
  windSpeed: number;
  temperature: number;
  description: string;
  isFallback: boolean;
}

export interface RiskScore {
  score: number; // 0-100 final
  level: RiskLevel;
  breakdown: RiskBreakdown;
  trend: Trend;
  trendDeltaPct: number;
  factors: RiskFactor[];
  weatherAmplificationPoints: number;
}

export interface Area {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isDemoFocus?: boolean;
}

export interface AreaState extends Area {
  complaintCount: number;
  recentComplaintCount: number; // last 24h
  dominantCategories: ComplaintCategory[];
  risk: RiskScore;
  weather: WeatherSnapshot | null;
  aiSummary: string;
  lastUpdated: string;
}

export interface Authority {
  category: ComplaintCategory;
  name: string;
  description: string;
  channelLabel: string;
  url?: string;
}

export interface DashboardMetrics {
  totalReports: number;
  highRiskAreas: number;
  moderateRiskAreas: number;
  lowRiskAreas: number;
  rainAffectedAreas: number;
  reportsToday: number;
}

export type CategoryFilter = "all" | ComplaintCategory;
export type RiskFilter = "all" | RiskLevel;

// --- Civic assistant (chatbot) -------------------------------------------

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * A UI action the assistant asked the client to perform (e.g. fly the map
 * to an area, open the report form). Returned alongside the assistant's
 * natural-language reply so the chat is more than a Q&A box — it can
 * actually drive the app.
 */
export type ChatAction =
  | { type: "fly_to_area"; areaId: string; areaName: string }
  | { type: "open_report_form"; areaId?: string }
  | { type: "open_authorities"; category?: ComplaintCategory };

export interface ChatResponse {
  reply: string;
  actions: ChatAction[];
  degraded: boolean;
  message?: string;
}
