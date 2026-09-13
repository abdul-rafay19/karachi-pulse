import { NextRequest, NextResponse } from "next/server";
import { runChatTurn } from "@/lib/ai/chatProvider";
import { chatProviderName, isChatConfigured } from "@/lib/ai/chatClient";
import { ChatTurn } from "@/types";
import { AreaState, DashboardMetrics, WeatherSnapshot } from "@/types";

const MAX_TURNS_IN = 20;

function isValidTurn(t: unknown): t is ChatTurn {
  if (!t || typeof t !== "object") return false;
  const { role, content } = t as Record<string, unknown>;
  return (role === "user" || role === "assistant") && typeof content === "string" && content.trim().length > 0;
}

// Lets the UI show a live "Powered by Groq" / "Local engine" badge instead of
// the user having to guess (or dig through server logs) whether the chat
// provider env vars actually took effect.
export async function GET() {
  return NextResponse.json({
    configured: isChatConfigured(),
    provider: isChatConfigured() ? chatProviderName() : null,
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, context } = (body ?? {}) as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages[] is required" }, { status: 400 });
  }
  const turns = messages.filter(isValidTurn).slice(-MAX_TURNS_IN);
  if (turns.length === 0) {
    return NextResponse.json({ error: "No valid messages provided" }, { status: 400 });
  }

  const ctxRaw = (context ?? {}) as Record<string, unknown>;
  const areaStates = Array.isArray(ctxRaw.areaStates) ? (ctxRaw.areaStates as AreaState[]) : [];
  const metrics = (ctxRaw.metrics ?? {
    totalReports: 0,
    highRiskAreas: 0,
    moderateRiskAreas: 0,
    lowRiskAreas: 0,
    rainAffectedAreas: 0,
    reportsToday: 0,
  }) as DashboardMetrics;
  const weather = (ctxRaw.weather ?? null) as WeatherSnapshot | null;

  const result = await runChatTurn(turns, { areaStates, metrics, weather });
  return NextResponse.json(result);
}
