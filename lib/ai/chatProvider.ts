import { ChatAction, ChatResponse, ChatTurn, ComplaintCategory } from "@/types";
import { ChatMessage, createChatCompletion, isChatConfigured } from "./chatClient";
import { buildChatSystemPrompt, ChatContextInput } from "./chatPrompt";
import { CHAT_TOOLS } from "./chatTools";
import { chatFallback } from "./chatFallback";

const MAX_TURNS = 12; // cap conversation history sent per request
const MAX_MESSAGE_CHARS = 800;

function toChatMessages(turns: ChatTurn[]): ChatMessage[] {
  return turns
    .slice(-MAX_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE_CHARS) }));
}

/**
 * Turns a model tool_call into a concrete ChatAction the client can execute,
 * validating arguments against the live context so the model can't send the
 * UI to an area (or category) that doesn't actually exist.
 */
function resolveToolCall(
  name: string,
  rawArgs: string,
  ctx: ChatContextInput
): { action: ChatAction | null; toolResult: string } {
  let args: Record<string, unknown> = {};
  try {
    args = JSON.parse(rawArgs || "{}");
  } catch {
    args = {};
  }

  if (name === "fly_to_area") {
    const areaId = typeof args.areaId === "string" ? args.areaId : "";
    const area = ctx.areaStates.find((a) => a.id === areaId);
    if (!area) {
      return { action: null, toolResult: JSON.stringify({ status: "error", reason: "unknown areaId" }) };
    }
    return {
      action: { type: "fly_to_area", areaId: area.id, areaName: area.name },
      toolResult: JSON.stringify({
        status: "ok",
        area: area.name,
        score: area.risk.score,
        level: area.risk.level,
        trend: area.risk.trend,
      }),
    };
  }

  if (name === "open_report_form") {
    const areaId = typeof args.areaId === "string" ? args.areaId : undefined;
    const area = areaId ? ctx.areaStates.find((a) => a.id === areaId) : undefined;
    return {
      action: { type: "open_report_form", areaId: area?.id },
      toolResult: JSON.stringify({ status: "ok", formOpened: true, area: area?.name ?? null }),
    };
  }

  if (name === "open_authorities") {
    const category = typeof args.category === "string" ? (args.category as ComplaintCategory) : undefined;
    return {
      action: { type: "open_authorities", category },
      toolResult: JSON.stringify({ status: "ok", directoryOpened: true, category: category ?? null }),
    };
  }

  return { action: null, toolResult: JSON.stringify({ status: "error", reason: "unknown tool" }) };
}

export async function runChatTurn(turns: ChatTurn[], ctx: ChatContextInput): Promise<ChatResponse> {
  if (!isChatConfigured()) {
    return chatFallback(turns, ctx);
  }

  try {
    const systemPrompt = buildChatSystemPrompt(ctx);
    const conversation: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...toChatMessages(turns),
    ];

    const first = await createChatCompletion({ messages: conversation, tools: CHAT_TOOLS });

    if (!first.tool_calls || first.tool_calls.length === 0) {
      return {
        reply: (first.content || "").trim() || "I'm not sure how to answer that from the current data — try asking about a specific area.",
        actions: [],
        degraded: false,
      };
    }

    // Execute (virtually) each requested tool call, then ask the model for a
    // short final reply that acknowledges what just happened.
    const actions: ChatAction[] = [];
    const toolMessages: ChatMessage[] = [];
    for (const call of first.tool_calls.slice(0, 2)) {
      const { action, toolResult } = resolveToolCall(call.function.name, call.function.arguments, ctx);
      if (action) actions.push(action);
      toolMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: toolResult,
      });
    }

    const followUp = await createChatCompletion({
      messages: [...conversation, first, ...toolMessages],
      tools: CHAT_TOOLS,
      maxTokens: 250,
    });

    return {
      reply: (followUp.content || "").trim() || "Done.",
      actions,
      degraded: false,
    };
  } catch (err) {
    // Surface the real cause in server logs (visible in `vercel logs` /
    // the Vercel function log tab) — this is what actually tells you *why*
    // it fell back: invalid key, decommissioned model, network error, etc.
    console.error("[chatProvider] live AI call failed, falling back:", err);
    return chatFallback(turns, ctx, "provider_error");
  }
}
