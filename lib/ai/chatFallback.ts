import { ChatAction, ChatResponse, ChatTurn } from "@/types";
import { ChatContextInput } from "./chatPrompt";

const REPORT_WORDS = ["report", "file a complaint", "log a", "flag this", "submit"];
const AUTHORITY_WORDS = ["authority", "contact", "who do i", "whom do i", "escalate", "department"];

export type FallbackReason = "not_configured" | "provider_error";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function findMatchingArea(text: string, ctx: ChatContextInput) {
  const lower = normalize(text);
  return ctx.areaStates.find((a) => lower.includes(normalize(a.name)) || lower.includes(normalize(a.id).replace(/-/g, " ")));
}

/**
 * Rule-based stand-in for the LLM chat provider — same philosophy as
 * lib/ai/fallback.ts for complaint analysis: the assistant must never go
 * fully silent just because an API key isn't configured, especially not
 * mid-demo. It can still answer the single most common question ("is it
 * safe in X") directly from live data, and still trigger real UI actions.
 */
export function chatFallback(messages: ChatTurn[], ctx: ChatContextInput, reason: FallbackReason = "not_configured"): ChatResponse {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content ?? "";
  const lower = normalize(text);
  const actions: ChatAction[] = [];

  const area = findMatchingArea(text, ctx);

  if (area) {
    actions.push({ type: "fly_to_area", areaId: area.id, areaName: area.name });

    const rain = ctx.weather && ctx.weather.precipitationMm > 0.5;
    const topCats = area.dominantCategories.slice(0, 2).join(" and ") || "no dominant category yet";
    const levelWord =
      area.risk.level === "critical" ? "critical" : area.risk.level === "moderate" ? "moderate" : "low";

    let reply =
      `${area.name} is currently at ${levelWord} risk (score ${area.risk.score}/100, trend ${area.risk.trend}), ` +
      `driven mainly by ${topCats} reports (${area.complaintCount} total, ${area.recentComplaintCount} in the last 24h).`;
    if (rain) {
      reply += ` Rain in the forecast is amplifying this risk — flooding and drainage issues are worth watching here.`;
    }
    if (wantsReport(lower)) {
      actions.push({ type: "open_report_form", areaId: area.id });
      reply += ` Opening the report form for ${area.name} now.`;
    }

    return { reply, actions, degraded: true, message: fallbackNotice(reason) };
  }

  if (wantsReport(lower)) {
    actions.push({ type: "open_report_form" });
    return {
      reply: "Opening the report form so you can log the issue — pick the area and category and I'll factor it into that area's risk score right away.",
      actions,
      degraded: true,
      message: fallbackNotice(reason),
    };
  }

  if (wantsAuthority(lower)) {
    actions.push({ type: "open_authorities" });
    return {
      reply: "Here's the authority directory — it maps each issue category (electricity, water, flooding, roads, waste, sewage) to the civic department that handles it.",
      actions,
      degraded: true,
      message: fallbackNotice(reason),
    };
  }

  const topRisk = [...ctx.areaStates].sort((a, b) => b.risk.score - a.risk.score).slice(0, 3);
  const topList = topRisk.map((a) => `${a.name} (${a.risk.score}/100, ${a.risk.level})`).join(", ");
  const openingLine =
    reason === "provider_error"
      ? "The live AI provider didn't respond just now, so I'm answering from the local analysis engine instead"
      : "I'm running on the local analysis engine right now (no live AI key configured)";

  return {
    reply:
      `${openingLine}, but I can still read the current data directly: ` +
      `the highest-risk areas at the moment are ${topList || "not yet available"}. ` +
      `Ask me about a specific area (e.g. "is it safe in Korangi?"), or ask to report an issue or find the right authority.`,
    actions,
    degraded: true,
    message: fallbackNotice(reason),
  };
}

function wantsReport(lower: string): boolean {
  return REPORT_WORDS.some((w) => lower.includes(w));
}
function wantsAuthority(lower: string): boolean {
  return AUTHORITY_WORDS.some((w) => lower.includes(w));
}
function fallbackNotice(reason: FallbackReason): string {
  return reason === "provider_error"
    ? "Civic assistant fell back to the local analysis engine — the live AI provider request failed (check server logs for the underlying error, e.g. an invalid key or a decommissioned model name)."
    : "Civic assistant is running on the local analysis engine (no CHAT_PROVIDER_API_KEY configured).";
}
